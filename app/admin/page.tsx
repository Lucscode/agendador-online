'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, Mail, Settings, Plus, Download, Send } from 'lucide-react'
import { supabase, Professional, Service, Appointment } from '@/lib/supabase'
import toast from 'react-hot-toast'
import AdminCalendar from '@/components/AdminCalendar'
import AppointmentList from '@/components/AppointmentList'
import ServiceManager from '@/components/ServiceManager'
import BlockedTimeManager from '@/components/BlockedTimeManager'
import ProfessionalSettings from '@/components/ProfessionalSettings'

type TabType = 'calendar' | 'appointments' | 'services' | 'blocked' | 'settings'

export default function AdminPage() {
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('calendar')
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    loadProfessionalData()
  }, [])

  useEffect(() => {
    if (professional) {
      loadServices()
      loadAppointments()
    }
  }, [professional])

  const loadProfessionalData = async () => {
    try {
      // Em produção, isso viria da autenticação
      // Por enquanto, vamos usar um profissional demo
      const demoProfessional: Professional = {
        id: 'demo-1',
        slug: 'joao-barbearia',
        name: 'João Silva',
        business_name: 'João Barbearia',
        logo_url: '',
        email: 'joao@barbearia.com',
        phone: '(11) 99999-9999',
        address: 'Rua das Flores, 123 - Centro, São Paulo',
        created_at: new Date().toISOString()
      }
      
      setProfessional(demoProfessional)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados do profissional')
      setLoading(false)
    }
  }

  const loadServices = async () => {
    try {
      // Em produção, isso viria do Supabase
      const demoServices: Service[] = [
        {
          id: 'service-1',
          professional_id: professional!.id,
          name: 'Corte Masculino',
          description: 'Corte tradicional masculino com acabamento perfeito',
          price: 35.00,
          duration: 30,
          color: '#3B82F6',
          created_at: new Date().toISOString()
        },
        {
          id: 'service-2',
          professional_id: professional!.id,
          name: 'Barba',
          description: 'Acabamento de barba com navalha',
          price: 25.00,
          duration: 20,
          color: '#10B981',
          created_at: new Date().toISOString()
        },
        {
          id: 'service-3',
          professional_id: professional!.id,
          name: 'Corte + Barba',
          description: 'Corte masculino completo com barba',
          price: 50.00,
          duration: 45,
          color: '#F59E0B',
          created_at: new Date().toISOString()
        }
      ]
      
      setServices(demoServices)
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
      toast.error('Erro ao carregar serviços')
    }
  }

  const loadAppointments = async () => {
    try {
      // Em produção, isso viria do Supabase
      const demoAppointments: Appointment[] = [
        {
          id: 'apt-1',
          professional_id: professional!.id,
          service_id: 'service-1',
          client_name: 'Carlos Santos',
          client_email: 'carlos@email.com',
          client_phone: '(11) 88888-8888',
          date: '2024-01-15',
          start_time: '14:00',
          end_time: '14:30',
          status: 'confirmed',
          created_at: new Date().toISOString()
        },
        {
          id: 'apt-2',
          professional_id: professional!.id,
          service_id: 'service-3',
          client_name: 'Pedro Oliveira',
          client_email: 'pedro@email.com',
          client_phone: '(11) 77777-7777',
          date: '2024-01-15',
          start_time: '15:00',
          end_time: '15:45',
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ]
      
      setAppointments(demoAppointments)
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      toast.error('Erro ao carregar agendamentos')
    }
  }

  const handleAppointmentStatusChange = async (appointmentId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      // Em produção, isso seria uma atualização no Supabase
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: newStatus }
            : apt
        )
      )
      
      toast.success(`Agendamento ${newStatus === 'confirmed' ? 'confirmado' : 'cancelado'} com sucesso!`)
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status do agendamento')
    }
  }

  const handleExportAppointments = () => {
    // Em produção, isso geraria um arquivo CSV/Excel
    const csvContent = appointments.map(apt => 
      `${apt.date},${apt.start_time},${apt.client_name},${apt.client_phone},${apt.status}`
    ).join('\n')
    
    const blob = new Blob([`Data,Hora,Cliente,Telefone,Status\n${csvContent}`], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `agendamentos-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Agendamentos exportados com sucesso!')
  }

  const handleResendNotification = async (appointmentId: string) => {
    try {
      const appointment = appointments.find(apt => apt.id === appointmentId)
      if (!appointment) return
      
      // Em produção, isso enviaria um e-mail real
      console.log('Reenviando notificação para:', appointment.client_email)
      
      toast.success('Notificação reenviada com sucesso!')
    } catch (error) {
      console.error('Erro ao reenviar notificação:', error)
      toast.error('Erro ao reenviar notificação')
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
          <p className="text-gray-600">Faça login para acessar o painel.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
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
                <p className="text-gray-600">Painel Administrativo</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Link público: <span className="font-mono text-primary-600">meuagendamento.com/{professional.slug}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'calendar', label: 'Calendário', icon: Calendar },
              { id: 'appointments', label: 'Agendamentos', icon: Clock },
              { id: 'services', label: 'Serviços', icon: Settings },
              { id: 'blocked', label: 'Horários Bloqueados', icon: Clock },
              { id: 'settings', label: 'Configurações', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="space-y-6">
          {activeTab === 'calendar' && (
            <AdminCalendar
              professionalId={professional.id}
              appointments={appointments}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentList
              appointments={appointments}
              services={services}
              onStatusChange={handleAppointmentStatusChange}
              onExport={handleExportAppointments}
              onResendNotification={handleResendNotification}
            />
          )}

          {activeTab === 'services' && (
            <ServiceManager
              services={services}
              onServicesChange={setServices}
            />
          )}

          {activeTab === 'blocked' && (
            <BlockedTimeManager
              professionalId={professional.id}
            />
          )}

          {activeTab === 'settings' && (
            <ProfessionalSettings
              professional={professional}
              onProfessionalChange={setProfessional}
            />
          )}
        </div>
      </div>
    </div>
  )
}
