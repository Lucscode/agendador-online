-- =====================================================
-- ATUALIZAÇÃO DE SEGURANÇA - SISTEMA DE CONVITES (CORRIGIDO)
-- =====================================================
-- Execute este arquivo no Supabase SQL Editor para implementar
-- controle de acesso baseado em convites

-- 1. Criar tabela de convites
CREATE TABLE IF NOT EXISTS client_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
    client_email TEXT,
    client_name TEXT,
    invite_code TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de sessões de cliente
CREATE TABLE IF NOT EXISTS client_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invite_id UUID REFERENCES client_invites(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_client_invites_professional ON client_invites(professional_id);
CREATE INDEX IF NOT EXISTS idx_client_invites_code ON client_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_client_invites_expires ON client_invites(expires_at);
CREATE INDEX IF NOT EXISTS idx_client_sessions_token ON client_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_client_sessions_expires ON client_sessions(expires_at);

-- 4. Habilitar RLS nas novas tabelas
ALTER TABLE client_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS para client_invites (sem IF NOT EXISTS)
DO $$
BEGIN
    -- Verificar se a política já existe antes de criar
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'client_invites' AND policyname = 'professionals_can_manage_own_invites') THEN
        CREATE POLICY professionals_can_manage_own_invites ON client_invites
            FOR ALL USING (professional_id IN (
                SELECT id FROM professionals WHERE email = auth.jwt() ->> 'email'
            ));
        RAISE NOTICE 'Política professionals_can_manage_own_invites criada!';
    ELSE
        RAISE NOTICE 'Política professionals_can_manage_own_invites já existe!';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'client_invites' AND policyname = 'public_can_read_valid_invites') THEN
        CREATE POLICY public_can_read_valid_invites ON client_invites
            FOR SELECT USING (
                invite_code IS NOT NULL 
                AND expires_at > NOW() 
                AND is_active = true 
                AND used_at IS NULL
            );
        RAISE NOTICE 'Política public_can_read_valid_invites criada!';
    ELSE
        RAISE NOTICE 'Política public_can_read_valid_invites já existe!';
    END IF;
END $$;

-- 6. Criar políticas RLS para client_sessions
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'client_sessions' AND policyname = 'public_can_manage_sessions') THEN
        CREATE POLICY public_can_manage_sessions ON client_sessions
            FOR ALL USING (true);
        RAISE NOTICE 'Política public_can_manage_sessions criada!';
    ELSE
        RAISE NOTICE 'Política public_can_manage_sessions já existe!';
    END IF;
END $$;

-- 7. Criar função para gerar código único
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_already BOOLEAN;
BEGIN
    LOOP
        -- Gerar código de 8 caracteres (letras e números)
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Verificar se já existe
        SELECT EXISTS(SELECT 1 FROM client_invites WHERE invite_code = code) INTO exists_already;
        
        -- Se não existe, retornar o código
        IF NOT exists_already THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar função para criar convite
CREATE OR REPLACE FUNCTION create_client_invite(
    p_professional_id UUID,
    p_client_email TEXT DEFAULT NULL,
    p_client_name TEXT DEFAULT NULL,
    p_expires_in_hours INTEGER DEFAULT 24
)
RETURNS client_invites AS $$
DECLARE
    new_invite client_invites;
BEGIN
    INSERT INTO client_invites (
        professional_id,
        client_email,
        client_name,
        invite_code,
        expires_at
    ) VALUES (
        p_professional_id,
        p_client_email,
        p_client_name,
        generate_invite_code(),
        NOW() + (p_expires_in_hours || ' hours')::INTERVAL
    ) RETURNING * INTO new_invite;
    
    RETURN new_invite;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar função para validar convite
CREATE OR REPLACE FUNCTION validate_invite_code(p_invite_code TEXT)
RETURNS TABLE(
    is_valid BOOLEAN,
    professional_id UUID,
    client_email TEXT,
    client_name TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        true as is_valid,
        ci.professional_id,
        ci.client_email,
        ci.client_name,
        ci.expires_at
    FROM client_invites ci
    WHERE ci.invite_code = p_invite_code
        AND ci.expires_at > NOW()
        AND ci.is_active = true
        AND ci.used_at IS NULL;
    
    -- Se não encontrou, retornar inválido
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 10. Criar função para marcar convite como usado
CREATE OR REPLACE FUNCTION mark_invite_used(p_invite_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    invite_exists BOOLEAN;
BEGIN
    UPDATE client_invites 
    SET used_at = NOW()
    WHERE invite_code = p_invite_code
        AND expires_at > NOW()
        AND is_active = true
        AND used_at IS NULL;
    
    GET DIAGNOSTICS invite_exists = ROW_COUNT;
    RETURN invite_exists > 0;
END;
$$ LANGUAGE plpgsql;

-- 11. Criar função para limpar convites expirados
CREATE OR REPLACE FUNCTION cleanup_expired_invites()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM client_invites 
    WHERE expires_at < NOW() 
        OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 12. Criar trigger para atualizar updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_client_invites_updated_at') THEN
        CREATE TRIGGER update_client_invites_updated_at
            BEFORE UPDATE ON client_invites
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Trigger update_client_invites_updated_at criado!';
    ELSE
        RAISE NOTICE 'Trigger update_client_invites_updated_at já existe!';
    END IF;
END $$;

-- 13. Verificar se tudo foi criado
SELECT 
    'Sistema de segurança implementado!' as status,
    (SELECT COUNT(*) FROM client_invites) as total_invites,
    (SELECT COUNT(*) FROM client_sessions) as total_sessions;

-- 14. Mostrar estrutura das novas tabelas
\d client_invites;
\d client_sessions;
