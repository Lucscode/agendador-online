'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react'
import { supabase, BlockedTime } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface BlockedTimeManagerProps {
  professionalId: string
}

export default function BlockedTimeManager({ professionalId }: BlockedTimeManagerProps) {
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    startTime: '08:00',
    endTime: '09:00',
    reason: ''
  })

  useEffect(() => {
    loadBlockedTimes()
  }, [professionalId])

  const loadBlockedTimes = async () => {
    try {
      // Em produção, isso viria do Supabase
      const demoBlockedTimes: BlockedTime[] = [
        {
          id: 'block-1',
          professional_id: professionalId,
          date: '2024-01-20',
          start_time: '12:00',
          end_time: '13:00',
          reason: 'Almoço',
          created_at: new Date().toISOString()
        },
        {
          id: 'block-2',
          professional_id: professionalId,
          date: '2024-01-25',
          start_time: '14:00',
          end_time: '16:00',
          reason: 'Reunião',
          created_at: new Date().toISOString()
        }
      ]
      
      setBlockedTimes(demoBlockedTimes)
    } catch (error) {
      console.error('Erro ao carregar horários bloqueados:', error)
      toast.error('Erro ao carregar horários bloqueados')
    }
  }

  const handleAddBlockedTime = () => {
    setIsAdding(true)
    setFormData({
      date: '',
      startTime: '08:00',
      endTime: '09:00',
      reason: ''
    })
  }

  const handleCancel = () => {
    setIsAdding(false)
    setFormData({
      date: '',
      startTime: '08:00',
      endTime: '09:00',
      reason: ''
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (formData.startTime >= formData.endTime) {
      toast.error('O horário de início deve ser anterior ao horário de fim')
      return
    }

    const newBlockedTime: BlockedTime = {
      id: `block-${Date.now()}`,
      professional_id: professionalId,
      date: formData.date,
      start_time: formData.startTime,
      end_time: formData.endTime,
      reason: formData.reason || undefined,
      created_at: new Date().toISOString()
    }

    // Em produção, isso seria uma inserção no Supabase
    setBlockedTimes(prev => [...prev, newBlockedTime])
    toast.success('Horário bloqueado com sucesso!')
    handleCancel()
  }

  const handleDeleteBlockedTime = (blockId: string) => {
    if (confirm('Tem certeza que deseja remover este bloqueio?')) {
      // Em produção, isso seria uma remoção no Supabase
      setBlockedTimes(prev => prev.filter(block => block.id !== blockId))
      toast.success('Bloqueio removido com sucesso!')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  const formatTime = (timeStr: string) => {
    return timeStr
  }

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    return diffHours
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Horários Bloqueados ({blockedTimes.length})
          </h3>
          <p className="text-sm text-gray-600">
            Bloqueie horários quando não estiver disponível
          </p>
        </div>
        
        <button
          onClick={handleAddBlockedTime}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Bloquear Horário</span>
        </button>
      </div>

      {/* Formulário de Adição */}
      {isAdding && (
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Novo Horário Bloqueado
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Horário de Início */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário de Início *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="input-field"
                  min="08:00"
                  max="18:00"
                  required
                />
              </div>

              {/* Horário de Fim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário de Fim *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="input-field"
                  min="08:00"
                  max="18:00"
                  required
                />
              </div>

              {/* Duração Calculada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração
                </label>
                <div className="input-field bg-gray-50 text-gray-700">
                  {getDuration(formData.startTime, formData.endTime)} horas
                </div>
              </div>
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo (opcional)
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                className="input-field"
                placeholder="Ex: Almoço, Reunião, Folga..."
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Bloquear Horário
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Horários Bloqueados */}
      <div className="space-y-4">
        {blockedTimes.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum horário bloqueado
            </h3>
            <p className="text-gray-600">
              Adicione horários bloqueados quando não estiver disponível para atendimento.
            </p>
          </div>
        ) : (
          blockedTimes.map((blockedTime) => (
            <div
              key={blockedTime.id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-red-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {formatDate(blockedTime.date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">
                          {formatTime(blockedTime.start_time)} - {formatTime(blockedTime.end_time)}
                        </span>
                      </div>
                    </div>
                    
                    {blockedTime.reason && (
                      <p className="text-sm text-gray-600">
                        Motivo: {blockedTime.reason}
                      </p>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      Duração: {getDuration(blockedTime.start_time, blockedTime.end_time)} horas
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteBlockedTime(blockedTime.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Informações Adicionais */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">
              Como funcionam os horários bloqueados?
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Os clientes não conseguirão agendar horários nos períodos bloqueados</li>
              <li>• Use para marcar almoço, reuniões, folgas ou outros compromissos</li>
              <li>• Os horários bloqueados aparecem em vermelho no calendário</li>
              <li>• Você pode bloquear horários parciais (ex: apenas das 12h às 13h)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
