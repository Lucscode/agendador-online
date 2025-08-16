'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Clock, MapPin, Phone, Mail, CheckCircle } from 'lucide-react'
import CalendarComponent from '@/components/CalendarComponent'
import ServiceList from '@/components/ServiceList'
import AppointmentForm from '@/components/AppointmentForm'
import { supabase, Professional, Service, Appointment } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function BookingPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    loadProfessionalData()
  }, [slug])

  useEffect(() => {
    if (selectedDate && selectedService) {
      loadAvailableTimes()
    }
  }, [selectedDate, selectedService])

  const loadProfessionalData = async () => {
    try {
      // Buscar profissional pelo slug
      const { data: prof, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .eq('slug', slug)
        .single()

      if (profError) throw profError

      setProfessional(prof)

      // Buscar serviços do profissional
      const { data: servs, error: servError } = await supabase
        .from('services')
        .select('*')
        .eq('professional_id', prof.id)
        .order('name')

      if (servError) throw servError

      setServices(servs)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados do profissional')
      setLoading(false)
    }
  }

  const loadAvailableTimes = async () => {
    if (!selectedDate || !selectedService) return

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      
      // Buscar horários bloqueados
      const { data: blockedTimes } = await supabase
        .from('blocked_times')
        .select('*')
        .eq('professional_id', professional!.id)
        .eq('date', dateStr)

      // Buscar agendamentos existentes
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', professional!.id)
        .eq('date', dateStr)
        .eq('status', 'confirmed')

      // Gerar horários disponíveis (8h às 18h, intervalos de 30min)
      const allTimes = []
      for (let hour = 8; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          allTimes.push(time)
        }
      }

      // Filtrar horários ocupados
      const occupiedTimes = new Set()
      
      // Adicionar horários bloqueados
      blockedTimes?.forEach(block => {
        for (let time = block.start_time; time < block.end_time; time = addMinutes(time, 30)) {
          occupiedTimes.add(time)
        }
      })

      // Adicionar horários de agendamentos
      appointments?.forEach(app => {
        for (let time = app.start_time; time < app.end_time; time = addMinutes(time, 30)) {
          occupiedTimes.add(time)
        }
      })

      // Filtrar horários disponíveis considerando duração do serviço
      const available = allTimes.filter(time => {
        const endTime = addMinutes(time, selectedService.duration)
        if (endTime >= '18:00') return false
        
        for (let t = time; t < endTime; t = addMinutes(t, 30)) {
          if (occupiedTimes.has(t)) return false
        }
        return true
      })

      setAvailableTimes(available)
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
      toast.error('Erro ao carregar horários disponíveis')
    }
  }

  const addMinutes = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const newHours = Math.floor(totalMinutes / 60)
    const newMins = totalMinutes % 60
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setSelectedTime('')
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime('')
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleBookingSubmit = async (formData: {
    clientName: string
    clientEmail: string
    clientPhone: string
  }) => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Por favor, selecione serviço, data e horário')
      return
    }

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const endTime = addMinutes(selectedTime, selectedService.duration)

      // Criar agendamento
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          professional_id: professional!.id,
          service_id: selectedService.id,
          client_name: formData.clientName,
          client_email: formData.clientEmail,
          client_phone: formData.clientPhone,
          date: dateStr,
          start_time: selectedTime,
          end_time: endTime,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Enviar e-mails (simulado - em produção seria com serviço de e-mail)
      console.log('E-mail enviado para profissional:', {
        to: professional!.email,
        subject: 'Novo Agendamento',
        body: `Novo agendamento de ${formData.clientName} para ${selectedService.name} em ${dateStr} às ${selectedTime}`
      })

      if (formData.clientEmail) {
        console.log('E-mail enviado para cliente:', {
          to: formData.clientEmail,
          subject: 'Agendamento Confirmado',
          body: `Seu horário foi agendado com sucesso para ${selectedService.name} em ${dateStr} às ${selectedTime}`
        })
      }

      toast.success('Agendamento realizado com sucesso!')
      setBookingSuccess(true)
      
      // Resetar seleções
      setSelectedService(null)
      setSelectedDate(null)
      setSelectedTime('')
      setAvailableTimes([])
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      toast.error('Erro ao realizar agendamento')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profissional não encontrado</h1>
          <p className="text-gray-600">O link de agendamento não é válido.</p>
        </div>
      </div>
    )
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <CheckCircle className="h-16 w-16 text-success-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agendamento Confirmado!</h1>
          <p className="text-gray-600 mb-6">
            Seu horário foi agendado com sucesso. Você receberá uma confirmação por e-mail em breve.
          </p>
          <button
            onClick={() => setBookingSuccess(false)}
            className="btn-primary"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <div className="flex items-center">
              {professional.logo_url ? (
                <img 
                  src={professional.logo_url} 
                  alt={professional.business_name}
                  className="h-12 w-12 rounded-lg mr-4"
                />
              ) : (
                <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-primary-600 font-semibold text-lg">
                    {professional.business_name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{professional.business_name}</h1>
                <p className="text-gray-600">{professional.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Calendário */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Selecione uma Data</h2>
              <CalendarComponent
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                professionalId={professional.id}
              />
            </div>

            {selectedDate && selectedService && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Horários Disponíveis</h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                        selectedTime === time
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {availableTimes.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum horário disponível nesta data
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Coluna Direita - Serviços e Formulário */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Serviços Disponíveis</h2>
              <ServiceList
                services={services}
                selectedService={selectedService}
                onServiceSelect={handleServiceSelect}
              />
            </div>

            {selectedService && selectedDate && selectedTime && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Agendamento</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Serviço:</span>
                    <span className="text-gray-700">{selectedService.name}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Data:</span>
                    <span className="text-gray-700">
                      {selectedDate.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Horário:</span>
                    <span className="text-gray-700">{selectedTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Valor:</span>
                    <span className="text-gray-700">
                      R$ {selectedService.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
                <AppointmentForm onSubmit={handleBookingSubmit} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
