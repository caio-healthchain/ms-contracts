-- Adicionar colunas tipoItem, valorMaximo e quantidadeMaxima à tabela contrato_itens
ALTER TABLE contrato_itens 
ADD COLUMN IF NOT EXISTS "tipoItem" TEXT,
ADD COLUMN IF NOT EXISTS "valorMaximo" NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS "quantidadeMaxima" INTEGER;

-- Criar índice para tipoItem para melhorar performance de queries
CREATE INDEX IF NOT EXISTS "contrato_itens_tipoItem_idx" ON contrato_itens("tipoItem");
