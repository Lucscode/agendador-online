'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface CalendarComponentProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  professionalId: string
}

export default function CalendarComponent({ selectedDate, onDateSelect, professionalId }: CalendarComponentProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set())
  const [appointmentDates, setAppointmentDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadCalendarData()
  }, [currentMonth, professionalId])

  const loadCalendarData = async () => {
    try {
      const startDate = startOfMonth(currentMonth)
      const endDate = endOfMonth(currentMonth)
      
      // Buscar horários bloqueados no mês
      const { data: blockedTimes } = await supabase
        .from('blocked_times')
        .select('date')
        .eq('professional_id', professionalId)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))

      // Buscar agendamentos confirmados no mês
      const { data: appointments } = await supabase
        .from('appointments')
        .select('date')
        .eq('professional_id', professionalId)
        .eq('status', 'confirmed')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))

      const blocked = new Set(blockedTimes?.map(bt => bt.date) || [])
      const appointmentDates = new Set(appointments?.map(apt => apt.date) || [])

      setBlockedDates(blocked)
      setAppointmentDates(appointmentDates)
    } catch (error) {
      console.error('Erro ao carregar dados do calendário:', error)
    }
  }

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

  const getDayClasses = (day: Date) => {
    const baseClasses = 'w-10 h-10 flex items-center justify-center text-sm font-medium rounded-full transition-colors'
    
    if (isPast(day) && !isToday(day)) {
      return `${baseClasses} text-gray-400 cursor-not-allowed`
    }
    
    if (isToday(day)) {
      return `${baseClasses} bg-primary-100 text-primary-700 font-semibold`
    }
    
    if (selectedDate && isSameDay(day, selectedDate)) {
      return `${baseClasses} bg-primary-600 text-white`
    }
    
    if (blockedDates.has(format(day, 'yyyy-MM-dd'))) {
      return `${baseClasses} bg-red-100 text-red-600 cursor-not-allowed`
    }
    
    if (appointmentDates.has(format(day, 'yyyy-MM-dd'))) {
      return `${baseClasses} bg-yellow-100 text-yellow-700`
    }
    
    return `${baseClasses} text-gray-700 hover:bg-gray-100 cursor-pointer`
  }

  const handleDateClick = (day: Date) => {
    if (isPast(day) && !isToday(day)) return
    if (blockedDates.has(format(day, 'yyyy-MM-dd'))) return
    
    onDateSelect(day)
  }

  return (
    <div className="w-full">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dias da Semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Dias do Mês */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, index) => (
          <div
            key={index}
            className={getDayClasses(day)}
            onClick={() => handleDateClick(day)}
          >
            {format(day, 'd')}
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary-100 rounded-full"></div>
          <span className="text-gray-600">Hoje</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary-600 rounded-full"></div>
          <span className="text-gray-600">Selecionado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 rounded-full"></div>
          <span className="text-gray-600">Com agendamento</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 rounded-full"></div>
          <span className="text-gray-600">Indisponível</span>
        </div>
      </div>
    </div>
  )
}
