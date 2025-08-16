'use client'

import { useState } from 'react'
import { User, Mail, Phone } from 'lucide-react'

interface AppointmentFormProps {
  onSubmit: (formData: {
    clientName: string
    clientEmail: string
    clientPhone: string
  }) => void
}

export default function AppointmentForm({ onSubmit }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Nome é obrigatório'
    }

    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'Telefone é obrigatório'
    } else if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.clientPhone)) {
      newErrors.clientPhone = 'Telefone deve estar no formato (11) 99999-9999'
    }

    if (formData.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'E-mail deve ser válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica máscara (11) 99999-9999
    if (numbers.length <= 2) {
      return `(${numbers}`
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    handleInputChange('clientPhone', formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
      // O formulário será resetado pelo componente pai após sucesso
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome */}
      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
          Nome Completo *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="clientName"
            value={formData.clientName}
            onChange={(e) => handleInputChange('clientName', e.target.value)}
            className={`input-field pl-10 ${errors.clientName ? 'border-red-500' : ''}`}
            placeholder="Digite seu nome completo"
            disabled={isSubmitting}
          />
        </div>
        {errors.clientName && (
          <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
        )}
      </div>

      {/* E-mail */}
      <div>
        <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-2">
          E-mail (opcional)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="clientEmail"
            value={formData.clientEmail}
            onChange={(e) => handleInputChange('clientEmail', e.target.value)}
            className={`input-field pl-10 ${errors.clientEmail ? 'border-red-500' : ''}`}
            placeholder="seu@email.com"
            disabled={isSubmitting}
          />
        </div>
        {errors.clientEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Receba confirmação por e-mail
        </p>
      </div>

      {/* Telefone */}
      <div>
        <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-2">
          Telefone *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            id="clientPhone"
            value={formData.clientPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`input-field pl-10 ${errors.clientPhone ? 'border-red-500' : ''}`}
            placeholder="(11) 99999-9999"
            maxLength={15}
            disabled={isSubmitting}
          />
        </div>
        {errors.clientPhone && (
          <p className="mt-1 text-sm text-red-600">{errors.clientPhone}</p>
        )}
      </div>

      {/* Botão de Confirmação */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Confirmando...</span>
          </div>
        ) : (
          'Confirmar Agendamento'
        )}
      </button>

      {/* Informações Adicionais */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Ao confirmar, você concorda com nossos termos de uso e política de privacidade.
        </p>
      </div>
    </form>
  )
}
