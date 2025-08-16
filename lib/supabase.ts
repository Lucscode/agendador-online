import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Professional {
  id: string
  slug: string
  name: string
  business_name: string
  logo_url?: string
  email: string
  phone: string
  address?: string
  created_at: string
}

export interface Service {
  id: string
  professional_id: string
  name: string
  description?: string
  price: number
  duration: number // em minutos
  color: string
  created_at: string
}

export interface Appointment {
  id: string
  professional_id: string
  service_id: string
  client_name: string
  client_email?: string
  client_phone: string
  date: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

export interface BlockedTime {
  id: string
  professional_id: string
  date: string
  start_time: string
  end_time: string
  reason?: string
  created_at: string
}
