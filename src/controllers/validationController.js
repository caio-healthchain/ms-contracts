const validationService = require('../services/validationService');

class ValidationController {
  /**
   * POST /api/validations/valor
   * Valida valor de procedimento
   */
  async validateValor(req, res, next) {
    try {
      const { operadoraId, codigoTUSS, valorCobrado } = req.body;

      if (!operadoraId || !codigoTUSS || valorCobrado === undefined) {
        return res.status(400).json({
          error: 'Parâmetros obrigatórios: operadoraId, codigoTUSS, valorCobrado'
        });
      }

      const result = await validationService.validateValor(operadoraId, codigoTUSS, valorCobrado);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/validations/pacote
   * Valida se procedimento está no pacote
   */
  async validatePacote(req, res, next) {
    try {
      const { operadoraId, codigoTUSS } = req.body;

      if (!operadoraId || !codigoTUSS) {
        return res.status(400).json({
          error: 'Parâmetros obrigatórios: operadoraId, codigoTUSS'
        });
      }

      const result = await validationService.validatePacote(operadoraId, codigoTUSS);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/validations/materiais
   * Valida materiais inclusos
   */
  async validateMateriais(req, res, next) {
    try {
      const { operadoraId, codigoTUSS, materiaisCobrados } = req.body;

      if (!operadoraId || !codigoTUSS || !Array.isArray(materiaisCobrados)) {
        return res.status(400).json({
          error: 'Parâmetros obrigatórios: operadoraId, codigoTUSS, materiaisCobrados (array)'
        });
      }

      const result = await validationService.validateMateriais(operadoraId, codigoTUSS, materiaisCobrados);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/validations/procedimento
   * Valida todos os aspectos de um procedimento
   */
  async validateProcedimento(req, res, next) {
    try {
      const { operadoraId, codigoTUSS, valorCobrado, materiaisCobrados = [] } = req.body;

      if (!operadoraId || !codigoTUSS || valorCobrado === undefined) {
        return res.status(400).json({
          error: 'Parâmetros obrigatórios: operadoraId, codigoTUSS, valorCobrado'
        });
      }

      const result = await validationService.validateProcedimento(
        operadoraId, 
        codigoTUSS, 
        valorCobrado, 
        materiaisCobrados
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/validations/guia
   * Valida todos os procedimentos de uma guia
   */
  async validateGuia(req, res, next) {
    try {
      const { operadoraId, procedimentos } = req.body;

      if (!operadoraId || !Array.isArray(procedimentos) || procedimentos.length === 0) {
        return res.status(400).json({
          error: 'Parâmetros obrigatórios: operadoraId, procedimentos (array não vazio)'
        });
      }

      const validacoes = await Promise.all(
        procedimentos.map(proc => 
          validationService.validateProcedimento(
            operadoraId,
            proc.codigoTUSS,
            proc.valorCobrado,
            proc.materiaisCobrados || []
          )
        )
      );

      const totalProcedimentos = validacoes.length;
      const procedimentosConformes = validacoes.filter(v => v.isValid).length;
      const procedimentosPendentes = totalProcedimentos - procedimentosConformes;
      const pendencias = validacoes.filter(v => !v.isValid);

      res.json({
        totalProcedimentos,
        procedimentosConformes,
        procedimentosPendentes,
        percentualConformidade: ((procedimentosConformes / totalProcedimentos) * 100).toFixed(2),
        validacoes,
        pendencias
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ValidationController();
