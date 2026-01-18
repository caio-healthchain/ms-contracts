const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const contractsAnalytics = require('../services/analytics/contractsAnalytics');

const TOOLS = [
  {
    name: 'get_contract_by_operadora',
    description: 'Busca o contrato ativo de uma operadora de saúde. Útil para "Qual é o contrato da Unimed?" ou "Buscar contrato da Amil"',
    inputSchema: {
      type: 'object',
      properties: {
        operadoraNome: {
          type: 'string',
          description: 'Nome da operadora (ex: Unimed, Amil, Particular H9J)'
        },
        hospitalId: {
          type: 'string',
          description: 'ID do hospital (default: hosp_sagrada_familia_001)',
          default: 'hosp_sagrada_familia_001'
        }
      },
      required: ['operadoraNome']
    }
  },
  {
    name: 'get_contract_items',
    description: 'Lista os itens (procedimentos, materiais, medicamentos) de um contrato',
    inputSchema: {
      type: 'object',
      properties: {
        contratoId: {
          type: 'string',
          description: 'ID do contrato'
        },
        page: {
          type: 'number',
          description: 'Número da página (default: 1)',
          default: 1
        },
        limit: {
          type: 'number',
          description: 'Itens por página (default: 50)',
          default: 50
        }
      },
      required: ['contratoId']
    }
  },
  {
    name: 'get_procedure_price',
    description: 'Busca o valor contratado de um procedimento específico em um contrato',
    inputSchema: {
      type: 'object',
      properties: {
        contratoId: {
          type: 'string',
          description: 'ID do contrato'
        },
        codigoTUSS: {
          type: 'string',
          description: 'Código TUSS do procedimento'
        }
      },
      required: ['contratoId', 'codigoTUSS']
    }
  },
  {
    name: 'get_contract_summary',
    description: 'Retorna um resumo do contrato com estatísticas (total de itens, valor total, valor médio, etc)',
    inputSchema: {
      type: 'object',
      properties: {
        contratoId: {
          type: 'string',
          description: 'ID do contrato'
        }
      },
      required: ['contratoId']
    }
  },
  {
    name: 'list_contracts_by_operadora',
    description: 'Lista todos os contratos (ativos e inativos) de uma operadora',
    inputSchema: {
      type: 'object',
      properties: {
        operadoraNome: {
          type: 'string',
          description: 'Nome da operadora (ex: Unimed, Amil, Particular H9J)'
        }
      },
      required: ['operadoraNome']
    }
  }
];

class ContractsMCPServer {
  constructor() {
    this.server = new Server(
      { name: 'lazarus-contracts-mcp', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      console.log(`[MCP] Executando tool: ${name}`, { args });

      try {
        let result;
        switch (name) {
          case 'get_contract_by_operadora':
            result = await contractsAnalytics.getContractByOperadora(
              args.operadoraNome,
              args.hospitalId
            );
            break;
          case 'get_contract_items':
            result = await contractsAnalytics.getContractItems(
              args.contratoId,
              { page: args.page, limit: args.limit }
            );
            break;
          case 'get_procedure_price':
            result = await contractsAnalytics.getProcedurePrice(
              args.contratoId,
              args.codigoTUSS
            );
            break;
          case 'get_contract_summary':
            result = await contractsAnalytics.getContractSummary(args.contratoId);
            break;
          case 'list_contracts_by_operadora':
            result = await contractsAnalytics.listContractsByOperadora(args.operadoraNome);
            break;
          default:
            throw new Error(`Tool desconhecida: ${name}`);
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      } catch (error) {
        console.error(`[MCP] Erro ao executar tool ${name}:`, error);
        return {
          content: [{ type: 'text', text: `Erro: ${error.message}` }],
          isError: true
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('[MCP] Servidor MCP iniciado');
  }
}

if (require.main === module) {
  const mcpServer = new ContractsMCPServer();
  mcpServer.run().catch((error) => {
    console.error('[MCP] Erro ao iniciar:', error);
    process.exit(1);
  });
}

module.exports = { ContractsMCPServer };
