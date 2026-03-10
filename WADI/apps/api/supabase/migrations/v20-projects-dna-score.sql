-- Adición de dna y score a la tabla projects directamente
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS dna text,
    ADD COLUMN IF NOT EXISTS score numeric,
    ADD COLUMN IF NOT EXISTS business_model text;