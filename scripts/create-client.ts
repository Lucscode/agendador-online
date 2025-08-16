import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos para o cadastro
interface NewClientData {
  // Dados do profissional
  name: string
  business_name: string
  email: string
  phone: string
  address: string
  logo_url?: string
  
  // Dados dos serviços
  services: Array<{
    name: string
    description?: string
    price: number
    duration: number
    color: string
  }>
  
  // Configurações de horário (agora em JSONB na tabela professional_settings)
  working_hours: {
    monday: { start: string; end: string; enabled: boolean }
    tuesday: { start: string; end: string; enabled: boolean }
    wednesday: { start: string; end: string; enabled: boolean }
    thursday: { start: string; end: string; enabled: boolean }
    friday: { start: string; end: string; enabled: boolean }
    saturday: { start: string; end: string; enabled: boolean }
    sunday: { start: string; end: string; enabled: boolean }
  }
}

// Templates de negócios pré-configurados
const businessTemplates = {
  barbearia: {
    name: 'Barbearia',
    services: [
      { name: 'Corte Masculino', description: 'Corte tradicional masculino', price: 45.00, duration: 30, color: '#3B82F6' },
      { name: 'Barba', description: 'Acabamento de barba com navalha', price: 30.00, duration: 20, color: '#10B981' },
      { name: 'Corte + Barba', description: 'Corte masculino completo com barba', price: 65.00, duration: 45, color: '#F59E0B' },
      { name: 'Hidratação', description: 'Tratamento capilar', price: 25.00, duration: 15, color: '#8B5CF6' }
    ],
    working_hours: {
      monday: { start: '08:00', end: '18:00', enabled: true },
      tuesday: { start: '08:00', end: '18:00', enabled: true },
      wednesday: { start: '08:00', end: '18:00', enabled: true },
      thursday: { start: '08:00', end: '18:00', enabled: true },
      friday: { start: '08:00', end: '18:00', enabled: true },
      saturday: { start: '08:00', end: '16:00', enabled: true },
      sunday: { start: '08:00', end: '16:00', enabled: false }
    }
  },
  
  salao: {
    name: 'Salão de Beleza',
    services: [
      { name: 'Corte Feminino', description: 'Corte feminino com finalização', price: 60.00, duration: 45, color: '#EC4899' },
      { name: 'Coloração', description: 'Coloração completa', price: 120.00, duration: 120, color: '#F59E0B' },
      { name: 'Escova', description: 'Escova com finalização', price: 40.00, duration: 30, color: '#8B5CF6' },
      { name: 'Manicure', description: 'Manicure completa', price: 35.00, duration: 45, color: '#EF4444' },
      { name: 'Pedicure', description: 'Pedicure completa', price: 35.00, duration: 45, color: '#10B981' }
    ],
    working_hours: {
      monday: { start: '09:00', end: '19:00', enabled: true },
      tuesday: { start: '09:00', end: '19:00', enabled: true },
      wednesday: { start: '09:00', end: '19:00', enabled: true },
      thursday: { start: '09:00', end: '19:00', enabled: true },
      friday: { start: '09:00', end: '19:00', enabled: true },
      saturday: { start: '09:00', end: '17:00', enabled: true },
      sunday: { start: '09:00', end: '17:00', enabled: false }
    }
  },
  
  tatuagem: {
    name: 'Estúdio de Tatuagem',
    services: [
      { name: 'Tatuagem Pequena', description: 'Tatuagem até 5cm', price: 150.00, duration: 60, color: '#000000' },
      { name: 'Tatuagem Média', description: 'Tatuagem até 15cm', price: 300.00, duration: 120, color: '#374151' },
      { name: 'Tatuagem Grande', description: 'Tatuagem acima de 15cm', price: 500.00, duration: 240, color: '#6B7280' },
      { name: 'Cover-up', description: 'Cobertura de tatuagem', price: 400.00, duration: 180, color: '#DC2626' }
    ],
    working_hours: {
      monday: { start: '10:00', end: '20:00', enabled: true },
      tuesday: { start: '10:00', end: '20:00', enabled: true },
      wednesday: { start: '10:00', end: '20:00', enabled: true },
      thursday: { start: '10:00', end: '20:00', enabled: true },
      friday: { start: '10:00', end: '20:00', enabled: true },
      saturday: { start: '10:00', end: '18:00', enabled: true },
      sunday: { start: '10:00', end: '18:00', enabled: false }
    }
  },
  
  consultorio: {
    name: 'Consultório',
    services: [
      { name: 'Consulta', description: 'Consulta médica', price: 200.00, duration: 30, color: '#3B82F6' },
      { name: 'Retorno', description: 'Consulta de retorno', price: 150.00, duration: 20, color: '#10B981' },
      { name: 'Exame', description: 'Exame físico', price: 100.00, duration: 45, color: '#F59E0B' }
    ],
    working_hours: {
      monday: { start: '08:00', end: '17:00', enabled: true },
      tuesday: { start: '08:00', end: '17:00', enabled: true },
      wednesday: { start: '08:00', end: '17:00', enabled: true },
      thursday: { start: '08:00', end: '17:00', enabled: true },
      friday: { start: '08:00', end: '17:00', enabled: true },
      saturday: { start: '08:00', end: '12:00', enabled: true },
      sunday: { start: '08:00', end: '12:00', enabled: false }
    }
  }
}

// Função principal para criar novo cliente
export async function createNewClient(
  clientData: NewClientData,
  businessType: keyof typeof businessTemplates
) {
  try {
    console.log('🚀 Iniciando cadastro de novo cliente...')
    
    // 1. Gerar slug único
    const slug = generateSlug(clientData.business_name)
    console.log(`📝 Slug gerado: ${slug}`)
    
    // 2. Criar profissional
    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .insert({
        slug,
        name: clientData.name,
        business_name: clientData.business_name,
        logo_url: clientData.logo_url || '',
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address
      })
      .select()
      .single()
    
    if (profError) throw profError
    console.log(`✅ Profissional criado: ${professional.business_name}`)
    
    // 3. Cadastrar serviços
    const servicesWithIds = clientData.services.map(service => ({
      ...service,
      professional_id: professional.id
    }))
    
    const { data: services, error: servError } = await supabase
      .from('services')
      .insert(servicesWithIds)
      .select()
    
    if (servError) throw servError
    console.log(`✅ ${services.length} serviços cadastrados`)
    
    // 4. Configurar horários de funcionamento (agora na tabela professional_settings)
    const workingHoursJson = Object.entries(clientData.working_hours).reduce((acc, [day, hours]) => {
      if (hours.enabled) {
        acc[day] = { start: hours.start, end: hours.end }
      }
      return acc
    }, {} as Record<string, { start: string; end: string }>)
    
    const { error: configError } = await supabase
      .from('professional_settings')
      .insert({
        professional_id: professional.id,
        working_hours: workingHoursJson,
        advance_booking_days: 30,
        auto_confirm: false,
        send_reminders: true,
        reminder_hours: 24
      })
    
    if (configError) throw configError
    console.log(`✅ Configurações e horários criados`)
    
    // 5. Gerar dados de retorno
    const result = {
      success: true,
      professional,
      services,
      urls: {
        public: `https://seudominio.com/${slug}`,
        admin: `https://seudominio.com/admin/${slug}`,
        api: `https://seudominio.com/api/${slug}`
      },
      credentials: {
        email: clientData.email,
        password: generateTemporaryPassword()
      }
    }
    
    console.log(`🎉 Cliente criado com sucesso!`)
    console.log(`🌐 URL pública: ${result.urls.public}`)
    console.log(`🔐 Painel admin: ${result.urls.admin}`)
    
    return result
    
  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error)
    throw error
  }
}

// Função para criar cliente usando template
export async function createClientFromTemplate(
  clientData: Omit<NewClientData, 'services' | 'working_hours'>,
  businessType: keyof typeof businessTemplates
) {
  const template = businessTemplates[businessType]
  
  if (!template) {
    throw new Error(`Template "${businessType}" não encontrado`)
  }
  
  const fullClientData: NewClientData = {
    ...clientData,
    services: template.services,
    working_hours: template.working_hours
  }
  
  return createNewClient(fullClientData, businessType)
}

// Funções auxiliares
function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Exemplo de uso
if (require.main === module) {
  // Exemplo: Criar barbearia
  const barbeariaData = {
    name: 'João Silva',
    business_name: 'Barbearia do João',
    email: 'joao@barbearia.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Barbearias, 123 - Centro, São Paulo',
    logo_url: 'https://exemplo.com/logo.jpg'
  }
  
  createClientFromTemplate(barbeariaData, 'barbearia')
    .then(result => {
      console.log('🎯 Resultado:', result)
    })
    .catch(error => {
      console.error('❌ Erro:', error)
    })
}
