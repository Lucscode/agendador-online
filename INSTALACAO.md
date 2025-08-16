# 🚀 Instalação Rápida - Agendador Online

## 📋 Pré-requisitos
- Node.js 18+ instalado
- Conta no Supabase (gratuita)

## ⚡ Instalação em 5 Passos

### 1. Clone e Instale
```bash
git clone https://github.com/seu-usuario/agendador-online.git
cd agendador-online
npm install
```

### 2. Configure o Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Vá em "Settings" → "API"
- Copie a URL e a chave anônima

### 3. Configure as Variáveis
Crie um arquivo `.env.local` na raiz:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 4. Configure o Banco
- No Supabase, vá em "SQL Editor"
- Execute o arquivo `database/schema.sql`
- Isso criará todas as tabelas e dados de exemplo

### 5. Execute o Projeto
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🎯 Teste Rápido

### Para Clientes
- Acesse: `http://localhost:3000/joao-barbearia`
- Veja a página de agendamento funcionando

### Para Profissionais
- Acesse: `http://localhost:3000/admin`
- Veja o painel administrativo

## 🔧 Configuração de E-mail (Opcional)

Para enviar e-mails automáticos:

```bash
npm install resend
```

Adicione no `.env.local`:
```env
RESEND_API_KEY=sua_chave_resend
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório
2. Configure as variáveis de ambiente
3. Deploy automático

### Netlify
1. Conecte seu repositório
2. Build command: `npm run build`
3. Publish directory: `.next`

## ❗ Problemas Comuns

### Erro de Conexão com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto está ativo no Supabase

### Erro de Build
- Limpe o cache: `rm -rf .next && npm run build`
- Verifique se todas as dependências estão instaladas

### Página em Branco
- Verifique o console do navegador
- Confirme se o Supabase está respondendo

## 📱 Funcionalidades Testadas

✅ Página inicial responsiva  
✅ Página de agendamento pública  
✅ Painel administrativo  
✅ Calendário interativo  
✅ Gerenciamento de serviços  
✅ Bloqueio de horários  
✅ Formulários de agendamento  
✅ Filtros e busca  
✅ Exportação de dados  

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/agendador-online/issues)
- **Documentação**: [README.md](README.md)
- **Esquema do Banco**: [database/schema.sql](database/schema.sql)

---

**🎉 Seu agendador online está funcionando! Compartilhe o link com seus clientes.**
