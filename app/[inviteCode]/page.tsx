'use client'
import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Phone, Mail, User, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import CalendarComponent from '@/components/CalendarComponent'
import toast from 'react-hot-toast'

interface InviteData {
  is_valid: boolean
  professional_id: string
  client_email: string | null
  client_name: string | null
  expires_at: string
}

interface Professional {
  id: string
  slug: string
  name: string
  business_name: string
  logo_url?: string
  email: string
  phone: string
  address?: string
}

interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  color: string
}

export default function InviteBookingPage({ params }: { params: { inviteCode: string } }) {
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    validateInvite()
  }, [params.inviteCode])

  const validateInvite = async () => {
    try {
      setLoading(true)
      
      // Validar o código de convite
      const { data: inviteResult, error: inviteError } = await supabase
        .rpc('validate_invite_code', { p_invite_code: params.inviteCode })

      if (inviteError) throw inviteError

      if (!inviteResult || inviteResult.length === 0 || !inviteResult[0].is_valid) {
        setInviteData(null)
        setLoading(false)
        return
      }

      const invite = inviteResult[0]
      setInviteData(invite)

      // Carregar dados do profissional
      const { data: prof, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', invite.professional_id)
        .single()

      if (profError) throw profError
      setProfessional(prof)

      // Carregar serviços
      const { data: servs, error: servError } = await supabase
        .from('services')
        .select('*')
        .eq('professional_id', invite.professional_id)
        .eq('is_active', true)

      if (servError) throw servError
      setServices(servs)

      // Preencher dados do cliente se disponível
      if (invite.client_name) {
        setFormData(prev => ({ ...prev, name: invite.client_name! }))
      }
      if (invite.client_email) {
        setFormData(prev => ({ ...prev, email: invite.client_email! }))
      }

    } catch (error) {
      console.error('Erro ao validar convite:', error)
      toast.error('Erro ao validar convite')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedService || !selectedDate || !selectedTime || !formData.name || !formData.phone) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      setBookingLoading(true)

      // Calcular horário de fim
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const startDateTime = new Date(selectedDate)
      startDateTime.setHours(hours, minutes, 0, 0)
      
      const endDateTime = new Date(startDateTime)
      endDateTime.setMinutes(endDateTime.getMinutes() + selectedService.duration)

      // Criar agendamento
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          professional_id: professional!.id,
          service_id: selectedService.id,
          client_name: formData.name,
          client_email: formData.email || null,
          client_phone: formData.phone,
          date: selectedDate.toISOString().split('T')[0],
          start_time: selectedTime,
          end_time: endDateTime.toTimeString().slice(0, 5),
          status: 'pending'
        })

      if (appointmentError) throw appointmentError

      // Marcar convite como usado
      await supabase.rpc('mark_invite_used', { p_invite_code: params.inviteCode })

      toast.success('Agendamento realizado com sucesso!')
      
      // Limpar formulário
      setSelectedDate(null)
      setSelectedTime('')
      setFormData({ name: '', email: '', phone: '' })
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      toast.error('Erro ao criar agendamento')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando convite...</p>
        </div>
      </div>
    )
  }

  if (!inviteData?.is_valid || !professional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Convite Inválido</h1>
          <p className="text-gray-600 mb-4">
            Este link de convite não é válido, expirou ou já foi utilizado.
          </p>
          <p className="text-sm text-gray-500">
            Entre em contato com o profissional para solicitar um novo convite.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            {professional.logo_url && (
              <img 
                src={professional.logo_url} 
                alt={professional.business_name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{professional.business_name}</h1>
              <p className="text-gray-600">Agendamento via convite</p>
            </div>
          </div>
          
          {/* Informações de contato */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            {professional.address && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{professional.address}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>{professional.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>{professional.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendário */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Selecione uma Data
            </h2>
            <CalendarComponent
              professionalId={professional.id}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>

          {/* Formulário de agendamento */}
          <div className="space-y-6">
            {/* Seleção de serviço */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Escolha um Serviço
              </h2>
              <div className="space-y-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedService?.id === service.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-gray-600">{service.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.duration} min
                          </span>
                          <span className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: service.color }}></span>
                            R$ {service.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {selectedService?.id === service.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Seleção de horário */}
            {selectedService && selectedDate && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Escolha um Horário
                </h2>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0') + ':00'
                    return (
                      <button
                        key={hour}
                        onClick={() => setSelectedTime(hour)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedTime === hour
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {hour}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Formulário do cliente */}
            {selectedService && selectedDate && selectedTime && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Seus Dados
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Confirmando...
                      </>
                    ) : (
                      'Confirmar Agendamento'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
