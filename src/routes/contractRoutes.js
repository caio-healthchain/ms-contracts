const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');

// CRUD de contratos
router.get('/', contractController.listContracts);
router.get('/:id', contractController.getContract);
router.post('/', contractController.createContract);
router.put('/:id', contractController.updateContract);
router.delete('/:id', contractController.deleteContract);

// Itens do contrato
router.get('/:id/items', contractController.getContractItems);
router.get('/:id/items/:codigoTUSS', contractController.getContractItem);

module.exports = router;
