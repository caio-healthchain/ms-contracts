const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();

class ContractsAnalyticsService {
  /**
   * Busca contrato ativo de uma operadora
   */
  async getContractByOperadora(operadoraNome, hospitalId = 'hosp_sagrada_familia_001') {
    try {
      // Buscar operadora por nome
      const operadora = await prisma.operadora.findFirst({
        where: {
          nomeFantasia: {
            contains: operadoraNome,
            mode: 'insensitive'
          }
        }
      });

      if (!operadora) {
        return {
          encontrado: false,
          mensagem: `Operadora "${operadoraNome}" não encontrada`,
          contrato: null
        };
      }

      // Buscar contrato ativo (status = ATIVO, independente de dataFim)
      const contrato = await prisma.contrato.findFirst({
        where: {
          operadoraId: operadora.id,
          status: 'ATIVO'
        },
        include: {
          operadora: true,
          _count: {
            select: { itens: true }
          }
        }
      });

      if (!contrato) {
        return {
          encontrado: false,
          mensagem: `Nenhum contrato ativo encontrado para ${operadora.nomeFantasia}`,
          contrato: null
        };
      }

      return {
        encontrado: true,
        mensagem: `Contrato encontrado`,
        contrato: {
          id: contrato.id,
          numero: contrato.numero,
          operadora: contrato.operadora.nomeFantasia,
          dataInicio: contrato.dataInicio,
          dataFim: contrato.dataFim,
          status: contrato.status,
          prazoMedioPagamento: contrato.prazoMedioPagamento,
          totalItens: contrato._count.itens
        }
      };
    } catch (error) {
      throw new Error(`Erro ao buscar contrato: ${error.message}`);
    }
  }

  /**
   * Lista itens do contrato com resumo
   */
  async getContractItems(contratoId, { page = 1, limit = 50 } = {}) {
    try {
      const skip = (page - 1) * limit;

      const [itens, total] = await Promise.all([
        prisma.contratoItem.findMany({
          where: { contratoId },
          select: {
            id: true,
            codigoTUSS: true,
            descricao: true,
            tipoItem: true,
            valorContratado: true,
            valorMaximo: true,
            quantidadeMaxima: true,
            estaNoPacote: true,
            requerAutorizacao: true
          },
          skip,
          take: limit,
          orderBy: { valorContratado: 'desc' }
        }),
        prisma.contratoItem.count({ where: { contratoId } })
      ]);

      return {
        itens,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erro ao listar itens do contrato: ${error.message}`);
    }
  }

  /**
   * Busca valor contratado de um procedimento
   */
  async getProcedurePrice(contratoId, codigoTUSS) {
    try {
      const item = await prisma.contratoItem.findFirst({
        where: {
          contratoId,
          codigoTUSS
        },
        select: {
          codigoTUSS: true,
          descricao: true,
          valorContratado: true,
          valorMaximo: true,
          estaNoPacote: true,
          requerAutorizacao: true,
          tipoItem: true
        }
      });

      if (!item) {
        return {
          encontrado: false,
          mensagem: `Procedimento ${codigoTUSS} não encontrado no contrato`,
          preco: null
        };
      }

      return {
        encontrado: true,
        mensagem: 'Preço encontrado',
        preco: {
          codigoTUSS: item.codigoTUSS,
          descricao: item.descricao,
          valorContratado: parseFloat(item.valorContratado),
          valorMaximo: item.valorMaximo ? parseFloat(item.valorMaximo) : null,
          estaNoPacote: item.estaNoPacote,
          requerAutorizacao: item.requerAutorizacao,
          tipoItem: item.tipoItem
        }
      };
    } catch (error) {
      throw new Error(`Erro ao buscar preço do procedimento: ${error.message}`);
    }
  }

  /**
   * Resumo do contrato com estatísticas
   */
  async getContractSummary(contratoId) {
    try {
      const contrato = await prisma.contrato.findUnique({
        where: { id: contratoId },
        include: {
          operadora: true,
          itens: {
            select: {
              valorContratado: true,
              tipoItem: true,
              estaNoPacote: true
            }
          }
        }
      });

      if (!contrato) {
        return {
          encontrado: false,
          mensagem: 'Contrato não encontrado',
          resumo: null
        };
      }

      // Calcular estatísticas
      const totalItens = contrato.itens.length;
      const valorTotal = contrato.itens.reduce((sum, item) => sum + parseFloat(item.valorContratado || 0), 0);
      const valorMedio = totalItens > 0 ? valorTotal / totalItens : 0;
      const itensNoPacote = contrato.itens.filter(i => i.estaNoPacote).length;
      
      // Agrupar por tipo
      const porTipo = {};
      contrato.itens.forEach(item => {
        const tipo = item.tipoItem || 'PROCEDIMENTO';
        if (!porTipo[tipo]) {
          porTipo[tipo] = { quantidade: 0, valor: 0 };
        }
        porTipo[tipo].quantidade += 1;
        porTipo[tipo].valor += parseFloat(item.valorContratado || 0);
      });

      return {
        encontrado: true,
        mensagem: 'Resumo obtido com sucesso',
        resumo: {
          contrato: {
            numero: contrato.numero,
            operadora: contrato.operadora.nomeFantasia,
            dataInicio: contrato.dataInicio,
            dataFim: contrato.dataFim,
            status: contrato.status
          },
          estatisticas: {
            totalItens,
            valorTotal,
            valorMedio,
            itensNoPacote,
            porTipo
          }
        }
      };
    } catch (error) {
      throw new Error(`Erro ao buscar resumo do contrato: ${error.message}`);
    }
  }

  /**
   * Busca contratos por operadora com filtros
   */
  async listContractsByOperadora(operadoraNome) {
    try {
      const operadora = await prisma.operadora.findFirst({
        where: {
          nomeFantasia: {
            contains: operadoraNome,
            mode: 'insensitive'
          }
        }
      });

      if (!operadora) {
        return {
          encontrado: false,
          contratos: [],
          mensagem: `Operadora "${operadoraNome}" não encontrada`
        };
      }

      const contratos = await prisma.contrato.findMany({
        where: {
          operadoraId: operadora.id,
          status: 'ATIVO'
        },
        include: {
          operadora: true,
          _count: {
            select: { itens: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        encontrado: true,
        contratos: contratos.map(c => ({
          id: c.id,
          numero: c.numero,
          status: c.status,
          dataInicio: c.dataInicio,
          dataFim: c.dataFim,
          totalItens: c._count.itens
        })),
        mensagem: `${contratos.length} contrato(s) encontrado(s)`
      };
    } catch (error) {
      throw new Error(`Erro ao listar contratos: ${error.message}`);
    }
  }
}

module.exports = new ContractsAnalyticsService();
