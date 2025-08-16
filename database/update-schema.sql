-- =====================================================
-- ATUALIZAÇÃO DO SCHEMA - AGENDADOR ONLINE
-- =====================================================
-- Execute este arquivo no Supabase SQL Editor para atualizar
-- o banco existente com as novas funcionalidades

-- 1. Verificar se as tabelas existem e criar se necessário
DO $$ 
BEGIN
    -- Criar tabela professional_settings se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'professional_settings') THEN
        CREATE TABLE professional_settings (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE UNIQUE,
            working_hours JSONB DEFAULT '{"monday": {"start": "08:00", "end": "18:00"}, "tuesday": {"start": "08:00", "end": "18:00"}, "wednesday": {"start": "08:00", "end": "18:00"}, "thursday": {"start": "08:00", "end": "18:00"}, "friday": {"start": "08:00", "end": "18:00"}, "saturday": {"start": "08:00", "end": "18:00"}, "sunday": {"start": "08:00", "end": "18:00"}}',
            break_time INTEGER DEFAULT 0,
            advance_booking_days INTEGER DEFAULT 30,
            auto_confirm BOOLEAN DEFAULT false,
            send_reminders BOOLEAN DEFAULT true,
            reminder_hours INTEGER DEFAULT 24,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices para professional_settings
        CREATE INDEX idx_professional_settings_professional ON professional_settings(professional_id);
        
        RAISE NOTICE 'Tabela professional_settings criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela professional_settings já existe!';
    END IF;
    
    -- Verificar se a coluna working_hours existe na tabela professional_settings
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'professional_settings' AND column_name = 'working_hours') THEN
        ALTER TABLE professional_settings ADD COLUMN working_hours JSONB DEFAULT '{"monday": {"start": "08:00", "end": "18:00"}, "tuesday": {"start": "08:00", "end": "18:00"}, "wednesday": {"start": "08:00", "end": "18:00"}, "thursday": {"start": "08:00", "end": "18:00"}, "friday": {"start": "08:00", "end": "18:00"}, "saturday": {"start": "08:00", "end": "18:00"}, "sunday": {"start": "08:00", "end": "18:00"}}';
        RAISE NOTICE 'Coluna working_hours adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna working_hours já existe!';
    END IF;
    
END $$;

-- 2. Atualizar RLS (Row Level Security) para professional_settings
DO $$
BEGIN
    -- Habilitar RLS na tabela professional_settings
    ALTER TABLE professional_settings ENABLE ROW LEVEL SECURITY;
    
    -- Criar política para profissionais acessarem suas próprias configurações
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'professional_settings' AND policyname = 'professionals_can_manage_own_settings') THEN
        CREATE POLICY professionals_can_manage_own_settings ON professional_settings
            FOR ALL USING (professional_id IN (
                SELECT id FROM professionals WHERE email = auth.jwt() ->> 'email'
            ));
        RAISE NOTICE 'Política RLS criada para professional_settings!';
    ELSE
        RAISE NOTICE 'Política RLS já existe para professional_settings!';
    END IF;
    
    -- Criar política para leitura pública (necessário para o sistema funcionar)
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'professional_settings' AND policyname = 'public_read_settings') THEN
        CREATE POLICY public_read_settings ON professional_settings
            FOR SELECT USING (true);
        RAISE NOTICE 'Política de leitura pública criada!';
    ELSE
        RAISE NOTICE 'Política de leitura pública já existe!';
    END IF;
    
END $$;

-- 3. Verificar e criar índices necessários
DO $$
BEGIN
    -- Índice para professional_settings se não existir
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_professional_settings_professional') THEN
        CREATE INDEX idx_professional_settings_professional ON professional_settings(professional_id);
        RAISE NOTICE 'Índice para professional_settings criado!';
    ELSE
        RAISE NOTICE 'Índice para professional_settings já existe!';
    END IF;
    
    -- Índice para working_hours JSONB se não existir
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_professional_settings_working_hours') THEN
        CREATE INDEX idx_professional_settings_working_hours ON professional_settings USING GIN (working_hours);
        RAISE NOTICE 'Índice GIN para working_hours criado!';
    ELSE
        RAISE NOTICE 'Índice GIN para working_hours já existe!';
    END IF;
    
END $$;

-- 4. Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Aplicar trigger de updated_at em professional_settings
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_professional_settings_updated_at') THEN
        CREATE TRIGGER update_professional_settings_updated_at
            BEFORE UPDATE ON professional_settings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Trigger de updated_at criado para professional_settings!';
    ELSE
        RAISE NOTICE 'Trigger de updated_at já existe para professional_settings!';
    END IF;
END $$;

-- 6. Inserir configurações padrão para profissionais existentes (se houver)
INSERT INTO professional_settings (professional_id, working_hours, advance_booking_days, auto_confirm, send_reminders, reminder_hours)
SELECT 
    p.id,
    '{"monday": {"start": "08:00", "end": "18:00"}, "tuesday": {"start": "08:00", "end": "18:00"}, "wednesday": {"start": "08:00", "end": "18:00"}, "thursday": {"start": "08:00", "end": "18:00"}, "friday": {"start": "08:00", "end": "18:00"}, "saturday": {"start": "08:00", "end": "16:00"}, "sunday": {"start": "08:00", "end": "16:00"}}'::jsonb,
    30,
    false,
    true,
    24
FROM professionals p
WHERE NOT EXISTS (
    SELECT 1 FROM professional_settings ps WHERE ps.professional_id = p.id
)
ON CONFLICT (professional_id) DO NOTHING;

-- 7. Verificar se tudo foi criado corretamente
SELECT 
    'Schema atualizado com sucesso!' as status,
    (SELECT COUNT(*) FROM professional_settings) as total_settings,
    (SELECT COUNT(*) FROM professionals) as total_professionals;

-- 8. Mostrar estrutura final das tabelas
\d professional_settings;
