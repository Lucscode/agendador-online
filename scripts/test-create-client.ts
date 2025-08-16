import { createClientFromTemplate } from './create-client'

// Exemplo de uso do script de criação de clientes
async function testCreateClient() {
  try {
    console.log('🧪 Testando criação de cliente...')
    
    // Dados de exemplo para uma barbearia
    const barbeariaData = {
      name: 'João Silva',
      business_name: 'Barbearia do João',
      email: 'joao@barbearia.com',
      phone: '(11) 99999-9999',
      address: 'Rua das Barbearias, 123 - Centro, São Paulo',
      logo_url: 'https://exemplo.com/logo.jpg'
    }
    
    console.log('📝 Dados da barbearia:', barbeariaData)
    
    // Criar cliente usando template
    const result = await createClientFromTemplate(barbeariaData, 'barbearia')
    
    console.log('✅ Cliente criado com sucesso!')
    console.log('📊 Resultado:', JSON.stringify(result, null, 2))
    
    return result
    
  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error)
    throw error
  }
}

// Executar teste se for chamado diretamente
if (require.main === module) {
  testCreateClient()
    .then(() => {
      console.log('🎉 Teste concluído com sucesso!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Teste falhou:', error)
      process.exit(1)
    })
}

export { testCreateClient }
