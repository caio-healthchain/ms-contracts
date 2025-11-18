const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ContractService {
  /**
   * Lista contratos com paginação e filtros
   */
  async listContracts({ operadoraId, status, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (operadoraId) where.operadoraId = operadoraId;
    if (status) where.status = status;

    const [contracts, total] = await Promise.all([
      prisma.contrato.findMany({
        where,
        include: {
          operadora: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
              codigoANS: true
            }
          },
          _count: {
            select: { itens: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contrato.count({ where })
    ]);

    return {
      data: contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Busca contrato por ID
   */
  async getContractById(id) {
    return await prisma.contrato.findUnique({
      where: { id },
      include: {
        operadora: true,
        itens: {
          take: 10,
          orderBy: { valorContratado: 'desc' }
        },
        _count: {
          select: { itens: true }
        }
      }
    });
  }

  /**
   * Busca itens de um contrato
   */
  async getContractItems(contractId, { codigoTUSS, page = 1, limit = 50 }) {
    const skip = (page - 1) * limit;
    
    const where = { contratoId: contractId };
    if (codigoTUSS) where.codigoTUSS = { contains: codigoTUSS };

    const [items, total] = await Promise.all([
      prisma.contratoItem.findMany({
        where,
        include: {
          materiaisInclusos: true
        },
        skip,
        take: limit,
        orderBy: { valorContratado: 'desc' }
      }),
      prisma.contratoItem.count({ where })
    ]);

    // Buscar descrições da tabela tussProcedimentos
    const codigosTUSS = items.map(item => item.codigoTUSS);
    const procedimentos = await prisma.$queryRaw`
      SELECT "codigoTUSS", termo as descricao
      FROM "tussProcedimentos"
      WHERE "codigoTUSS" = ANY(${codigosTUSS}::text[])
    `;

    // Criar mapa de descrições
    const descricaoMap = {};
    procedimentos.forEach(proc => {
      descricaoMap[proc.codigoTUSS] = proc.descricao;
    });

    // Adicionar descrição aos itens e valores padrão
    const itemsWithDescricao = items.map(item => ({
      ...item,
      descricao: item.descricao || descricaoMap[item.codigoTUSS] || null,
      tipoItem: item.tipoItem || 'PROCEDIMENTO',
      valorMaximo: item.valorMaximo || null,
      quantidadeMaxima: item.quantidadeMaxima || null
    }));

    return {
      data: itemsWithDescricao,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Busca item específico do contrato
   */
  async getContractItem(contractId, codigoTUSS) {
    const item = await prisma.contratoItem.findFirst({
      where: {
        contratoId: contractId,
        codigoTUSS
      },
      include: {
        materiaisInclusos: true,
        contrato: {
          include: {
            operadora: true
          }
        }
      }
    });

    if (!item) return null;

    // Buscar descrição da tabela tussProcedimentos se não existir
    if (!item.descricao) {
      const procedimento = await prisma.$queryRaw`
        SELECT termo as descricao
        FROM "tussProcedimentos"
        WHERE "codigoTUSS" = ${codigoTUSS}
        LIMIT 1
      `;
      
      if (procedimento && procedimento.length > 0) {
        item.descricao = procedimento[0].descricao;
      }
    }

    // Adicionar valores padrão
    return {
      ...item,
      tipoItem: item.tipoItem || 'PROCEDIMENTO',
      valorMaximo: item.valorMaximo || null,
      quantidadeMaxima: item.quantidadeMaxima || null
    };
  }

  /**
   * Cria novo contrato
   */
  async createContract(data) {
    const { itens, ...contractData } = data;

    return await prisma.contrato.create({
      data: {
        ...contractData,
        itens: itens ? {
          create: itens.map(item => ({
            ...item,
            materiaisInclusos: item.materiaisInclusos ? {
              create: item.materiaisInclusos
            } : undefined
          }))
        } : undefined
      },
      include: {
        operadora: true,
        itens: {
          include: {
            materiaisInclusos: true
          }
        }
      }
    });
  }

  /**
   * Atualiza contrato
   */
  async updateContract(id, data) {
    return await prisma.contrato.update({
      where: { id },
      data,
      include: {
        operadora: true,
        _count: {
          select: { itens: true }
        }
      }
    });
  }

  /**
   * Deleta contrato (soft delete - muda status para INATIVO)
   */
  async deleteContract(id) {
    return await prisma.contrato.update({
      where: { id },
      data: { status: 'INATIVO' }
    });
  }

  /**
   * Busca contrato ativo de uma operadora
   */
  async getActiveContract(operadoraId) {
    return await prisma.contrato.findFirst({
      where: {
        operadoraId,
        status: 'ATIVO',
        dataFim: { gte: new Date() }
      },
      include: {
        operadora: true,
        itens: {
          include: {
            materiaisInclusos: true
          }
        }
      }
    });
  }
}

module.exports = new ContractService();
