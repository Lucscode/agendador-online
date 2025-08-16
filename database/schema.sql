-- =====================================================
-- ESQUEMA DO BANCO DE DADOS - AGENDADOR ONLINE
-- =====================================================

-- Tabela de profissionais
CREATE TABLE professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  logo_url TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de serviços
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- em minutos
  color TEXT NOT NULL DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes TEXT, -- observações adicionais
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de horários bloqueados
CREATE TABLE blocked_times (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  is_recurring BOOLEAN DEFAULT false, -- para horários recorrentes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do profissional
CREATE TABLE professional_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE UNIQUE,
  working_hours JSONB DEFAULT '{"monday": {"start": "08:00", "end": "18:00"}, "tuesday": {"start": "08:00", "end": "18:00"}, "wednesday": {"start": "08:00", "end": "18:00"}, "thursday": {"start": "08:00", "end": "18:00"}, "friday": {"start": "08:00", "end": "18:00"}, "saturday": {"start": "08:00", "end": "18:00"}, "sunday": {"start": "08:00", "end": "18:00"}}',
  break_time INTEGER DEFAULT 0, -- tempo de intervalo entre agendamentos (minutos)
  advance_booking_days INTEGER DEFAULT 30, -- dias de antecedência para agendamento
  auto_confirm BOOLEAN DEFAULT false, -- confirmar agendamentos automaticamente
  send_reminders BOOLEAN DEFAULT true, -- enviar lembretes
  reminder_hours INTEGER DEFAULT 24, -- horas antes do agendamento para enviar lembrete
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para agendamentos
CREATE INDEX idx_appointments_professional_date ON appointments(professional_id, date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_time ON appointments(date, start_time);
CREATE INDEX idx_appointments_client_email ON appointments(client_email) WHERE client_email IS NOT NULL;

-- Índices para serviços
CREATE INDEX idx_services_professional ON services(professional_id);
CREATE INDEX idx_services_active ON services(is_active) WHERE is_active = true;

-- Índices para horários bloqueados
CREATE INDEX idx_blocked_times_professional_date ON blocked_times(professional_id, date);
CREATE INDEX idx_blocked_times_date_range ON blocked_times(date, start_time, end_time);

-- Índices para profissionais
CREATE INDEX idx_professionals_slug ON professionals(slug);
CREATE INDEX idx_professionals_email ON professionals(email);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blocked_times_updated_at BEFORE UPDATE ON blocked_times FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professional_settings_updated_at BEFORE UPDATE ON professional_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar conflitos de horário
CREATE OR REPLACE FUNCTION check_appointment_conflicts()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se há conflito com outros agendamentos
    IF EXISTS (
        SELECT 1 FROM appointments 
        WHERE professional_id = NEW.professional_id 
        AND date = NEW.date 
        AND status != 'cancelled'
        AND id != NEW.id
        AND (
            (NEW.start_time < end_time AND NEW.end_time > start_time)
        )
    ) THEN
        RAISE EXCEPTION 'Conflito de horário: já existe um agendamento neste período';
    END IF;
    
    -- Verificar se há conflito com horários bloqueados
    IF EXISTS (
        SELECT 1 FROM blocked_times 
        WHERE professional_id = NEW.professional_id 
        AND date = NEW.date 
        AND (
            (NEW.start_time < end_time AND NEW.end_time > start_time)
        )
    ) THEN
        RAISE EXCEPTION 'Conflito de horário: período bloqueado pelo profissional';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para verificar conflitos antes de inserir/atualizar agendamentos
CREATE TRIGGER check_appointment_conflicts_trigger 
    BEFORE INSERT OR UPDATE ON appointments 
    FOR EACH ROW EXECUTE FUNCTION check_appointment_conflicts();

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para profissionais
CREATE POLICY "Professionals are viewable by everyone" ON professionals FOR SELECT USING (true);
CREATE POLICY "Professionals can insert their own data" ON professionals FOR INSERT WITH CHECK (true);
CREATE POLICY "Professionals can update their own data" ON professionals FOR UPDATE USING (true);

-- Políticas para serviços
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
CREATE POLICY "Services can be inserted by professionals" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "Services can be updated by professionals" ON services FOR UPDATE USING (true);
CREATE POLICY "Services can be deleted by professionals" ON services FOR DELETE USING (true);

-- Políticas para agendamentos
CREATE POLICY "Appointments are viewable by everyone" ON appointments FOR SELECT USING (true);
CREATE POLICY "Appointments can be inserted by anyone" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Appointments can be updated by professionals" ON appointments FOR UPDATE USING (true);
CREATE POLICY "Appointments can be deleted by professionals" ON appointments FOR DELETE USING (true);

-- Políticas para horários bloqueados
CREATE POLICY "Blocked times are viewable by everyone" ON blocked_times FOR SELECT USING (true);
CREATE POLICY "Blocked times can be inserted by professionals" ON blocked_times FOR INSERT WITH CHECK (true);
CREATE POLICY "Blocked times can be updated by professionals" ON blocked_times FOR UPDATE USING (true);
CREATE POLICY "Blocked times can be deleted by professionals" ON blocked_times FOR DELETE USING (true);

-- Políticas para configurações
CREATE POLICY "Settings are viewable by professionals" ON professional_settings FOR SELECT USING (true);
CREATE POLICY "Settings can be inserted by professionals" ON professional_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Settings can be updated by professionals" ON professional_settings FOR UPDATE USING (true);

-- =====================================================
-- DADOS DE EXEMPLO
-- =====================================================

-- Inserir profissional de exemplo
INSERT INTO professionals (slug, name, business_name, email, phone, address) VALUES
('joao-barbearia', 'João Silva', 'João Barbearia', 'joao@barbearia.com', '(11) 99999-9999', 'Rua das Flores, 123 - Centro, São Paulo'),
('maria-salao', 'Maria Santos', 'Maria Salão de Beleza', 'maria@salao.com', '(11) 88888-8888', 'Vila Madalena, 456 - São Paulo'),
('pedro-tatuador', 'Pedro Oliveira', 'Pedro Estúdio de Tatuagem', 'pedro@tatuagem.com', '(11) 77777-7777', 'Pinheiros, 789 - São Paulo');

-- Inserir serviços de exemplo para João Barbearia
INSERT INTO services (professional_id, name, description, price, duration, color) VALUES
((SELECT id FROM professionals WHERE slug = 'joao-barbearia'), 'Corte Masculino', 'Corte tradicional masculino com acabamento perfeito', 35.00, 30, '#3B82F6'),
((SELECT id FROM professionals WHERE slug = 'joao-barbearia'), 'Barba', 'Acabamento de barba com navalha', 25.00, 20, '#10B981'),
((SELECT id FROM professionals WHERE slug = 'joao-barbearia'), 'Corte + Barba', 'Corte masculino completo com barba', 50.00, 45, '#F59E0B');

-- Inserir serviços de exemplo para Maria Salão
INSERT INTO services (professional_id, name, description, price, duration, color) VALUES
((SELECT id FROM professionals WHERE slug = 'maria-salao'), 'Corte Feminino', 'Corte feminino com lavagem e finalização', 45.00, 45, '#EC4899'),
((SELECT id FROM professionals WHERE slug = 'maria-salao'), 'Coloração', 'Coloração completa com produtos profissionais', 120.00, 120, '#8B5CF6'),
((SELECT id FROM professionals WHERE slug = 'maria-salao'), 'Manicure', 'Manicure completa com esmalte', 35.00, 30, '#F97316');

-- Inserir serviços de exemplo para Pedro Tatuador
INSERT INTO services (professional_id, name, description, price, duration, color) VALUES
((SELECT id FROM professionals WHERE slug = 'pedro-tatuador'), 'Tatuagem Pequena', 'Tatuagem de até 10cm', 150.00, 60, '#DC2626'),
((SELECT id FROM professionals WHERE slug = 'pedro-tatuador'), 'Tatuagem Média', 'Tatuagem de 10cm a 20cm', 300.00, 120, '#7C2D12'),
((SELECT id FROM professionals WHERE slug = 'pedro-tatuador'), 'Tatuagem Grande', 'Tatuagem acima de 20cm', 500.00, 180, '#1E40AF');

-- Inserir configurações padrão para cada profissional
INSERT INTO professional_settings (professional_id) 
SELECT id FROM professionals;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para agendamentos com informações completas
CREATE VIEW appointments_view AS
SELECT 
    a.id,
    a.client_name,
    a.client_email,
    a.client_phone,
    a.date,
    a.start_time,
    a.end_time,
    a.status,
    a.notes,
    a.created_at,
    p.slug as professional_slug,
    p.business_name,
    p.name as professional_name,
    s.name as service_name,
    s.price,
    s.duration,
    s.color as service_color
FROM appointments a
JOIN professionals p ON a.professional_id = p.id
JOIN services s ON a.service_id = s.id;

-- View para horários disponíveis
CREATE VIEW available_times_view AS
WITH working_hours AS (
    SELECT 
        professional_id,
        working_hours->>'monday' as monday,
        working_hours->>'tuesday' as tuesday,
        working_hours->>'wednesday' as wednesday,
        working_hours->>'thursday' as thursday,
        working_hours->>'friday' as friday,
        working_hours->>'saturday' as saturday,
        working_hours->>'sunday' as sunday
    FROM professional_settings
),
time_slots AS (
    SELECT 
        generate_series(
            '08:00'::time, 
            '18:00'::time, 
            '00:30'::interval
        ) as time_slot
)
SELECT 
    p.id as professional_id,
    p.slug as professional_slug,
    CURRENT_DATE + generate_series(0, 30) as date,
    ts.time_slot as start_time,
    ts.time_slot + '00:30'::interval as end_time
FROM professionals p
CROSS JOIN time_slots ts
WHERE ts.time_slot < '18:00'::time;

-- =====================================================
-- FUNÇÕES DE UTILIDADE
-- =====================================================

-- Função para obter horários disponíveis de um profissional em uma data
CREATE OR REPLACE FUNCTION get_available_times(
    p_professional_id UUID,
    p_date DATE,
    p_service_duration INTEGER DEFAULT 30
)
RETURNS TABLE(start_time TIME, end_time TIME) AS $$
BEGIN
    RETURN QUERY
    WITH all_times AS (
        SELECT 
            generate_series(
                '08:00'::time, 
                '18:00'::time, 
                '00:30'::interval
            ) as time_slot
    ),
    occupied_times AS (
        SELECT 
            start_time,
            end_time
        FROM appointments 
        WHERE professional_id = p_professional_id 
        AND date = p_date 
        AND status != 'cancelled'
        UNION ALL
        SELECT 
            start_time,
            end_time
        FROM blocked_times 
        WHERE professional_id = p_professional_id 
        AND date = p_date
    ),
    available_times AS (
        SELECT 
            at.time_slot as start_time,
            at.time_slot + (p_service_duration || ' minutes')::interval as end_time
        FROM all_times at
        WHERE at.time_slot + (p_service_duration || ' minutes')::interval <= '18:00'::time
        AND NOT EXISTS (
            SELECT 1 FROM occupied_times ot
            WHERE (at.time_slot < ot.end_time AND at.time_slot + (p_service_duration || ' minutes')::interval > ot.start_time)
        )
    )
    SELECT 
        at.start_time::time,
        at.end_time::time
    FROM available_times at
    ORDER BY at.start_time;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE professionals IS 'Tabela de profissionais/empresas que oferecem serviços';
COMMENT ON TABLE services IS 'Serviços oferecidos pelos profissionais';
COMMENT ON TABLE appointments IS 'Agendamentos realizados pelos clientes';
COMMENT ON TABLE blocked_times IS 'Horários bloqueados pelos profissionais';
COMMENT ON TABLE professional_settings IS 'Configurações específicas de cada profissional';

COMMENT ON COLUMN professionals.slug IS 'Slug único para o link de agendamento';
COMMENT ON COLUMN services.duration IS 'Duração do serviço em minutos';
COMMENT ON COLUMN services.color IS 'Cor para identificação visual no calendário';
COMMENT ON COLUMN appointments.status IS 'Status: pending, confirmed, cancelled';
COMMENT ON COLUMN blocked_times.is_recurring IS 'Se o horário bloqueado se repete semanalmente';
COMMENT ON COLUMN professional_settings.working_hours IS 'Horários de funcionamento em formato JSON';
COMMENT ON COLUMN professional_settings.break_time IS 'Intervalo entre agendamentos em minutos';
COMMENT ON COLUMN professional_settings.advance_booking_days IS 'Dias de antecedência para agendamento';
COMMENT ON COLUMN professional_settings.auto_confirm IS 'Se agendamentos são confirmados automaticamente';
COMMENT ON COLUMN professional_settings.send_reminders IS 'Se envia lembretes aos clientes';
COMMENT ON COLUMN professional_settings.reminder_hours IS 'Horas antes do agendamento para enviar lembrete';
