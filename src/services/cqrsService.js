const { MongoClient } = require('mongodb');

class CQRSService {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    if (this.client) return;

    try {
      this.client = new MongoClient(process.env.COSMOSDB_URI);
      await this.client.connect();
      this.db = this.client.db(process.env.COSMOSDB_DATABASE || 'lazarus');
      console.log('✅ CQRS Service connected to Cosmos DB');
    } catch (error) {
      console.error('❌ CQRS Service connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  /**
   * Sincroniza contrato para Cosmos DB (read model)
   */
  async syncContract(contract) {
    try {
      await this.connect();
      
      const collection = this.db.collection('contracts');
      
      const document = {
        _id: contract.id, // Usar ID do PostgreSQL como string
        operadoraId: contract.operadoraId,
        numero: contract.numero,
        dataInicio: contract.dataInicio,
        dataFim: contract.dataFim,
        status: contract.status,
        prazoMedioPagamento: contract.prazoMedioPagamento,
        observacoes: contract.observacoes,
        operadora: contract.operadora ? {
          id: contract.operadora.id,
          nomeFantasia: contract.operadora.nomeFantasia,
          razaoSocial: contract.operadora.razaoSocial,
          codigoANS: contract.operadora.codigoANS
        } : null,
        totalItens: contract._count?.itens || 0,
        syncedAt: new Date(),
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt
      };

      await collection.updateOne(
        { _id: contract.id },
        { $set: document },
        { upsert: true }
      );

      console.log(`✅ Contract ${contract.numero} synced to Cosmos DB`);
      return document;
    } catch (error) {
      console.error('❌ Error syncing contract:', error);
      throw error;
    }
  }

  /**
   * Sincroniza item de contrato para Cosmos DB
   */
  async syncContractItem(item) {
    try {
      await this.connect();
      
      const collection = this.db.collection('contract_items');
      
      const document = {
        _id: item.id,
        contratoId: item.contratoId,
        codigoTUSS: item.codigoTUSS,
        descricao: item.descricao,
        valorContratado: parseFloat(item.valorContratado),
        estaNoPacote: item.estaNoPacote,
        requerAutorizacao: item.requerAutorizacao,
        observacoes: item.observacoes,
        materiaisInclusos: item.materiaisInclusos?.map(m => ({
          id: m.id,
          descricaoMaterial: m.descricaoMaterial,
          quantidade: m.quantidade,
          observacoes: m.observacoes
        })) || [],
        syncedAt: new Date(),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };

      await collection.updateOne(
        { _id: item.id },
        { $set: document },
        { upsert: true }
      );

      console.log(`✅ Contract item ${item.codigoTUSS} synced to Cosmos DB`);
      return document;
    } catch (error) {
      console.error('❌ Error syncing contract item:', error);
      throw error;
    }
  }

  /**
   * Sincroniza resultado de validação para Cosmos DB
   */
  async syncValidation(validation) {
    try {
      await this.connect();
      
      const collection = this.db.collection('validations');
      
      const document = {
        ...validation,
        _id: `${validation.codigoTUSS}_${Date.now()}`,
        timestamp: new Date()
      };

      await collection.insertOne(document);

      console.log(`✅ Validation for ${validation.codigoTUSS} synced to Cosmos DB`);
      return document;
    } catch (error) {
      console.error('❌ Error syncing validation:', error);
      throw error;
    }
  }

  /**
   * Busca contratos no read model (Cosmos DB)
   */
  async findContracts(filter = {}, options = {}) {
    try {
      await this.connect();
      
      const collection = this.db.collection('contracts');
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        collection.find(filter).skip(skip).limit(limit).toArray(),
        collection.countDocuments(filter)
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error finding contracts:', error);
      throw error;
    }
  }

  /**
   * Busca itens de contrato no read model
   */
  async findContractItems(contratoId, filter = {}, options = {}) {
    try {
      await this.connect();
      
      const collection = this.db.collection('contract_items');
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      const query = { contratoId, ...filter };

      const [data, total] = await Promise.all([
        collection.find(query).skip(skip).limit(limit).toArray(),
        collection.countDocuments(query)
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error finding contract items:', error);
      throw error;
    }
  }

  /**
   * Busca histórico de validações
   */
  async findValidations(filter = {}, options = {}) {
    try {
      await this.connect();
      
      const collection = this.db.collection('validations');
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        collection.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).toArray(),
        collection.countDocuments(filter)
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error finding validations:', error);
      throw error;
    }
  }
}

module.exports = new CQRSService();
