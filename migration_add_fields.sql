-- Migration: Adicionar campos de anestesia e tempos ao contrato_itens
-- Data: 2025-11-24
-- Descrição: Adiciona campos tipoAnestesia, tempoSalaCirurgica e tempoPermanencia

-- Adicionar novos campos (nullable para não quebrar dados existentes)
ALTER TABLE contrato_itens 
ADD COLUMN IF NOT EXISTS "tipoAnestesia" TEXT,
ADD COLUMN IF NOT EXISTS "tempoSalaCirurgica" TEXT,
ADD COLUMN IF NOT EXISTS "tempoPermanencia" TEXT;

-- Comentários para documentação
COMMENT ON COLUMN contrato_itens."tipoAnestesia" IS 'Tipo de anestesia (ex: Geral, Local + Sedação, Raqui + Sedação, Sedação)';
COMMENT ON COLUMN contrato_itens."tempoSalaCirurgica" IS 'Tempo de utilização da sala cirúrgica (ex: Até 1 hora, Até 2 horas)';
COMMENT ON COLUMN contrato_itens."tempoPermanencia" IS 'Tempo de permanência (ex: Até 1 Day Clinic, Até 1 Diária de Apartamento)';
