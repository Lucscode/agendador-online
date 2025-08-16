'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isToday, isSameDay, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import { Appointment, Service } from '@/lib/supabase'

interface AdminCalendarProps {
  professionalId: string
  appointments: Appointment[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export default function AdminCalendar({ professionalId, appointments, selectedDate, onDateSelect }: AdminCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    // Em produção, isso viria do Supabase
    setServices([
      { id: 'service-1', name: 'Corte Masculino', color: '#3B82F6' } as Service,
      { id: 'service-2', name: 'Barba', color: '#10B981' } as Service,
      { id: 'service-3', name: 'Corte + Barba', color: '#F59E0B' } as Service,
    ])
  }, [])

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return appointments.filter(apt => apt.date === dateStr)
  }

  const getServiceColor = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    return service?.color || '#6B7280'
  }

  const getDayClasses = (day: Date) => {
    const baseClasses = 'w-full h-24 border border-gray-200 p-2 cursor-pointer transition-colors hover:bg-gray-50'
    
    if (isToday(day)) {
      return `${baseClasses} bg-blue-50 border-blue-300`
    }
    
    if (selectedDate && isSameDay(day, selectedDate)) {
      return `${baseClasses} bg-primary-50 border-primary-300`
    }
    
    return baseClasses
  }

  const handleDateClick = (day: Date) => {
    onDateSelect(day)
  }

  return (
    <div className="space-y-6">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <h3 className="text-xl font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendário */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Dias da Semana */}
        <div className="grid grid-cols-7 bg-gray-50">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do Mês */}
        <div className="grid grid-cols-7">
          {daysInMonth.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            
            return (
              <div
                key={index}
                className={getDayClasses(day)}
                onClick={() => handleDateClick(day)}
              >
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {format(day, 'd')}
                </div>
                
                {isCurrentMonth && dayAppointments.length > 0 && (
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((apt) => (
                      <div
                        key={apt.id}
                        className="text-xs p-1 rounded truncate"
                        style={{ 
                          backgroundColor: getServiceColor(apt.service_id) + '20',
                          color: getServiceColor(apt.service_id),
                          border: `1px solid ${getServiceColor(apt.service_id)}40`
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span className="truncate">{apt.start_time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span className="truncate">{apt.client_name}</span>
                        </div>
                      </div>
                    ))}
                    
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayAppointments.length - 3} mais
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Detalhes do Dia Selecionado */}
      {selectedDate && (
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Agendamentos para {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
          </h4>
          
          {getAppointmentsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhum agendamento para esta data
            </p>
          ) : (
            <div className="space-y-3">
              {getAppointmentsForDate(selectedDate).map((apt) => {
                const service = services.find(s => s.id === apt.service_id)
                return (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getServiceColor(apt.service_id) }}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-900">{apt.client_name}</p>
                        <p className="text-sm text-gray-600">{service?.name}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {apt.start_time} - {apt.end_time}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        apt.status === 'confirmed' 
                          ? 'bg-success-100 text-success-800'
                          : apt.status === 'pending'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-danger-100 text-danger-800'
                      }`}>
                        {apt.status === 'confirmed' ? 'Confirmado' : 
                         apt.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Legenda */}
      <div className="card">
        <h5 className="font-medium text-gray-900 mb-3">Legenda</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
              <span className="text-sm text-gray-600">Hoje</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary-50 border border-primary-300 rounded"></div>
              <span className="text-sm text-gray-600">Dia Selecionado</span>
            </div>
          </div>
          <div className="space-y-2">
            {services.map((service) => (
              <div key={service.id} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: service.color }}
                ></div>
                <span className="text-sm text-gray-600">{service.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
