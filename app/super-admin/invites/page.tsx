'use client'
import { useState, useEffect } from 'react'
import { Mail, Copy, Trash2, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface InviteData {
  id: string
  invite_code: string
  client_email: string | null
  client_name: string | null
  expires_at: string
  used_at: string | null
  is_active: boolean
  created_at: string
  professional: {
    business_name: string
    name: string
    email: string
  }
}

export default function InvitesPage() {
  const [invites, setInvites] = useState<InviteData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all')

  useEffect(() => {
    loadInvites()
  }, [])

  const loadInvites = async () => {
    try {
      setLoading(true)
      
      const { data: invitesData, error } = await supabase
        .from('client_invites')
        .select(`
          *,
          professional:professionals(business_name, name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvites(invitesData || [])
    } catch (error) {
      console.error('Erro ao carregar convites:', error)
      toast.error('Erro ao carregar convites')
    } finally {
      setLoading(false)
    }
  }

  const copyInviteLink = (inviteCode: string) => {
    const link = `${window.location.origin}/${inviteCode}`
    navigator.clipboard.writeText(link)
    toast.success('Link do convite copiado!')
  }

  const deleteInvite = async (inviteId: string) => {
    if (!confirm('Tem certeza que deseja excluir este convite?')) return

    try {
      const { error } = await supabase
        .from('client_invites')
        .delete()
        .eq('id', inviteId)

      if (error) throw error

      toast.success('Convite excluído com sucesso!')
      loadInvites()
    } catch (error) {
      console.error('Erro ao excluir convite:', error)
      toast.error('Erro ao excluir convite')
    }
  }

  const cleanupExpiredInvites = async () => {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_invites')
      
      if (error) throw error

      toast.success(`${data} convites expirados foram removidos!`)
      loadInvites()
    } catch (error) {
      console.error('Erro ao limpar convites:', error)
      toast.error('Erro ao limpar convites')
    }
  }

  const getInviteStatus = (invite: InviteData) => {
    if (invite.used_at) return 'used'
    if (new Date(invite.expires_at) < new Date()) return 'expired'
    return 'active'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'used':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'used':
        return 'Usado'
      case 'expired':
        return 'Expirado'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'used':
        return 'bg-blue-100 text-blue-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredInvites = invites.filter(invite => {
    const status = getInviteStatus(invite)
    if (filter === 'all') return true
    return status === filter
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Convites</h1>
              <p className="text-gray-600">Controle todos os convites de agendamento</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={cleanupExpiredInvites}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Limpar Expirados</span>
              </button>
              <button
                onClick={() => window.history.back()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-4">
            {[
              { id: 'all', label: 'Todos', count: invites.length },
              { id: 'active', label: 'Ativos', count: invites.filter(i => getInviteStatus(i) === 'active').length },
              { id: 'used', label: 'Usados', count: invites.filter(i => getInviteStatus(i) === 'used').length },
              { id: 'expired', label: 'Expirados', count: invites.filter(i => getInviteStatus(i) === 'expired').length }
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filter === filterOption.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando convites...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Convites {filter !== 'all' && `- ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
              </h3>
            </div>
            
            {filteredInvites.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum convite encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profissional
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expira em
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criado em
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInvites.map((invite) => {
                      const status = getInviteStatus(invite)
                      const expiresDate = new Date(invite.expires_at)
                      const isExpired = expiresDate < new Date()
                      
                      return (
                        <tr key={invite.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                {invite.invite_code}
                              </code>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {invite.client_name || 'Não informado'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {invite.client_email || 'Não informado'}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {invite.professional?.business_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {invite.professional?.name}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              {getStatusIcon(status)}
                              <span className="ml-1">{getStatusText(status)}</span>
                            </span>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {expiresDate.toLocaleDateString('pt-BR')}
                            </div>
                            <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-500'}`}>
                              {isExpired ? 'Expirado' : expiresDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => copyInviteLink(invite.invite_code)}
                                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                                title="Copiar link"
                              >
                                <Copy className="h-4 w-4" />
                                <span>Copiar</span>
                              </button>
                              
                              {status === 'active' && (
                                <button
                                  onClick={() => copyInviteLink(invite.invite_code)}
                                  className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                                  title="Abrir link"
                                >
                                  <Mail className="h-4 w-4" />
                                  <span>Testar</span>
                                </button>
                              )}
                              
                              <button
                                onClick={() => deleteInvite(invite.id)}
                                className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                                title="Excluir convite"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Excluir</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
