const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ValidationService {
  /**
   * Valida se o valor cobrado está de acordo com o contrato
   */
  async validateValor(operadoraId, codigoTUSS, valorCobrado) {
    try {
      // Buscar contrato ativo da operadora
      const contrato = await prisma.contrato.findFirst({
        where: {
          operadoraId,
          status: 'ATIVO',
          dataFim: { gte: new Date() }
        },
        include: {
          itens: {
            where: { codigoTUSS }
          }
        }
      });

      if (!contrato) {
        return {
          isValid: false,
          tipo: 'VALOR',
          status: 'ERRO',
          mensagem: 'Contrato não encontrado ou inativo',
          detalhes: null
        };
      }

      const item = contrato.itens[0];
      
      if (!item) {
        return {
          isValid: false,
          tipo: 'VALOR',
          status: 'NAO_ENCONTRADO',
          mensagem: `Procedimento ${codigoTUSS} não encontrado no contrato`,
          detalhes: null
        };
      }

      const valorContratado = parseFloat(item.valorContratado);
      const valorCobradoNum = parseFloat(valorCobrado);
      const diferenca = valorCobradoNum - valorContratado;
      const percentualDiferenca = ((diferenca / valorContratado) * 100).toFixed(2);

      const isValid = Math.abs(diferenca) < 0.01; // Tolerância de 1 centavo

      return {
        isValid,
        tipo: 'VALOR',
        status: isValid ? 'CONFORME' : 'DIVERGENTE',
        mensagem: isValid 
          ? 'Valor conforme contrato' 
          : `Valor divergente: ${diferenca > 0 ? '+' : ''}R$ ${diferenca.toFixed(2)} (${percentualDiferenca}%)`,
        detalhes: {
          codigoTUSS,
          valorContratado,
          valorCobrado: valorCobradoNum,
          diferenca,
          percentualDiferenca: parseFloat(percentualDiferenca),
          contratoNumero: contrato.numero
        }
      };
    } catch (error) {
      console.error('Erro ao validar valor:', error);
      throw error;
    }
  }

  /**
   * Valida se o procedimento está no pacote contratual
   */
  async validatePacote(operadoraId, codigoTUSS) {
    try {
      const contrato = await prisma.contrato.findFirst({
        where: {
          operadoraId,
          status: 'ATIVO',
          dataFim: { gte: new Date() }
        },
        include: {
          itens: {
            where: { codigoTUSS }
          }
        }
      });

      if (!contrato) {
        return {
          isValid: false,
          tipo: 'PACOTE',
          status: 'ERRO',
          mensagem: 'Contrato não encontrado ou inativo',
          detalhes: null
        };
      }

      const item = contrato.itens[0];

      if (!item) {
        return {
          isValid: false,
          tipo: 'PACOTE',
          status: 'FORA_PACOTE',
          mensagem: `Procedimento ${codigoTUSS} não está no pacote contratual`,
          detalhes: {
            codigoTUSS,
            contratoNumero: contrato.numero,
            requerAutorizacao: true
          }
        };
      }

      const isValid = item.estaNoPacote;

      return {
        isValid,
        tipo: 'PACOTE',
        status: isValid ? 'NO_PACOTE' : 'FORA_PACOTE',
        mensagem: isValid 
          ? 'Procedimento incluído no pacote contratual' 
          : 'Procedimento não incluído no pacote contratual',
        detalhes: {
          codigoTUSS,
          estaNoPacote: item.estaNoPacote,
          requerAutorizacao: item.requerAutorizacao,
          contratoNumero: contrato.numero,
          observacoes: item.observacoes
        }
      };
    } catch (error) {
      console.error('Erro ao validar pacote:', error);
      throw error;
    }
  }

  /**
   * Valida materiais inclusos no procedimento
   */
  async validateMateriais(operadoraId, codigoTUSS, materiaisCobrados) {
    try {
      const contrato = await prisma.contrato.findFirst({
        where: {
          operadoraId,
          status: 'ATIVO',
          dataFim: { gte: new Date() }
        },
        include: {
          itens: {
            where: { codigoTUSS },
            include: {
              materiaisInclusos: true
            }
          }
        }
      });

      if (!contrato || !contrato.itens[0]) {
        return {
          isValid: false,
          tipo: 'MATERIAIS',
          status: 'ERRO',
          mensagem: 'Procedimento não encontrado no contrato',
          detalhes: null
        };
      }

      const item = contrato.itens[0];
      const materiaisInclusos = item.materiaisInclusos || [];

      // Verificar se materiais cobrados estão inclusos
      const materiaisIndevidos = [];
      const materiaisConformes = [];

      for (const materialCobrado of materiaisCobrados) {
        const incluso = materiaisInclusos.find(m => 
          m.descricaoMaterial.toLowerCase().includes(materialCobrado.descricao.toLowerCase()) ||
          materialCobrado.descricao.toLowerCase().includes(m.descricaoMaterial.toLowerCase())
        );

        if (incluso) {
          // Verificar quantidade
          if (materialCobrado.quantidade > incluso.quantidade) {
            materiaisIndevidos.push({
              descricao: materialCobrado.descricao,
              quantidadeCobrada: materialCobrado.quantidade,
              quantidadeInclusa: incluso.quantidade,
              quantidadeExcedente: materialCobrado.quantidade - incluso.quantidade,
              motivo: 'QUANTIDADE_EXCEDENTE'
            });
          } else {
            materiaisConformes.push({
              descricao: materialCobrado.descricao,
              quantidadeCobrada: materialCobrado.quantidade,
              quantidadeInclusa: incluso.quantidade
            });
          }
        } else {
          materiaisIndevidos.push({
            descricao: materialCobrado.descricao,
            quantidadeCobrada: materialCobrado.quantidade,
            quantidadeInclusa: 0,
            motivo: 'NAO_INCLUSO'
          });
        }
      }

      const isValid = materiaisIndevidos.length === 0;

      return {
        isValid,
        tipo: 'MATERIAIS',
        status: isValid ? 'CONFORME' : 'DIVERGENTE',
        mensagem: isValid 
          ? 'Todos os materiais estão conformes' 
          : `${materiaisIndevidos.length} material(is) indevido(s) encontrado(s)`,
        detalhes: {
          codigoTUSS,
          materiaisInclusos: materiaisInclusos.map(m => ({
            descricao: m.descricaoMaterial,
            quantidade: m.quantidade
          })),
          materiaisConformes,
          materiaisIndevidos,
          contratoNumero: contrato.numero
        }
      };
    } catch (error) {
      console.error('Erro ao validar materiais:', error);
      throw error;
    }
  }

  /**
   * Valida todos os aspectos de um procedimento
   */
  async validateProcedimento(operadoraId, codigoTUSS, valorCobrado, materiaisCobrados = []) {
    try {
      const [valorValidation, pacoteValidation, materiaisValidation] = await Promise.all([
        this.validateValor(operadoraId, codigoTUSS, valorCobrado),
        this.validatePacote(operadoraId, codigoTUSS),
        materiaisCobrados.length > 0 
          ? this.validateMateriais(operadoraId, codigoTUSS, materiaisCobrados)
          : Promise.resolve({ isValid: true, tipo: 'MATERIAIS', status: 'NAO_APLICAVEL', mensagem: 'Sem materiais para validar', detalhes: null })
      ]);

      const isValid = valorValidation.isValid && pacoteValidation.isValid && materiaisValidation.isValid;
      const pendencias = [];

      if (!valorValidation.isValid) pendencias.push(valorValidation);
      if (!pacoteValidation.isValid) pendencias.push(pacoteValidation);
      if (!materiaisValidation.isValid) pendencias.push(materiaisValidation);

      return {
        isValid,
        codigoTUSS,
        totalPendencias: pendencias.length,
        validacoes: {
          valor: valorValidation,
          pacote: pacoteValidation,
          materiais: materiaisValidation
        },
        pendencias
      };
    } catch (error) {
      console.error('Erro ao validar procedimento:', error);
      throw error;
    }
  }
}

module.exports = new ValidationService();
