'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, User, Phone, Mail, CheckCircle, XCircle, Download, Send, Filter } from 'lucide-react'
import { Appointment, Service } from '@/lib/supabase'

interface AppointmentListProps {
  appointments: Appointment[]
  services: Service[]
  onStatusChange: (appointmentId: string, status: 'confirmed' | 'cancelled') => void
  onExport: () => void
  onResendNotification: (appointmentId: string) => void
}

export default function AppointmentList({ 
  appointments, 
  services, 
  onStatusChange, 
  onExport, 
  onResendNotification 
}: AppointmentListProps) {
  const [filters, setFilters] = useState({
    status: 'all',
    service: 'all',
    date: ''
  })

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      if (filters.status !== 'all' && apt.status !== filters.status) return false
      if (filters.service !== 'all' && apt.service_id !== filters.service) return false
      if (filters.date && apt.date !== filters.date) return false
      return true
    })
  }, [appointments, filters])

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    return service?.name || 'Serviço não encontrado'
  }

  const getServiceColor = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    return service?.color || '#6B7280'
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', classes: 'bg-warning-100 text-warning-800' },
      confirmed: { label: 'Confirmado', classes: 'bg-success-100 text-success-800' },
      cancelled: { label: 'Cancelado', classes: 'bg-danger-100 text-danger-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.classes}`}>
        {config.label}
      </span>
    )
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const clearFilters = () => {
    setFilters({ status: 'all', service: 'all', date: '' })
  }

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Agendamentos ({filteredAppointments.length})
          </h3>
          <p className="text-sm text-gray-600">
            Gerencie todos os seus agendamentos
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onExport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h4 className="font-medium text-gray-900">Filtros</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input-field"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Serviço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serviço
            </label>
            <select
              value={filters.service}
              onChange={(e) => handleFilterChange('service', e.target.value)}
              className="input-field"
            >
              <option value="all">Todos os serviços</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Botão Limpar Filtros */}
        {(filters.status !== 'all' || filters.service !== 'all' || filters.date) && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de Agendamentos */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum agendamento encontrado
            </h3>
            <p className="text-gray-600">
              {filters.status !== 'all' || filters.service !== 'all' || filters.date
                ? 'Tente ajustar os filtros ou limpe-os para ver todos os agendamentos.'
                : 'Você ainda não tem agendamentos. Eles aparecerão aqui quando os clientes fizerem reservas.'}
            </p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                {/* Informações do Agendamento */}
                <div className="flex-1 space-y-3">
                  {/* Cabeçalho */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getServiceColor(appointment.service_id) }}
                      ></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {getServiceName(appointment.service_id)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {format(new Date(appointment.date), 'dd/MM/yyyy', { locale: ptBR })} às {appointment.start_time}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {getStatusBadge(appointment.status)}
                    </div>
                  </div>

                  {/* Informações do Cliente */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{appointment.client_name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{appointment.client_phone}</span>
                    </div>
                    
                    {appointment.client_email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{appointment.client_email}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {appointment.start_time} - {appointment.end_time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  {appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onStatusChange(appointment.id, 'confirmed')}
                        className="btn-success flex items-center justify-center space-x-2 px-4 py-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Confirmar</span>
                      </button>
                      
                      <button
                        onClick={() => onStatusChange(appointment.id, 'cancelled')}
                        className="btn-danger flex items-center justify-center space-x-2 px-4 py-2"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Cancelar</span>
                      </button>
                    </>
                  )}
                  
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => onStatusChange(appointment.id, 'cancelled')}
                      className="btn-danger flex items-center justify-center space-x-2 px-4 py-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Cancelar</span>
                    </button>
                  )}
                  
                  {appointment.client_email && (
                    <button
                      onClick={() => onResendNotification(appointment.id)}
                      className="btn-secondary flex items-center justify-center space-x-2 px-4 py-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>Reenviar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
