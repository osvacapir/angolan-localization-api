-- Inicialização do banco de dados Angola Localization
-- Configurações específicas para dados de Angola

-- Configurar timezone para Angola
SET timezone = 'Africa/Luanda';

-- Configurar locale para português
SET lc_collate = 'pt_BR.UTF-8';
SET lc_ctype = 'pt_BR.UTF-8';

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurar encoding
SET client_encoding = 'UTF8';

-- Mensagem de inicialização
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados Angola Localization inicializado com sucesso!';
    RAISE NOTICE 'Timezone configurado para: %', current_setting('timezone');
    RAISE NOTICE 'Encoding configurado para: %', current_setting('client_encoding');
END $$;
