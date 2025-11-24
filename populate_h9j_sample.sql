-- Script para popular dados de exemplo do contrato H9J-PARTICULAR-2025
-- Baseado no PDF: RedeAmericas-Book-Particular-H9J.pdf
-- Contrato ID: 8b03e215-e580-4b0d-867c-c84c8425ea8f

-- IMPORTANTE: Este script atualiza apenas alguns exemplos
-- Para popular todos os dados, seria necessário processar o PDF completo

-- Exemplo 1: Implante cirúrgico de cateter de longa permanência (Port-A-Cath)
-- Código TUSS: 30707030 (exemplo - verificar código correto)
UPDATE contrato_itens 
SET 
  descricao = 'Implante cirúrgico de cateter de longa permanência',
  "tipoAnestesia" = 'Local + Sedação',
  "tempoSalaCirurgica" = 'Até 1 hora',
  "tempoPermanencia" = 'Até 1 Day Clinic'
WHERE "contratoId" = '8b03e215-e580-4b0d-867c-c84c8425ea8f'
  AND "codigoTUSS" = '30707030';

-- Exemplo 2: Implante de marca-passo (exclui marca-passo)
-- Código TUSS: 30707021 (exemplo - verificar código correto)
UPDATE contrato_itens 
SET 
  descricao = 'Implante de marca-passo (exclui marca-passo)',
  "tipoAnestesia" = 'Local + Sedação',
  "tempoSalaCirurgica" = 'Até 2 horas',
  "tempoPermanencia" = 'Até 1 Diária de Apartamento'
WHERE "contratoId" = '8b03e215-e580-4b0d-867c-c84c8425ea8f'
  AND "codigoTUSS" = '30707021';

-- Exemplo 3: Varizes - tratamento cirúrgico de dois membros - day
-- Código TUSS: 31003214 (exemplo - verificar código correto)
UPDATE contrato_itens 
SET 
  descricao = 'Varizes - tratamento cirúrgico de dois membros - day',
  "tipoAnestesia" = 'Raqui + Sedação',
  "tempoSalaCirurgica" = 'Até 2 horas',
  "tempoPermanencia" = 'Até 1 Day Clinic'
WHERE "contratoId" = '8b03e215-e580-4b0d-867c-c84c8425ea8f'
  AND "codigoTUSS" = '31003214';

-- Exemplo 4: Angioplastia 1 stent
-- Código TUSS: 30707013 (exemplo - verificar código correto)
UPDATE contrato_itens 
SET 
  descricao = 'Angioplastia 1 stent',
  "tipoAnestesia" = 'Local + Sedação',
  "tempoSalaCirurgica" = 'Até 2 horas',
  "tempoPermanencia" = 'Até 2 Diárias (1 Internação + 1 UTI)'
WHERE "contratoId" = '8b03e215-e580-4b0d-867c-c84c8425ea8f'
  AND "codigoTUSS" = '30707013';

-- Exemplo 5: Cateterismo cardíaco - CATE
-- Código TUSS: 31003206 (exemplo - verificar código correto)
UPDATE contrato_itens 
SET 
  descricao = 'Cateterismo cardíaco - CATE',
  "tipoAnestesia" = 'Local + Sedação',
  "tempoSalaCirurgica" = 'Até 1 hora',
  "tempoPermanencia" = 'Até 1 Day Clinic'
WHERE "contratoId" = '8b03e215-e580-4b0d-867c-c84c8425ea8f'
  AND "codigoTUSS" = '31003206';

-- Verificar resultados
SELECT 
  "codigoTUSS",
  descricao,
  "tipoAnestesia",
  "tempoSalaCirurgica",
  "tempoPermanencia",
  "valorContratado"
FROM contrato_itens
WHERE "contratoId" = '8b03e215-e580-4b0d-867c-c84c8425ea8f'
  AND "tipoAnestesia" IS NOT NULL
ORDER BY "codigoTUSS";

-- NOTA: Os materiais inclusos já estão cadastrados na tabela contrato_materiais_inclusos
-- e são retornados automaticamente pelo backend através do relacionamento
