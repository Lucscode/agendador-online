'use client'

import { useState, useEffect } from 'react'
import { Plus, Users, Building, Calendar, Settings, Eye, Edit, Trash2, Copy, ExternalLink } from 'lucide-react'
import { supabase, Professional, Service } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface ClientWithStats extends Professional {
  services_count: number
  appointments_count: number
  revenue: number
  last_activity: string
}

export default function SuperAdminPage() {
  const [clients, setClients] = useState<ClientWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Professional | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'analytics' | 'settings'>('overview')

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      
      // Buscar todos os profissionais
      const { data: professionals, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .order('created_at', { ascending: false })

      if (profError) throw profError

      // Buscar estatísticas para cada profissional
      const clientsWithStats = await Promise.all(
        professionals.map(async (prof) => {
          // Contar serviços
          const { count: servicesCount } = await supabase
            .from('services')
            .select('*', { count: 'exact', head: true })
            .eq('professional_id', prof.id)

          // Contar agendamentos
          const { count: appointmentsCount } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('professional_id', prof.id)

          // Calcular receita (simulado)
          const revenue = (appointmentsCount || 0) * 50 // Média de R$ 50 por agendamento

          return {
            ...prof,
            services_count: servicesCount || 0,
            appointments_count: appointmentsCount || 0,
            revenue,
            last_activity: prof.created_at
          }
        })
      )

      setClients(clientsWithStats)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      toast.error('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (clientData: any) => {
    try {
      // Aqui você chamaria a função createNewClient do script
      toast.success('Cliente criado com sucesso!')
      setShowCreateForm(false)
      loadClients()
    } catch (error) {
      toast.error('Erro ao criar cliente')
    }
  }

  const copyClientLink = (slug: string) => {
    const link = `https://seudominio.com/${slug}`
    navigator.clipboard.writeText(link)
    toast.success('Link copiado para a área de transferência!')
  }

  const openClientLink = (slug: string) => {
    const link = `/${slug}`
    window.open(link, '_blank')
  }

  const deleteClient = async (clientId: string) => {
    if (!confirm('Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      // Em produção, você implementaria a lógica de exclusão
      toast.success('Cliente removido com sucesso!')
      loadClients()
    } catch (error) {
      toast.error('Erro ao remover cliente')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
              <p className="text-gray-600">Gerencie todos os clientes do sistema</p>
            </div>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Visão Geral', icon: Eye },
              { id: 'clients', name: 'Clientes', icon: Users },
              { id: 'analytics', name: 'Analytics', icon: Calendar },
              { id: 'settings', name: 'Configurações', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                    <p className="text-2xl font-semibold text-gray-900">{clients.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Building className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Serviços Ativos</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {clients.reduce((sum, client) => sum + client.services_count, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Agendamentos</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {clients.reduce((sum, client) => sum + client.appointments_count, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl font-bold text-purple-600">R$</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {clients.reduce((sum, client) => sum + client.revenue, 0).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Clients */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Clientes Recentes</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold">
                          {client.business_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{client.business_name}</p>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyClientLink(client.slug)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Copiar link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openClientLink(client.slug)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Ver página"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Todos os Clientes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serviços
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agendamentos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-semibold">
                              {client.business_name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {client.business_name}
                            </div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.services_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.appointments_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {client.revenue.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Ativo
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyClientLink(client.slug)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Copiar link"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openClientLink(client.slug)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Ver página"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteClient(client.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics</h3>
            <p className="text-gray-600">Dashboard de analytics em desenvolvimento...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações do Sistema</h3>
            <p className="text-gray-600">Configurações do sistema em desenvolvimento...</p>
          </div>
        )}
      </div>

      {/* Create Client Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Novo Cliente</h3>
              <p className="text-gray-600 mb-4">
                Use o script de criação para adicionar novos clientes ao sistema.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    // Aqui você abriria o formulário de criação
                  }}
                  className="btn-primary"
                >
                  Criar Cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
