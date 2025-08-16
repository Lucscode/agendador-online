# 🚀 Guia de Onboarding - Agendador Online

## 📋 Visão Geral

Este sistema permite que você cadastre novos clientes (barbearias, salões, consultórios, etc.) de forma automatizada, criando automaticamente:

- ✅ Perfil do profissional
- ✅ Serviços pré-configurados
- ✅ Horários de funcionamento
- ✅ Configurações padrão
- ✅ URLs personalizadas

## 🎯 Como Funciona

### **1. Processo Automatizado**
- **Script TypeScript**: `scripts/create-client.ts`
- **Dashboard Web**: `/super-admin/create-client`
- **Templates Pré-configurados**: 4 tipos de negócio
- **Configuração Personalizada**: Serviços customizados

### **2. Tipos de Negócio Suportados**
- 🪒 **Barbearia**: Cortes masculinos, barba, hidratação
- 💄 **Salão de Beleza**: Cortes femininos, coloração, manicure
- 🎨 **Estúdio de Tatuagem**: Tatuagens, cover-ups
- 🏥 **Consultório**: Consultas médicas, exames

## 🛠️ Métodos de Cadastro

### **Opção 1: Script TypeScript (Recomendado para Desenvolvedores)**

```typescript
import { createClientFromTemplate } from './scripts/create-client'

// Exemplo: Criar barbearia
const barbeariaData = {
  name: 'João Silva',
  business_name: 'Barbearia do João',
  email: 'joao@barbearia.com',
  phone: '(11) 99999-9999',
  address: 'Rua das Barbearias, 123 - Centro, SP',
  logo_url: 'https://exemplo.com/logo.jpg'
}

const result = await createClientFromTemplate(barbeariaData, 'barbearia')
console.log('Cliente criado:', result)
```

### **Opção 2: Dashboard Web (Recomendado para Usuários)**

1. Acesse: `/super-admin/create-client`
2. Preencha os dados em 3 passos
3. Escolha template ou serviços personalizados
4. Confirme e crie o cliente

## 📱 Interface Web - Passo a Passo

### **Passo 1: Informações Básicas**
- Nome do profissional
- Nome do negócio
- E-mail e telefone
- Endereço (opcional)
- URL da logo (opcional)

### **Passo 2: Tipo de Negócio**
- **Seleção de Template**: Escolha entre 4 opções pré-configuradas
- **Personalizado**: Crie serviços do zero
- **Visualização**: Veja serviços e preços de cada template

### **Passo 3: Confirmação**
- Revisão completa dos dados
- Resumo dos serviços
- Confirmação final

## 🔧 Templates Disponíveis

### **Barbearia**
```json
{
  "services": [
    { "name": "Corte Masculino", "price": 45.00, "duration": 30 },
    { "name": "Barba", "price": 30.00, "duration": 20 },
    { "name": "Corte + Barba", "price": 65.00, "duration": 45 },
    { "name": "Hidratação", "price": 25.00, "duration": 15 }
  ],
  "working_hours": {
    "monday": { "start": "08:00", "end": "18:00", "enabled": true },
    "saturday": { "start": "08:00", "end": "16:00", "enabled": true },
    "sunday": { "start": "08:00", "end": "16:00", "enabled": false }
  }
}
```

### **Salão de Beleza**
```json
{
  "services": [
    { "name": "Corte Feminino", "price": 60.00, "duration": 45 },
    { "name": "Coloração", "price": 120.00, "duration": 120 },
    { "name": "Escova", "price": 40.00, "duration": 30 },
    { "name": "Manicure", "price": 35.00, "duration": 45 },
    { "name": "Pedicure", "price": 35.00, "duration": 45 }
  ]
}
```

### **Estúdio de Tatuagem**
```json
{
  "services": [
    { "name": "Tatuagem Pequena", "price": 150.00, "duration": 60 },
    { "name": "Tatuagem Média", "price": 300.00, "duration": 120 },
    { "name": "Tatuagem Grande", "price": 500.00, "duration": 240 },
    { "name": "Cover-up", "price": 400.00, "duration": 180 }
  ]
}
```

### **Consultório**
```json
{
  "services": [
    { "name": "Consulta", "price": 200.00, "duration": 30 },
    { "name": "Retorno", "price": 150.00, "duration": 20 },
    { "name": "Exame", "price": 100.00, "duration": 45 }
  ]
}
```

## 🎨 Personalização de Serviços

### **Campos Disponíveis**
- **Nome**: Nome do serviço
- **Descrição**: Detalhes do serviço
- **Preço**: Valor em reais
- **Duração**: Tempo em minutos (múltiplos de 15)
- **Cor**: Cor hexadecimal para o calendário

### **Validações**
- Preço: Número positivo com 2 casas decimais
- Duração: Mínimo 15 minutos, múltiplos de 15
- Nome: Obrigatório, máximo 100 caracteres
- Cor: Formato hexadecimal válido

## 🔐 Configurações Automáticas

### **Horários de Funcionamento**
- **Segunda a Sexta**: 08:00 - 18:00
- **Sábado**: 08:00 - 16:00
- **Domingo**: Fechado

### **Configurações do Sistema**
- **Antecedência**: 30 dias para agendamento
- **Limite diário**: 20 agendamentos por dia
- **Confirmação automática**: Desabilitada
- **Lembretes**: Habilitados (24h antes)

## 🌐 URLs Geradas

### **Estrutura**
```
https://seudominio.com/{slug}
https://seudominio.com/admin/{slug}
https://seudominio.com/api/{slug}
```

### **Exemplos**
- **Barbearia do João**: `barbearia-do-joao`
- **Salão da Maria**: `salao-da-maria`
- **Estúdio do Pedro**: `estudio-do-pedro`

## 📊 Dashboard de Super Admin

### **Funcionalidades**
- **Visão Geral**: Estatísticas do sistema
- **Clientes**: Lista completa de clientes
- **Analytics**: Métricas e relatórios
- **Configurações**: Ajustes do sistema

### **Estatísticas Exibidas**
- Total de clientes
- Serviços ativos
- Agendamentos realizados
- Receita total (estimada)

## 🚨 Tratamento de Erros

### **Validações Comuns**
- Campos obrigatórios preenchidos
- Formato de e-mail válido
- Telefone com formato correto
- URL da logo válida (se fornecida)

### **Tratamento de Conflitos**
- Slug único para cada negócio
- Verificação de e-mail duplicado
- Validação de dados antes da inserção

## 🔄 Fluxo de Trabalho

### **1. Apresentação para Cliente**
- Demonstre o sistema funcionando
- Mostre exemplos de outros negócios
- Explique as funcionalidades

### **2. Coleta de Informações**
- Dados do profissional
- Tipo de negócio
- Serviços oferecidos
- Horários de funcionamento

### **3. Configuração**
- Use o dashboard web ou script
- Escolha template apropriado
- Personalize se necessário

### **4. Deploy**
- Sistema automaticamente configurado
- URLs geradas
- Cliente pode começar a usar

### **5. Treinamento**
- Mostre como usar o painel admin
- Configure horários específicos
- Personalize serviços

## 💰 Modelos de Preços Sugeridos

### **Plano Básico: R$ 49/mês**
- 1 profissional
- 5 serviços
- Suporte por e-mail
- Funcionalidades básicas

### **Plano Profissional: R$ 99/mês**
- 3 profissionais
- 15 serviços
- Suporte prioritário
- Relatórios avançados

### **Plano Empresarial: R$ 199/mês**
- Profissionais ilimitados
- Serviços ilimitados
- Suporte 24/7
- API personalizada

## 🎯 Próximos Passos

### **Melhorias Planejadas**
- [ ] Integração com WhatsApp
- [ ] Sistema de pagamentos
- [ ] Relatórios avançados
- [ ] App mobile
- [ ] Integração com Google Calendar

### **Funcionalidades Futuras**
- [ ] Sistema de fidelidade
- [ ] Marketing automation
- [ ] Integração com redes sociais
- [ ] Analytics avançados

## 🆘 Suporte

### **Documentação**
- **README.md**: Visão geral do projeto
- **INSTALACAO.md**: Guia de instalação rápida
- **ONBOARDING.md**: Este arquivo

### **Contato**
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/agendador-online/issues)
- **Documentação**: [docs/](docs/) folder
- **Exemplos**: [scripts/](scripts/) folder

---

**🎉 Agora você tem um sistema completo de onboarding para novos clientes!**

**Use o dashboard web para cadastros manuais ou o script TypeScript para automação em massa.**
