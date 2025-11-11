const express = require('express');
const router = express.Router();
const validationController = require('../controllers/validationController');

/**
 * @swagger
 * /api/validations/valor:
 *   post:
 *     summary: Valida o valor de um procedimento contra o contrato
 *     tags: [Validações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidacaoValor'
 *           example:
 *             operadoraId: "5460ecf6-3ea2-4088-bd8a-6198cfe2d76f"
 *             codigoTUSS: "30707013"
 *             valorCobrado: 27300.00
 *     responses:
 *       200:
 *         description: Validação realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultadoValidacao'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Contrato ou procedimento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/valor', validationController.validateValor);

/**
 * @swagger
 * /api/validations/pacote:
 *   post:
 *     summary: Valida se um procedimento está incluído no pacote contratual
 *     tags: [Validações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operadoraId
 *               - codigoTUSS
 *             properties:
 *               operadoraId:
 *                 type: string
 *                 format: uuid
 *               codigoTUSS:
 *                 type: string
 *           example:
 *             operadoraId: "5460ecf6-3ea2-4088-bd8a-6198cfe2d76f"
 *             codigoTUSS: "30707013"
 *     responses:
 *       200:
 *         description: Validação realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 incluso:
 *                   type: boolean
 *                 pacote:
 *                   type: string
 *                 mensagem:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/pacote', validationController.validatePacote);

/**
 * @swagger
 * /api/validations/materiais:
 *   post:
 *     summary: Valida se os materiais cobrados estão inclusos no contrato
 *     tags: [Validações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operadoraId
 *               - codigoTUSS
 *               - materiaisCobrados
 *             properties:
 *               operadoraId:
 *                 type: string
 *                 format: uuid
 *               codigoTUSS:
 *                 type: string
 *               materiaisCobrados:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     descricao:
 *                       type: string
 *                     quantidade:
 *                       type: integer
 *           example:
 *             operadoraId: "5460ecf6-3ea2-4088-bd8a-6198cfe2d76f"
 *             codigoTUSS: "30707013"
 *             materiaisCobrados:
 *               - descricao: "Stent farmacológico"
 *                 quantidade: 1
 *     responses:
 *       200:
 *         description: Validação realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valido:
 *                   type: boolean
 *                 materiaisInclusos:
 *                   type: array
 *                   items:
 *                     type: string
 *                 materiaisNaoInclusos:
 *                   type: array
 *                   items:
 *                     type: string
 *                 mensagem:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/materiais', validationController.validateMateriais);

/**
 * @swagger
 * /api/validations/procedimento:
 *   post:
 *     summary: Validação completa de um procedimento (valor + pacote + materiais)
 *     tags: [Validações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operadoraId
 *               - codigoTUSS
 *               - valorCobrado
 *             properties:
 *               operadoraId:
 *                 type: string
 *                 format: uuid
 *               codigoTUSS:
 *                 type: string
 *               valorCobrado:
 *                 type: number
 *                 format: float
 *               materiaisCobrados:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     descricao:
 *                       type: string
 *                     quantidade:
 *                       type: integer
 *           example:
 *             operadoraId: "5460ecf6-3ea2-4088-bd8a-6198cfe2d76f"
 *             codigoTUSS: "30707013"
 *             valorCobrado: 27300.00
 *             materiaisCobrados:
 *               - descricao: "Stent farmacológico"
 *                 quantidade: 1
 *     responses:
 *       200:
 *         description: Validação completa realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 validacaoValor:
 *                   $ref: '#/components/schemas/ResultadoValidacao'
 *                 validacaoPacote:
 *                   type: object
 *                 validacaoMateriais:
 *                   type: object
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/procedimento', validationController.validateProcedimento);

/**
 * @swagger
 * /api/validations/guia:
 *   post:
 *     summary: Validação de uma guia médica completa com múltiplos procedimentos
 *     tags: [Validações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operadoraId
 *               - procedimentos
 *             properties:
 *               operadoraId:
 *                 type: string
 *                 format: uuid
 *               procedimentos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     codigoTUSS:
 *                       type: string
 *                     valorCobrado:
 *                       type: number
 *                       format: float
 *                     materiaisCobrados:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           descricao:
 *                             type: string
 *                           quantidade:
 *                             type: integer
 *           example:
 *             operadoraId: "5460ecf6-3ea2-4088-bd8a-6198cfe2d76f"
 *             procedimentos:
 *               - codigoTUSS: "30707013"
 *                 valorCobrado: 27300.00
 *                 materiaisCobrados:
 *                   - descricao: "Stent farmacológico"
 *                     quantidade: 1
 *     responses:
 *       200:
 *         description: Validação da guia realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valida:
 *                   type: boolean
 *                 procedimentos:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalCobrado:
 *                   type: number
 *                 totalContratual:
 *                   type: number
 *                 diferencaTotal:
 *                   type: number
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/guia', validationController.validateGuia);

module.exports = router;
