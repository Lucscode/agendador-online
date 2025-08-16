'use client'

import { useState } from 'react'
import { ArrowLeft, Building, User, Mail, Phone, MapPin, Image, Palette, Clock, DollarSign, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface ClientFormData {
  // Dados do profissional
  name: string
  business_name: string
  email: string
  phone: string
  address: string
  logo_url: string
  
  // Tipo de negócio
  business_type: 'barbearia' | 'salao' | 'tatuagem' | 'consultorio' | 'custom'
  
  // Serviços personalizados (se business_type = 'custom')
  custom_services: Array<{
    name: string
    description: string
    price: string
    duration: string
    color: string
  }>
}

const businessTemplates = {
  barbearia: {
    name: 'Barbearia',
    description: 'Cortes masculinos, barba e tratamentos capilares',
    services: [
      { name: 'Corte Masculino', description: 'Corte tradicional masculino', price: '45.00', duration: '30', color: '#3B82F6' },
      { name: 'Barba', description: 'Acabamento de barba com navalha', price: '30.00', duration: '20', color: '#10B981' },
      { name: 'Corte + Barba', description: 'Corte masculino completo com barba', price: '65.00', duration: '45', color: '#F59E0B' },
      { name: 'Hidratação', description: 'Tratamento capilar', price: '25.00', duration: '15', color: '#8B5CF6' }
    ]
  },
  salao: {
    name: 'Salão de Beleza',
    description: 'Cortes femininos, coloração e tratamentos estéticos',
    services: [
      { name: 'Corte Feminino', description: 'Corte feminino com finalização', price: '60.00', duration: '45', color: '#EC4899' },
      { name: 'Coloração', description: 'Coloração completa', price: '120.00', duration: '120', color: '#F59E0B' },
      { name: 'Escova', description: 'Escova com finalização', price: '40.00', duration: '30', color: '#8B5CF6' },
      { name: 'Manicure', description: 'Manicure completa', price: '35.00', duration: '45', color: '#EF4444' },
      { name: 'Pedicure', description: 'Pedicure completa', price: '35.00', duration: '45', color: '#10B981' }
    ]
  },
  tatuagem: {
    name: 'Estúdio de Tatuagem',
    description: 'Tatuagens personalizadas e piercings',
    services: [
      { name: 'Tatuagem Pequena', description: 'Tatuagem até 5cm', price: '150.00', duration: '60', color: '#000000' },
      { name: 'Tatuagem Média', description: 'Tatuagem até 15cm', price: '300.00', duration: '120', color: '#374151' },
      { name: 'Tatuagem Grande', description: 'Tatuagem acima de 15cm', price: '500.00', duration: '240', color: '#6B7280' },
      { name: 'Cover-up', description: 'Cobertura de tatuagem', price: '400.00', duration: '180', color: '#DC2626' }
    ]
  },
  consultorio: {
    name: 'Consultório',
    description: 'Consultas médicas e exames',
    services: [
      { name: 'Consulta', description: 'Consulta médica', price: '200.00', duration: '30', color: '#3B82F6' },
      { name: 'Retorno', description: 'Consulta de retorno', price: '150.00', duration: '20', color: '#10B981' },
      { name: 'Exame', description: 'Exame físico', price: '100.00', duration: '45', color: '#F59E0B' }
    ]
  }
}

export default function CreateClientPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    business_name: '',
    email: '',
    phone: '',
    address: '',
    logo_url: '',
    business_type: 'barbearia',
    custom_services: []
  })

  const totalSteps = 3

  const handleInputChange = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleServiceChange = (index: number, field: string, value: string) => {
    const newServices = [...formData.custom_services]
    newServices[index] = { ...newServices[index], [field]: value }
    setFormData(prev => ({ ...prev, custom_services: newServices }))
  }

  const addCustomService = () => {
    setFormData(prev => ({
      ...prev,
      custom_services: [
        ...prev.custom_services,
        { name: '', description: '', price: '', duration: '', color: '#3B82F6' }
      ]
    }))
  }

  const removeCustomService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      custom_services: prev.custom_services.filter((_, i) => i !== index)
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      // Validar dados
      if (!formData.name || !formData.business_name || !formData.email || !formData.phone) {
        toast.error('Por favor, preencha todos os campos obrigatórios')
        return
      }

      // Preparar dados para envio
      const services = formData.business_type === 'custom' 
        ? formData.custom_services.map(s => ({
            name: s.name,
            description: s.description,
            price: parseFloat(s.price),
            duration: parseInt(s.duration),
            color: s.color
          }))
        : businessTemplates[formData.business_type].services

      const clientData = {
        name: formData.name,
        business_name: formData.business_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        logo_url: formData.logo_url,
        services,
        working_hours: {
          monday: { start: '08:00', end: '18:00', enabled: true },
          tuesday: { start: '08:00', end: '18:00', enabled: true },
          wednesday: { start: '08:00', end: '18:00', enabled: true },
          thursday: { start: '08:00', end: '18:00', enabled: true },
          friday: { start: '08:00', end: '18:00', enabled: true },
          saturday: { start: '08:00', end: '16:00', enabled: true },
          sunday: { start: '08:00', end: '16:00', enabled: false }
        }
      }

      // Aqui você chamaria a função createNewClient do script
      console.log('Dados do cliente:', clientData)
      
      // Simular criação bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Aqui você chamaria a função createNewClient do script
      console.log('Dados do cliente:', clientData)
      
      toast.success('Cliente criado com sucesso!')
      router.push('/super-admin')
      
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      toast.error('Erro ao criar cliente')
    } finally {
      setLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            i + 1 < currentStep
              ? 'bg-primary-600 text-white'
              : i + 1 === currentStep
              ? 'bg-primary-100 text-primary-700 border-2 border-primary-600'
              : 'bg-gray-200 text-gray-500'
          }`}>
            {i + 1 < currentStep ? '✓' : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-16 h-0.5 mx-2 ${
              i + 1 < currentStep ? 'bg-primary-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Criar Novo Cliente</h1>
              <p className="text-gray-600">Configure o sistema para um novo negócio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepIndicator()}

        <div className="bg-white rounded-lg shadow p-8">
          {/* Step 1: Informações Básicas */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Básicas</h2>
                <p className="text-gray-600 mb-6">Comece com os dados principais do profissional e do negócio.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Profissional *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="input-field pl-10"
                      placeholder="Ex: João Silva"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Negócio *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      className="input-field pl-10"
                      placeholder="Ex: Barbearia do João"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="input-field pl-10"
                      placeholder="joao@barbearia.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="input-field pl-10"
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="input-field pl-10"
                      placeholder="Rua das Flores, 123 - Centro, São Paulo"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL da Logo (opcional)
                  </label>
                  <div className="relative">
                    <Image className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => handleInputChange('logo_url', e.target.value)}
                      className="input-field pl-10"
                      placeholder="https://exemplo.com/logo.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Tipo de Negócio */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tipo de Negócio</h2>
                <p className="text-gray-600 mb-6">Escolha um template ou crie serviços personalizados.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(businessTemplates).map(([key, template]) => (
                  <div
                    key={key}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.business_type === key
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('business_type', key)}
                  >
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <div className="mt-3 space-y-2">
                      {template.services.slice(0, 3).map((service, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{service.name}</span>
                          <span className="text-gray-500">R$ {service.price}</span>
                        </div>
                      ))}
                      {template.services.length > 3 && (
                        <p className="text-xs text-gray-500">+{template.services.length - 3} mais serviços</p>
                      )}
                    </div>
                  </div>
                ))}

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.business_type === 'custom'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('business_type', 'custom')}
                >
                  <h3 className="font-medium text-gray-900">Personalizado</h3>
                  <p className="text-sm text-gray-600 mt-1">Crie seus próprios serviços</p>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Configure tudo do zero</p>
                  </div>
                </div>
              </div>

              {/* Serviços personalizados */}
              {formData.business_type === 'custom' && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Serviços Personalizados</h3>
                    <button
                      type="button"
                      onClick={addCustomService}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Adicionar Serviço</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.custom_services.map((service, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                            <input
                              type="text"
                              value={service.name}
                              onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                              className="input-field"
                              placeholder="Nome do serviço"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={service.price}
                              onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                              className="input-field"
                              placeholder="45.00"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min) *</label>
                            <input
                              type="number"
                              min="15"
                              step="15"
                              value={service.duration}
                              onChange={(e) => handleServiceChange(index, 'duration', e.target.value)}
                              className="input-field"
                              placeholder="30"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={service.color}
                                onChange={(e) => handleServiceChange(index, 'color', e.target.value)}
                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                              />
                              <button
                                type="button"
                                onClick={() => removeCustomService(index)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                          <textarea
                            value={service.description}
                            onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                            className="input-field"
                            rows={2}
                            placeholder="Descreva o serviço..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmação */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirmação</h2>
                <p className="text-gray-600 mb-6">Revise os dados antes de criar o cliente.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="font-medium text-gray-900">Resumo do Cliente</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nome do Profissional</p>
                    <p className="text-gray-900">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nome do Negócio</p>
                    <p className="text-gray-900">{formData.business_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">E-mail</p>
                    <p className="text-gray-900">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Telefone</p>
                    <p className="text-gray-900">{formData.phone}</p>
                  </div>
                  {formData.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-700">Endereço</p>
                      <p className="text-gray-900">{formData.address}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tipo de Negócio</p>
                  <p className="text-gray-900">
                    {formData.business_type === 'custom' 
                      ? 'Personalizado' 
                      : businessTemplates[formData.business_type].name
                    }
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Serviços</p>
                  <div className="space-y-2">
                    {(formData.business_type === 'custom' 
                      ? formData.custom_services 
                      : businessTemplates[formData.business_type].services
                    ).map((service, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{service.name}</span>
                        <span className="text-gray-500">R$ {service.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-8 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Anterior
            </button>

            <div className="flex space-x-3">
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Criando...</span>
                    </>
                  ) : (
                    <>
                      <span>Criar Cliente</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
