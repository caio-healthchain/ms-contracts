const { OpenAI } = require('openai');
const contractsAnalytics = require('../services/analytics/contractsAnalytics');

/**
 * Suite Completa de Testes para MCP do ms-contracts
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const results = [];

/**
 * Teste 1: get_contract_by_operadora (Particular H9J)
 */
async function testGetContractByOperadora() {
  try {
    console.log('\n📋 Testando: get_contract_by_operadora (Particular H9J)');
    
    const result = await contractsAnalytics.getContractByOperadora('Particular H9J');
    
    const passed = result.encontrado && result.contrato !== null;

    results.push({
      name: 'get_contract_by_operadora',
      passed,
      message: passed 
        ? `Contrato encontrado: ${result.contrato.numero}`
        : result.mensagem,
      data: result
    });

    if (passed) {
      console.log(`   ✅ Contrato: ${result.contrato.numero}`);
      console.log(`   Operadora: ${result.contrato.operadora}`);
      console.log(`   Status: ${result.contrato.status}`);
      console.log(`   Total de itens: ${result.contrato.totalItens}`);
    } else {
      console.log(`   ❌ ${result.mensagem}`);
    }
  } catch (error) {
    results.push({
      name: 'get_contract_by_operadora',
      passed: false,
      message: `Erro ao buscar contrato`,
      error: error.message
    });
    console.error(`   ❌ Erro: ${error.message}`);
  }
}

/**
 * Teste 2: get_contract_items
 */
async function testGetContractItems() {
  try {
    console.log('\n📋 Testando: get_contract_items');
    
    // Primeiro, buscar o contrato
    const contractResult = await contractsAnalytics.getContractByOperadora('Particular H9J');
    
    if (!contractResult.encontrado) {
      throw new Error('Contrato não encontrado');
    }

    const contratoId = contractResult.contrato.id;
    const itemsResult = await contractsAnalytics.getContractItems(contratoId, { page: 1, limit: 10 });
    
    const passed = Array.isArray(itemsResult.itens) && itemsResult.itens.length > 0;

    results.push({
      name: 'get_contract_items',
      passed,
      message: passed 
        ? `${itemsResult.pagination.total} itens encontrados`
        : 'Nenhum item encontrado',
      data: itemsResult
    });

    console.log(`   Total de itens: ${itemsResult.pagination.total}`);
    console.log(`   Página 1 de ${itemsResult.pagination.totalPages}`);
    if (itemsResult.itens.length > 0) {
      console.log(`   Primeiros 3 itens:`);
      itemsResult.itens.slice(0, 3).forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.codigoTUSS} - R$ ${parseFloat(item.valorContratado).toFixed(2)}`);
      });
    }
  } catch (error) {
    results.push({
      name: 'get_contract_items',
      passed: false,
      message: `Erro ao listar itens`,
      error: error.message
    });
    console.error(`   ❌ Erro: ${error.message}`);
  }
}

/**
 * Teste 3: get_procedure_price
 */
async function testGetProcedurePrice() {
  try {
    console.log('\n📋 Testando: get_procedure_price');
    
    // Primeiro, buscar o contrato
    const contractResult = await contractsAnalytics.getContractByOperadora('Particular H9J');
    
    if (!contractResult.encontrado) {
      throw new Error('Contrato não encontrado');
    }

    const contratoId = contractResult.contrato.id;
    
    // Buscar um item para testar
    const itemsResult = await contractsAnalytics.getContractItems(contratoId, { page: 1, limit: 1 });
    
    if (itemsResult.itens.length === 0) {
      throw new Error('Nenhum item encontrado para testar');
    }

    const codigoTUSS = itemsResult.itens[0].codigoTUSS;
    const priceResult = await contractsAnalytics.getProcedurePrice(contratoId, codigoTUSS);
    
    const passed = priceResult.encontrado && priceResult.preco !== null;

    results.push({
      name: 'get_procedure_price',
      passed,
      message: passed 
        ? `Preço encontrado: R$ ${priceResult.preco.valorContratado.toFixed(2)}`
        : priceResult.mensagem,
      data: priceResult
    });

    if (passed) {
      console.log(`   Código TUSS: ${priceResult.preco.codigoTUSS}`);
      console.log(`   Valor Contratado: R$ ${priceResult.preco.valorContratado.toFixed(2)}`);
      console.log(`   No Pacote: ${priceResult.preco.estaNoPacote}`);
    } else {
      console.log(`   ❌ ${priceResult.mensagem}`);
    }
  } catch (error) {
    results.push({
      name: 'get_procedure_price',
      passed: false,
      message: `Erro ao buscar preço`,
      error: error.message
    });
    console.error(`   ❌ Erro: ${error.message}`);
  }
}

/**
 * Teste 4: get_contract_summary
 */
async function testGetContractSummary() {
  try {
    console.log('\n📋 Testando: get_contract_summary');
    
    // Primeiro, buscar o contrato
    const contractResult = await contractsAnalytics.getContractByOperadora('Particular H9J');
    
    if (!contractResult.encontrado) {
      throw new Error('Contrato não encontrado');
    }

    const contratoId = contractResult.contrato.id;
    const summaryResult = await contractsAnalytics.getContractSummary(contratoId);
    
    const passed = summaryResult.encontrado && summaryResult.resumo !== null;

    results.push({
      name: 'get_contract_summary',
      passed,
      message: passed 
        ? `Resumo obtido com sucesso`
        : summaryResult.mensagem,
      data: summaryResult
    });

    if (passed) {
      const stats = summaryResult.resumo.estatisticas;
      console.log(`   Total de itens: ${stats.totalItens}`);
      console.log(`   Valor total: R$ ${stats.valorTotal.toFixed(2)}`);
      console.log(`   Valor médio: R$ ${stats.valorMedio.toFixed(2)}`);
      console.log(`   Itens no pacote: ${stats.itensNoPacote}`);
      console.log(`   Tipos: ${Object.keys(stats.porTipo).join(', ')}`);
    } else {
      console.log(`   ❌ ${summaryResult.mensagem}`);
    }
  } catch (error) {
    results.push({
      name: 'get_contract_summary',
      passed: false,
      message: `Erro ao buscar resumo`,
      error: error.message
    });
    console.error(`   ❌ Erro: ${error.message}`);
  }
}

/**
 * Teste 5: list_contracts_by_operadora
 */
async function testListContractsByOperadora() {
  try {
    console.log('\n📋 Testando: list_contracts_by_operadora');
    
    const listResult = await contractsAnalytics.listContractsByOperadora('Unimed');
    
    const passed = listResult.encontrado && Array.isArray(listResult.contratos);

    results.push({
      name: 'list_contracts_by_operadora',
      passed,
      message: passed 
        ? `${listResult.contratos.length} contrato(s) encontrado(s)`
        : listResult.mensagem,
      data: listResult
    });

    console.log(`   ${listResult.mensagem}`);
    if (passed && listResult.contratos.length > 0) {
      listResult.contratos.forEach((c, idx) => {
        console.log(`   ${idx + 1}. ${c.numero} - Status: ${c.status} (${c.totalItens} itens)`);
      });
    }
  } catch (error) {
    results.push({
      name: 'list_contracts_by_operadora',
      passed: false,
      message: `Erro ao listar contratos`,
      error: error.message
    });
    console.error(`   ❌ Erro: ${error.message}`);
  }
}

/**
 * Validação com OpenAI
 */
async function validateWithOpenAI() {
  try {
    console.log('\n\n🤖 Validando resultados com OpenAI...\n');

    const testSummary = results
      .map(
        (r) =>
          `- ${r.name}: ${r.passed ? '✅ PASSOU' : '❌ FALHOU'} - ${r.message}`
      )
      .join('\n');

    const prompt = `
Você é um especialista em QA de APIs. Analise os seguintes resultados de testes do MCP do ms-contracts:

${testSummary}

Dados dos testes (resumo):
${JSON.stringify(results.map(r => ({ 
  name: r.name, 
  passed: r.passed,
  message: r.message
})), null, 2)}

Por favor, forneça:
1. Um resumo geral do status dos testes
2. Quais testes passaram e quais falharam
3. Análise dos dados retornados
4. Recomendações para melhorias
5. Se há algum problema crítico

Seja conciso e direto.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const analysis = response.choices[0]?.message?.content || '';
    console.log('═'.repeat(80));
    console.log(analysis);
    console.log('═'.repeat(80));
  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error.message);
  }
}

/**
 * Executar todos os testes
 */
async function runAllTests() {
  console.log('🧪 SUITE DE TESTES COMPLETA DO MCP ms-contracts');
  console.log('═'.repeat(80));
  console.log(`Data: ${new Date().toISOString()}`);
  console.log('═'.repeat(80));

  await testGetContractByOperadora();
  await testGetContractItems();
  await testGetProcedurePrice();
  await testGetContractSummary();
  await testListContractsByOperadora();

  // Exibir resumo
  console.log('\n\n📊 RESUMO DOS TESTES');
  console.log('═'.repeat(80));

  results.forEach((result) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.error) {
      console.log(`   Erro: ${result.error}`);
    }
  });

  console.log('\n' + '═'.repeat(80));
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log(
    `📈 Resultado Final: ${passedCount}/${totalCount} testes passaram (${Math.round((passedCount / totalCount) * 100)}%)\n`
  );

  // Validar com OpenAI
  await validateWithOpenAI();
}

// Executar testes
runAllTests().catch(console.error);
