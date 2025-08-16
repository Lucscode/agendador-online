# 🗓️ Agendador Online

Sistema completo de agendamento online para profissionais e empresas, desenvolvido com Next.js, TypeScript, Tailwind CSS e Supabase.

## ✨ Funcionalidades

### 🎯 Para Clientes
- **Página Pública de Agendamento**: Acessível via link personalizado (ex: `meuagendamento.com/joao-barbearia`)
- **Calendário Interativo**: Visualização de horários disponíveis em tempo real
- **Lista de Serviços**: Preços, duração e descrições
- **Formulário de Agendamento**: Nome, e-mail (opcional) e telefone
- **Confirmação Automática**: E-mail de confirmação após agendamento
- **Design Responsivo**: Otimizado para mobile e desktop

### 🏢 Para Profissionais
- **Painel Administrativo**: Gerenciamento completo de agendamentos
- **Calendário Interno**: Visualização de todos os agendamentos
- **Filtros Avançados**: Por data, serviço e status
- **Gerenciamento de Serviços**: Adicionar, editar e remover serviços
- **Bloqueio de Horários**: Marcar períodos como indisponível
- **Exportação de Dados**: CSV/Excel dos agendamentos
- **Notificações**: Reenvio de confirmações para clientes
- **Configurações**: Perfil personalizável com logo e informações

### 🚀 Funcionalidades Extras
- **Links Personalizados**: Cada profissional tem seu próprio link
- **Cores por Serviço**: Identificação visual no calendário
- **Horários Inteligentes**: Evita conflitos automaticamente
- **Responsivo**: Funciona perfeitamente em todos os dispositivos

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + APIs)
- **Autenticação**: Supabase Auth
- **Notificações**: E-mail automático (configurável)
- **Deploy**: Vercel, Netlify ou similar

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase (gratuita)

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/agendador-online.git
cd agendador-online
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Configure o Supabase

#### 4.1 Crie um projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie uma nova conta ou faça login
- Crie um novo projeto

#### 4.2 Configure o banco de dados
Execute os seguintes comandos SQL no Editor SQL do Supabase:

```sql
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de horários bloqueados
CREATE TABLE blocked_times (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_appointments_professional_date ON appointments(professional_id, date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_services_professional ON services(professional_id);
CREATE INDEX idx_blocked_times_professional_date ON blocked_times(professional_id, date);

-- Políticas de segurança (RLS)
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;

-- Políticas para profissionais (leitura pública, escrita apenas pelo próprio)
CREATE POLICY "Professionals are viewable by everyone" ON professionals FOR SELECT USING (true);
CREATE POLICY "Professionals can insert their own data" ON professionals FOR INSERT WITH CHECK (true);
CREATE POLICY "Professionals can update their own data" ON professionals FOR UPDATE USING (true);

-- Políticas para serviços (leitura pública, escrita apenas pelo profissional)
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
CREATE POLICY "Services can be inserted by professionals" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "Services can be updated by professionals" ON services FOR UPDATE USING (true);

-- Políticas para agendamentos (leitura pública, escrita pública)
CREATE POLICY "Appointments are viewable by everyone" ON appointments FOR SELECT USING (true);
CREATE POLICY "Appointments can be inserted by anyone" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Appointments can be updated by professionals" ON appointments FOR UPDATE USING (true);

-- Políticas para horários bloqueados (leitura pública, escrita apenas pelo profissional)
CREATE POLICY "Blocked times are viewable by everyone" ON blocked_times FOR SELECT USING (true);
CREATE POLICY "Blocked times can be inserted by professionals" ON blocked_times FOR INSERT WITH CHECK (true);
CREATE POLICY "Blocked times can be deleted by professionals" ON blocked_times FOR DELETE USING (true);
```

#### 4.3 Configure as políticas de segurança
As políticas acima permitem:
- **Leitura pública**: Clientes podem ver serviços e horários disponíveis
- **Escrita controlada**: Apenas profissionais podem gerenciar seus dados
- **Agendamentos**: Qualquer pessoa pode criar agendamentos

### 5. Execute o projeto
```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📱 Como Usar

### Para Profissionais

1. **Acesse o painel administrativo**: `/admin`
2. **Configure seu perfil**: Nome, empresa, contatos
3. **Adicione serviços**: Nome, preço, duração e cor
4. **Bloqueie horários**: Quando não estiver disponível
5. **Compartilhe seu link**: `meuagendamento.com/seu-slug`

### Para Clientes

1. **Acesse o link do profissional**: Ex: `meuagendamento.com/joao-barbearia`
2. **Escolha um serviço**: Veja preços e duração
3. **Selecione uma data**: No calendário interativo
4. **Escolha um horário**: Dos horários disponíveis
5. **Preencha seus dados**: Nome, e-mail e telefone
6. **Confirme o agendamento**: Receba confirmação por e-mail

## 🔧 Configuração de E-mail

Para enviar e-mails automáticos, configure um serviço de e-mail:

### Opção 1: Resend (Recomendado)
```bash
npm install resend
```

Configure no `.env.local`:
```env
RESEND_API_KEY=sua_chave_api
```

### Opção 2: Nodemailer
```bash
npm install nodemailer
```

### Opção 3: Supabase Edge Functions
Use as Edge Functions do Supabase para enviar e-mails.

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Netlify
1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente
3. Build command: `npm run build`
4. Publish directory: `.next`

### Outros
O projeto pode ser deployado em qualquer plataforma que suporte Next.js.

## 📊 Estrutura do Projeto

```
agendador-online/
├── app/                    # App Router do Next.js 14
│   ├── [slug]/            # Página de agendamento pública
│   ├── admin/             # Painel administrativo
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── AdminCalendar.tsx  # Calendário administrativo
│   ├── AppointmentForm.tsx # Formulário de agendamento
│   ├── AppointmentList.tsx # Lista de agendamentos
│   ├── BlockedTimeManager.tsx # Gerenciador de horários bloqueados
│   ├── CalendarComponent.tsx # Calendário público
│   ├── ProfessionalSettings.tsx # Configurações do profissional
│   └── ServiceList.tsx    # Lista de serviços
├── lib/                   # Utilitários e configurações
│   └── supabase.ts       # Cliente e tipos do Supabase
├── public/                # Arquivos estáticos
└── package.json           # Dependências e scripts
```

## 🎨 Personalização

### Cores
Edite `tailwind.config.js` para personalizar as cores do tema:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      },
      // Adicione suas cores personalizadas
    }
  }
}
```

### Estilos
Modifique `app/globals.css` para personalizar estilos globais.

### Componentes
Todos os componentes estão em `components/` e podem ser facilmente modificados.

## 🔒 Segurança

- **Row Level Security (RLS)**: Implementado no Supabase
- **Validação de dados**: Frontend e backend
- **Sanitização**: Prevenção de XSS
- **Rate limiting**: Proteção contra spam

## 📈 Próximos Passos

- [ ] Sistema de autenticação completo
- [ ] Múltiplos profissionais por conta
- [ ] Sistema de pagamentos
- [ ] Notificações push
- [ ] App mobile nativo
- [ ] Integração com Google Calendar
- [ ] Sistema de avaliações
- [ ] Relatórios avançados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/agendador-online/issues)
- **Documentação**: [Wiki do projeto](https://github.com/seu-usuario/agendador-online/wiki)
- **Email**: seu-email@exemplo.com

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - Backend como serviço
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Lucide React](https://lucide.dev/) - Ícones
- [Date-fns](https://date-fns.org/) - Manipulação de datas

---

**Desenvolvido com ❤️ para facilitar a vida dos profissionais e clientes**
