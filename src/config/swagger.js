/**
 * Configuração do Swagger UI para documentação da API
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ms-contracts API',
    version: '1.0.0',
    description: 'Microsserviço de gestão e validação de contratos hospitalares',
    contact: {
      name: 'HealthChain',
      email: 'contato@healthchain.com.br'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Servidor de Desenvolvimento'
    },
    {
      url: 'https://ms-contracts.lazarus.com.br',
      description: 'Servidor de Produção'
    }
  ],
  tags: [
    {
      name: 'Contratos',
      description: 'Endpoints para gerenciamento de contratos'
    },
    {
      name: 'Validações',
      description: 'Endpoints para validação de procedimentos e guias'
    },
    {
      name: 'Health',
      description: 'Endpoints de saúde e status do serviço'
    }
  ],
  components: {
    schemas: {
      Contrato: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '5460ecf6-3ea2-4088-bd8a-6198cfe2d76f'
          },
          operadoraId: {
            type: 'string',
            format: 'uuid',
            example: '5460ecf6-3ea2-4088-bd8a-6198cfe2d76f'
          },
          operadoraNome: {
            type: 'string',
            example: 'Hospital Nove de Julho'
          },
          contratoNumero: {
            type: 'string',
            example: 'H9J-2024-001'
          },
          vigenciaInicio: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z'
          },
          vigenciaFim: {
            type: 'string',
            format: 'date-time',
            example: '2024-12-31T23:59:59.999Z'
          },
          status: {
            type: 'string',
            enum: ['ativo', 'inativo', 'suspenso'],
            example: 'ativo'
          }
        }
      },
      ItemContrato: {
        type: 'object',
        properties: {
          codigoTUSS: {
            type: 'string',
            example: '30707013'
          },
          descricao: {
            type: 'string',
            example: 'Angioplastia coronariana'
          },
          valorContratual: {
            type: 'number',
            format: 'float',
            example: 27300.00
          },
          pacote: {
            type: 'string',
            example: 'PACOTE_CARDIOLOGIA'
          },
          materiaisInclusos: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['Stent farmacológico', 'Cateter guia']
          }
        }
      },
      ValidacaoValor: {
        type: 'object',
        required: ['operadoraId', 'codigoTUSS', 'valorCobrado'],
        properties: {
          operadoraId: {
            type: 'string',
            format: 'uuid',
            example: '5460ecf6-3ea2-4088-bd8a-6198cfe2d76f'
          },
          codigoTUSS: {
            type: 'string',
            example: '30707013'
          },
          valorCobrado: {
            type: 'number',
            format: 'float',
            example: 27300.00
          }
        }
      },
      ResultadoValidacao: {
        type: 'object',
        properties: {
          valido: {
            type: 'boolean',
            example: true
          },
          valorContratual: {
            type: 'number',
            format: 'float',
            example: 27300.00
          },
          valorCobrado: {
            type: 'number',
            format: 'float',
            example: 27300.00
          },
          diferenca: {
            type: 'number',
            format: 'float',
            example: 0.00
          },
          percentualDiferenca: {
            type: 'number',
            format: 'float',
            example: 0.00
          },
          mensagem: {
            type: 'string',
            example: 'Valor dentro do contratado'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Mensagem de erro'
          },
          details: {
            type: 'string',
            example: 'Detalhes adicionais do erro'
          }
        }
      }
    }
  }
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ["./src/routes/*.js", "./src/routes/mcpRoutes.js"] // Caminho para os arquivos de rotas com JSDoc
};

module.exports = { swaggerDefinition, swaggerOptions };
