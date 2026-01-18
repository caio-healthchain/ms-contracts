const contractService = require('../services/contractService');

class ContractController {
  /**
   * GET /api/contracts
   * Lista todos os contratos
   */
  async listContracts(req, res, next) {
    try {
      const { operadoraId, status, page = 1, limit = 10 } = req.query;
      
      const result = await contractService.listContracts({
        operadoraId,
        status,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/contracts/:id
   * Busca contrato por ID
   */
  async getContract(req, res, next) {
    try {
      const { id } = req.params;
      
      const contract = await contractService.getContractById(id);
      
      if (!contract) {
        return res.status(404).json({ error: 'Contrato não encontrado' });
      }
      
      res.json(contract);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/contracts/:id/items
   * Lista itens de um contrato
   */
  async getContractItems(req, res, next) {
    try {
      const { id } = req.params;
      const { codigoTUSS, page = 1, limit = 50 } = req.query;
      
      const result = await contractService.getContractItems(id, {
        codigoTUSS,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/contracts/:id/items/:codigoTUSS
   * Busca item específico do contrato
   */
  async getContractItem(req, res, next) {
    try {
      const { id, codigoTUSS } = req.params;
      
      const item = await contractService.getContractItem(id, codigoTUSS);
      
      if (!item) {
        return res.status(404).json({ error: 'Item não encontrado no contrato' });
      }
      
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/contracts
   * Cria novo contrato
   */
  async createContract(req, res, next) {
    try {
      const contractData = req.body;
      
      const contract = await contractService.createContract(contractData);
      
      res.status(201).json(contract);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/contracts/:id
   * Atualiza contrato
   */
  async updateContract(req, res, next) {
    try {
      const { id } = req.params;
      const contractData = req.body;
      
      const contract = await contractService.updateContract(id, contractData);
      
      res.json(contract);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/contracts/:id
   * Deleta contrato (soft delete)
   */
  async deleteContract(req, res, next) {
    try {
      const { id } = req.params;
      
      await contractService.deleteContract(id);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/mcp/contracts/by-operadora/:operadoraNome
   * Busca contrato ativo de uma operadora (MCP)
   */
  async getContractByOperadora(req, res, next) {
    try {
      const { operadoraNome } = req.params;
      
      const contract = await contractService.getContractByOperadora(operadoraNome);
      
      if (!contract) {
        return res.status(404).json({ error: 'Contrato não encontrado para esta operadora' });
      }
      
      res.json(contract);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/mcp/contracts/:id/items/:codigoTUSS/price
   * Busca preço de um procedimento no contrato (MCP)
   */
  async getProcedurePrice(req, res, next) {
    try {
      const { id, codigoTUSS } = req.params;
      
      const item = await contractService.getContractItem(id, codigoTUSS);
      
      if (!item) {
        return res.status(404).json({ error: 'Procedimento não encontrado no contrato' });
      }
      
      res.json({ valor: item.valorContratual });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/mcp/contracts/:id/summary
   * Retorna resumo do contrato (MCP)
   */
  async getContractSummary(req, res, next) {
    try {
      const { id } = req.params;
      
      const summary = await contractService.getContractSummary(id);
      
      if (!summary) {
        return res.status(404).json({ error: 'Contrato não encontrado' });
      }
      
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/mcp/contracts/operadora/:operadoraNome
   * Lista todos os contratos de uma operadora (MCP)
   */
  async listContractsByOperadora(req, res, next) {
    try {
      const { operadoraNome } = req.params;
      
      const contracts = await contractService.listContractsByOperadora(operadoraNome);
      
      res.json(contracts);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContractController();
