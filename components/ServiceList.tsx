'use client'

import { Clock, DollarSign } from 'lucide-react'
import { Service } from '@/lib/supabase'

interface ServiceListProps {
  services: Service[]
  selectedService: Service | null
  onServiceSelect: (service: Service) => void
}

export default function ServiceList({ services, selectedService, onServiceSelect }: ServiceListProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours}h`
    }
    return `${hours}h ${remainingMinutes}min`
  }

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum serviço disponível</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <div
          key={service.id}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
            selectedService?.id === service.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onServiceSelect(service)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: service.color }}
                ></div>
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
              </div>
              
              {service.description && (
                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(service.duration)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium text-gray-700">{formatPrice(service.price)}</span>
                </div>
              </div>
            </div>
            
            {selectedService?.id === service.id && (
              <div className="ml-3">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
