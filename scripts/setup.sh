#!/bin/bash

# Script de configuração inicial para a API de Localização de Angola
echo "🇦🇴 Configurando API de Localização de Angola..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker primeiro."
    exit 1
fi

echo "✅ Docker $(docker --version) encontrado"

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker Compose $(docker-compose --version) encontrado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Copiar arquivo de ambiente
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp env.example .env
    echo "⚠️  Por favor, edite o arquivo .env com suas configurações"
fi

# Iniciar serviços com Docker
echo "🐳 Iniciando serviços com Docker..."
docker-compose up -d postgres redis

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Executar migrações
echo "🗄️ Executando migrações do banco de dados..."
npm run db:push

# Executar seed
echo "🌱 Populando banco de dados com dados de Angola..."
npm run db:seed

echo "🎉 Configuração concluída!"
echo ""
echo "📚 Próximos passos:"
echo "1. Edite o arquivo .env com suas configurações"
echo "2. Execute 'npm run dev' para iniciar o servidor de desenvolvimento"
echo "3. Acesse http://localhost:3000/api/docs para ver a documentação"
echo ""
echo "🔗 URLs importantes:"
echo "- API: http://localhost:3000/api"
echo "- Documentação: http://localhost:3000/api/docs"
echo "- Health Check: http://localhost:3000/health"
echo "- Adminer (DB): http://localhost:8080"
echo "- Redis Commander: http://localhost:8081"
echo ""
echo "👤 Usuários criados:"
echo "- Admin: admin@angola-localization.com / admin123"
echo "- Owner: owner@angola-localization.com / admin123"
