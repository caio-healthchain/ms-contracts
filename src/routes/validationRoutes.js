const express = require('express');
const router = express.Router();
const validationController = require('../controllers/validationController');

// Validações individuais
router.post('/valor', validationController.validateValor);
router.post('/pacote', validationController.validatePacote);
router.post('/materiais', validationController.validateMateriais);

// Validação completa de procedimento
router.post('/procedimento', validationController.validateProcedimento);

// Validação de guia completa
router.post('/guia', validationController.validateGuia);

module.exports = router;
