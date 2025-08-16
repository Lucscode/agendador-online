'use client'

import { useState } from 'react'
import { User, Building, Mail, Phone, MapPin, Camera, Save, Copy, ExternalLink } from 'lucide-react'
import { Professional } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface ProfessionalSettingsProps {
  professional: Professional
  onProfessionalChange: (professional: Professional) => void
}

export default function ProfessionalSettings({ professional, onProfessionalChange }: ProfessionalSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: professional.name,
    business_name: professional.business_name,
    email: professional.email,
    phone: professional.phone,
    address: professional.address || '',
    logo_url: professional.logo_url || ''
  })

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      name: professional.name,
      business_name: professional.business_name,
      email: professional.email,
      phone: professional.phone,
      address: professional.address || '',
      logo_url: professional.logo_url || ''
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: professional.name,
      business_name: professional.business_name,
      email: professional.email,
      phone: professional.phone,
      address: professional.address || '',
      logo_url: professional.logo_url || ''
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.business_name || !formData.email || !formData.phone) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    const updatedProfessional: Professional = {
      ...professional,
      name: formData.name,
      business_name: formData.business_name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address || undefined,
      logo_url: formData.logo_url || undefined
    }

    // Em produção, isso seria uma atualização no Supabase
    onProfessionalChange(updatedProfessional)
    toast.success('Configurações atualizadas com sucesso!')
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const copyLink = () => {
    const link = `meuagendamento.com/${professional.slug}`
    navigator.clipboard.writeText(link)
    toast.success('Link copiado para a área de transferência!')
  }

  const openLink = () => {
    const link = `/${professional.slug}`
    window.open(link, '_blank')
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
    handleInputChange('phone', formatted)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Configurações do Perfil
          </h3>
          <p className="text-sm text-gray-600">
            Gerencie suas informações pessoais e do negócio
          </p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="btn-primary"
          >
            Editar Perfil
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Salvar</span>
            </button>
          </div>
        )}
      </div>

      {/* Link de Agendamento */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-primary-900 mb-1">
              Seu Link de Agendamento
            </h4>
            <p className="text-sm text-primary-700">
              Compartilhe este link com seus clientes para que possam agendar horários
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={copyLink}
              className="btn-secondary flex items-center space-x-2 px-3 py-2"
            >
              <Copy className="h-4 w-4" />
              <span>Copiar</span>
            </button>
            
            <button
              onClick={openLink}
              className="btn-primary flex items-center space-x-2 px-3 py-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Visualizar</span>
            </button>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-white rounded-lg border border-primary-200">
          <code className="text-primary-800 font-mono text-sm">
            meuagendamento.com/{professional.slug}
          </code>
        </div>
      </div>

      {/* Formulário de Configurações */}
      <div className="card">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">
          Informações do Perfil
        </h4>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome do Profissional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input-field pl-10"
                  placeholder="Seu nome completo"
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            {/* Nome do Negócio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Negócio *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  className="input-field pl-10"
                  placeholder="Nome da sua empresa/negócio"
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input-field pl-10"
                  placeholder="seu@email.com"
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="input-field pl-10"
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="input-field pl-10"
                  placeholder="Endereço completo do seu negócio"
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Logo URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Logo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Camera className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  className="input-field pl-10"
                  placeholder="https://exemplo.com/logo.png"
                  disabled={!isEditing}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Cole aqui o link da imagem do seu logo (opcional)
              </p>
            </div>
          </div>

          {/* Preview do Logo */}
          {formData.logo_url && (
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview do Logo
              </label>
              <div className="flex items-center space-x-4">
                <img
                  src={formData.logo_url}
                  alt="Preview do logo"
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="text-sm text-gray-600">
                  <p>Logo será exibido no cabeçalho da página de agendamento</p>
                  <p className="text-xs text-gray-500">
                    Recomendamos uma imagem quadrada de pelo menos 128x128 pixels
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Informações Adicionais */}
      <div className="card bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-900 mb-3">
          Dicas para um perfil profissional
        </h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Use uma foto de perfil clara e profissional</li>
          <li>• Descreva seus serviços de forma detalhada</li>
          <li>• Mantenha suas informações de contato atualizadas</li>
          <li>• Adicione um endereço para clientes que preferem ir até você</li>
          <li>• O link de agendamento é único e não pode ser alterado</li>
        </ul>
      </div>
    </div>
  )
}
