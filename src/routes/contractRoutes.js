const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');

/**
 * @swagger
 * /api/contracts:
 *   get:
 *     summary: Lista todos os contratos
 *     tags: [Contratos]
 *     responses:
 *       200:
 *         description: Lista de contratos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contrato'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', contractController.listContracts);

/**
 * @swagger
 * /api/contracts/{id}:
 *   get:
 *     summary: Busca um contrato por ID
 *     tags: [Contratos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do contrato
 *     responses:
 *       200:
 *         description: Contrato encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contrato'
 *       404:
 *         description: Contrato não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', contractController.getContract);

/**
 * @swagger
 * /api/contracts:
 *   post:
 *     summary: Cria um novo contrato
 *     tags: [Contratos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contrato'
 *     responses:
 *       201:
 *         description: Contrato criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contrato'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', contractController.createContract);

/**
 * @swagger
 * /api/contracts/{id}:
 *   put:
 *     summary: Atualiza um contrato existente
 *     tags: [Contratos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do contrato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contrato'
 *     responses:
 *       200:
 *         description: Contrato atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contrato'
 *       404:
 *         description: Contrato não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', contractController.updateContract);

/**
 * @swagger
 * /api/contracts/{id}:
 *   delete:
 *     summary: Deleta um contrato (soft delete)
 *     tags: [Contratos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do contrato
 *     responses:
 *       204:
 *         description: Contrato deletado com sucesso
 *       404:
 *         description: Contrato não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', contractController.deleteContract);

/**
 * @swagger
 * /api/contracts/{id}/items:
 *   get:
 *     summary: Lista todos os itens de um contrato
 *     tags: [Contratos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do contrato
 *     responses:
 *       200:
 *         description: Lista de itens do contrato
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ItemContrato'
 *       404:
 *         description: Contrato não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id/items', contractController.getContractItems);

/**
 * @swagger
 * /api/contracts/{id}/items/{codigoTUSS}:
 *   get:
 *     summary: Busca um item específico do contrato por código TUSS
 *     tags: [Contratos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do contrato
 *       - in: path
 *         name: codigoTUSS
 *         required: true
 *         schema:
 *           type: string
 *         description: Código TUSS do procedimento
 *     responses:
 *       200:
 *         description: Item do contrato encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemContrato'
 *       404:
 *         description: Item não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id/items/:codigoTUSS', contractController.getContractItem);

module.exports = router;
