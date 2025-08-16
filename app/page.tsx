import Link from 'next/link'
import { Calendar, Clock, MapPin, Phone, Mail } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Agendador Online</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/admin" className="text-gray-500 hover:text-gray-900">
                Área do Profissional
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Agende seus serviços online
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Sistema completo de agendamento para profissionais e empresas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/admin" 
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Começar Agora
              </Link>
              <Link 
                href="#profissionais" 
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Ver Profissionais
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Funcionalidades Principais
            </h3>
            <p className="text-xl text-gray-600">
              Tudo que você precisa para gerenciar seus agendamentos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Calendário Inteligente
              </h4>
              <p className="text-gray-600">
                Visualize horários disponíveis e evite conflitos automaticamente
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-success-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-success-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Notificações Automáticas
              </h4>
              <p className="text-gray-600">
                E-mails automáticos para clientes e profissionais
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-warning-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-warning-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Links Personalizados
              </h4>
              <p className="text-gray-600">
                Cada profissional tem seu próprio link de agendamento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Profissionais Demo */}
      <section id="profissionais" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Profissionais Cadastrados
            </h3>
            <p className="text-xl text-gray-600">
              Agende com nossos profissionais parceiros
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Profissional Demo 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold">JB</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">João Barbearia</h4>
                    <p className="text-sm text-gray-600">Barbearia</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Centro, São Paulo</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>(11) 99999-9999</span>
                  </div>
                </div>
                <Link 
                  href="/joao-barbearia" 
                  className="btn-primary w-full text-center block"
                >
                  Agendar Horário
                </Link>
              </div>
            </div>

            {/* Profissional Demo 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-success-600 font-semibold">MS</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Maria Salão</h4>
                    <p className="text-sm text-gray-600">Salão de Beleza</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Vila Madalena, São Paulo</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>(11) 88888-8888</span>
                  </div>
                </div>
                <Link 
                  href="/maria-salao" 
                  className="btn-primary w-full text-center block"
                >
                  Agendar Horário
                </Link>
              </div>
            </div>

            {/* Profissional Demo 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-warning-600 font-semibold">PT</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Pedro Tatuador</h4>
                    <p className="text-sm text-gray-600">Estúdio de Tatuagem</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Pinheiros, São Paulo</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>(11) 77777-7777</span>
                  </div>
                </div>
                <Link 
                  href="/pedro-tatuador" 
                  className="btn-primary w-full text-center block"
                >
                  Agendar Horário
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-primary-400 mr-3" />
              <h3 className="text-xl font-bold">Agendador Online</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Sistema completo de agendamento para profissionais e empresas
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/admin" className="text-gray-400 hover:text-white">
                Área do Profissional
              </Link>
              <Link href="/termos" className="text-gray-400 hover:text-white">
                Termos de Uso
              </Link>
              <Link href="/privacidade" className="text-gray-400 hover:text-white">
                Política de Privacidade
              </Link>
            </div>
            <p className="text-gray-500 mt-8">
              © 2024 Agendador Online. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
