'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Clock, DollarSign, Palette } from 'lucide-react'
import { Service } from '@/lib/supabase'

interface ServiceManagerProps {
  services: Service[]
  onServicesChange: (services: Service[]) => void
}

export default function ServiceManager({ services, onServicesChange }: ServiceManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    color: '#3B82F6'
  })

  const handleAddService = () => {
    setIsAdding(true)
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      color: '#3B82F6'
    })
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
      color: service.color
    })
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingService(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      color: '#3B82F6'
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.duration) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    const newService: Service = {
      id: editingService?.id || `service-${Date.now()}`,
      professional_id: 'demo-1', // Em produção viria do contexto
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      color: formData.color,
      created_at: editingService?.created_at || new Date().toISOString()
    }

    if (editingService) {
      // Editar serviço existente
      const updatedServices = services.map(s => 
        s.id === editingService.id ? newService : s
      )
      onServicesChange(updatedServices)
      toast.success('Serviço atualizado com sucesso!')
    } else {
      // Adicionar novo serviço
      onServicesChange([...services, newService])
      toast.success('Serviço adicionado com sucesso!')
    }

    handleCancel()
  }

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Tem certeza que deseja remover este serviço?')) {
      const updatedServices = services.filter(s => s.id !== serviceId)
      onServicesChange(updatedServices)
      toast.success('Serviço removido com sucesso!')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Gerenciar Serviços ({services.length})
          </h3>
          <p className="text-sm text-gray-600">
            Adicione, edite ou remova seus serviços
          </p>
        </div>
        
        <button
          onClick={handleAddService}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar Serviço</span>
        </button>
      </div>

      {/* Formulário de Adição/Edição */}
      {(isAdding || editingService) && (
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {editingService ? 'Editar Serviço' : 'Novo Serviço'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input-field"
                  placeholder="Ex: Corte Masculino"
                  required
                />
              </div>

              {/* Preço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="input-field"
                  placeholder="35.00"
                  required
                />
              </div>

              {/* Duração */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (minutos) *
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="input-field"
                  placeholder="30"
                  required
                />
              </div>

              {/* Cor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor do Serviço
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{formData.color}</span>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Descreva o serviço oferecido..."
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
                {editingService ? 'Atualizar' : 'Adicionar'} Serviço
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Serviços */}
      <div className="space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-12">
            <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum serviço cadastrado
            </h3>
            <p className="text-gray-600">
              Comece adicionando seu primeiro serviço para que os clientes possam agendar.
            </p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div
                    className="w-4 h-4 rounded-full mt-1"
                    style={{ backgroundColor: service.color }}
                  ></div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">{service.name}</h4>
                    
                    {service.description && (
                      <p className="text-sm text-gray-600">{service.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium text-gray-700">
                          R$ {service.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditService(service)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
