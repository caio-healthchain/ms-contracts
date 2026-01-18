const express = require("express");
const router = express.Router();
const contractController = require("../controllers/contractController");

/**
 * @swagger
 * tags:
 *   name: MCP
 *   description: Endpoints do Model Context Protocol (MCP)
 */

/**
 * @swagger
 * /api/mcp/contracts/by-operadora/{operadoraNome}:
 *   get:
 *     summary: Busca o contrato ativo de uma operadora
 *     tags: [MCP]
 *     parameters:
 *       - in: path
 *         name: operadoraNome
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da operadora
 *     responses:
 *       200:
 *         description: Contrato encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contrato'
 *       404:
 *         description: Contrato não encontrado
 */
router.get("/contracts/by-operadora/:operadoraNome", contractController.getContractByOperadora);

/**
 * @swagger
 * /api/mcp/contracts/{id}/items:
 *   get:
 *     summary: Lista os itens de um contrato
 *     tags: [MCP]
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
 */
router.get("/contracts/:id/items", contractController.getContractItems);

/**
 * @swagger
 * /api/mcp/contracts/{id}/items/{codigoTUSS}/price:
 *   get:
 *     summary: Busca o valor contratado de um procedimento
 *     tags: [MCP]
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
 *         description: Valor do procedimento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valor: { type: 'number', format: 'float' }
 *       404:
 *         description: Item não encontrado
 */
router.get("/contracts/:id/items/:codigoTUSS/price", contractController.getProcedurePrice);

/**
 * @swagger
 * /api/mcp/contracts/{id}/summary:
 *   get:
 *     summary: Retorna o resumo de um contrato
 *     tags: [MCP]
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
 *         description: Resumo do contrato
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItens: { type: 'integer' }
 *                 valorTotal: { type: 'number', format: 'float' }
 *       404:
 *         description: Contrato não encontrado
 */
router.get("/contracts/:id/summary", contractController.getContractSummary);

/**
 * @swagger
 * /api/mcp/contracts/operadora/{operadoraNome}:
 *   get:
 *     summary: Lista todos os contratos de uma operadora
 *     tags: [MCP]
 *     parameters:
 *       - in: path
 *         name: operadoraNome
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da operadora
 *     responses:
 *       200:
 *         description: Lista de contratos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contrato'
 */
router.get("/contracts/operadora/:operadoraNome", contractController.listContractsByOperadora);

module.exports = router;
