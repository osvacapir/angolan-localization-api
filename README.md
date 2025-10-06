# 🇦🇴 API de Localização de Angola

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7+-red.svg)](https://redis.io/)

Uma API RESTful moderna e completa para dados de localização de Angola, fornecendo informações precisas sobre províncias e municípios para desenvolvedores angolanos e a comunidade internacional.

## 🌟 Características

- **📊 Dados Completos**: 17 províncias e municípios de Angola com informações geográficas e demográficas
- **🚀 API RESTful**: Endpoints modernos com paginação, filtros e busca
- **⚡ Performance**: Cache Redis para respostas rápidas
- **🔒 Segurança**: Headers de segurança, rate limiting e validação de dados
- **📱 Interface Web**: Interface moderna para consulta de dados
- **📚 Documentação**: Swagger/OpenAPI integrado
- **🐳 Docker**: Containerização completa com Docker Compose
- **🧪 Testes**: Cobertura de testes com Jest
- **📈 Monitoramento**: Logs estruturados com Winston

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (opcional)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/osvacapir/angolan-localization-api.git
cd angolan-localization-api
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados**
```bash
# Gere o cliente Prisma
npm run db:generate

# Execute as migrações
npm run db:push

# Popule o banco com dados iniciais
npm run db:seed
```

5. **Inicie a aplicação**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

### Usando Docker

```bash
# Inicie todos os serviços
docker-compose up -d

# Acesse a aplicação
open http://localhost:3000
```

## 📖 Documentação da API

### Endpoints Principais

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/provinces` | GET | Lista todas as províncias |
| `/api/municipalities` | GET | Lista todos os municípios |
| `/api/search` | GET | Busca global |
| `/api/stats` | GET | Estatísticas da API |
| `/api/docs` | GET | Documentação Swagger |

### Exemplos de Uso

```bash
# Listar províncias com paginação
curl "http://localhost:3000/api/provinces?page=1&limit=10"

# Filtrar por região
curl "http://localhost:3000/api/provinces?region=Centro"

# Buscar municípios de uma província
curl "http://localhost:3000/api/municipalities?province=LDA"

# Busca global
curl "http://localhost:3000/api/search?q=Luanda"
```

## 🤝 Como Contribuir

Agradecemos seu interesse em contribuir para este projeto! Existem várias formas de participar:

### 🐛 Reportar Bugs

1. Verifique se o bug já foi reportado nas [Issues](../../issues)
2. Crie uma nova issue com:
   - Título descritivo
   - Descrição detalhada do problema
   - Passos para reproduzir
   - Screenshots (se aplicável)
   - Informações do ambiente (OS, Node.js, etc.)

### ✨ Sugerir Melhorias

1. Verifique se a sugestão já existe nas [Issues](../../issues)
2. Crie uma issue com:
   - Título claro da funcionalidade
   - Descrição detalhada da proposta
   - Casos de uso
   - Benefícios para a comunidade

### 💻 Contribuir com Código

1. **Fork o repositório**
2. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/nova-funcionalidade
   # ou
   git checkout -b fix/correcao-bug
   ```

3. **Configure o ambiente de desenvolvimento**
   ```bash
   npm install
   cp .env.example .env
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Faça suas alterações seguindo as diretrizes:**
   - Use TypeScript
   - Siga o padrão de código existente
   - Adicione testes para novas funcionalidades
   - Execute `npm run lint:fix` antes de commitar
   - Execute `npm test` para garantir que os testes passem

5. **Commit suas alterações**
   ```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade X"
   # ou
   git commit -m "fix: corrige bug Y"
   ```

6. **Push para sua branch**
   ```bash
   git push origin feature/nova-funcionalidade
   ```

7. **Abra um Pull Request**
   - Título descritivo
   - Descrição detalhada das mudanças
   - Referencie issues relacionadas
   - Screenshots (se aplicável)

### 📝 Diretrizes de Contribuição

#### Padrões de Código
- Use TypeScript com tipos explícitos
- Siga o ESLint configurado
- Use nomes descritivos para variáveis e funções
- Adicione comentários para lógica complexa
- Mantenha funções pequenas e focadas

#### Commits
Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` manutenção

#### Testes
- Adicione testes para novas funcionalidades
- Mantenha cobertura de testes > 80%
- Use nomes descritivos para testes
- Teste casos de sucesso e erro

### 🌍 Áreas de Contribuição

#### Dados
- **Adicionar municípios**: Complete a base de dados com todos os 164 municípios
- **Atualizar informações**: População, área, coordenadas precisas
- **Novos campos**: Informações adicionais relevantes

#### Funcionalidades
- **Novos endpoints**: APIs específicas para casos de uso
- **Filtros avançados**: Mais opções de filtro e busca
- **Exportação**: Dados em CSV, JSON, XML
- **Integração**: APIs de mapas, geocoding

#### Interface
- **Melhorias UX**: Interface mais intuitiva
- **Responsividade**: Otimização para mobile
- **Acessibilidade**: Suporte para leitores de tela
- **Internacionalização**: Suporte a múltiplos idiomas

#### Infraestrutura
- **Performance**: Otimizações de cache e queries
- **Monitoramento**: Métricas e alertas
- **CI/CD**: Pipeline de deploy automatizado
- **Documentação**: Guias e tutoriais

#### Qualidade
- **Testes**: Cobertura completa
- **Segurança**: Auditorias e correções
- **Performance**: Benchmarks e otimizações
- **Acessibilidade**: Testes de usabilidade

### 🏷️ Labels das Issues

- `bug` - Algo não está funcionando
- `enhancement` - Nova funcionalidade ou melhoria
- `documentation` - Melhorias na documentação
- `good first issue` - Ideal para iniciantes
- `help wanted` - Precisa de ajuda extra
- `question` - Pergunta ou discussão
- `wontfix` - Não será corrigido

### 🎯 Issues para Iniciantes

Procuramos issues marcadas com `good first issue` para novos colaboradores:

1. Correções simples de bugs
2. Melhorias na documentação
3. Adição de testes
4. Pequenas funcionalidades
5. Correções de typos

## 📊 Estrutura do Projeto

```
angolan-localization-api/
├── src/
│   ├── controllers/     # Controladores da API
│   ├── middleware/      # Middlewares personalizados
│   ├── routes/          # Definição das rotas
│   ├── types/           # Definições TypeScript
│   ├── utils/           # Utilitários
│   ├── config/          # Configurações
│   └── database/        # Scripts de banco
├── public/              # Interface web
├── prisma/              # Schema do banco
├── docker/              # Configurações Docker
├── tests/               # Testes automatizados
└── docs/                # Documentação adicional
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Compila TypeScript
npm run start            # Inicia servidor de produção

# Banco de dados
npm run db:generate      # Gera cliente Prisma
npm run db:push          # Aplica mudanças no banco
npm run db:migrate       # Executa migrações
npm run db:seed          # Popula banco com dados
npm run db:studio        # Abre Prisma Studio

# Qualidade
npm run lint             # Executa ESLint
npm run lint:fix         # Corrige problemas do ESLint
npm run format           # Formata código com Prettier
npm test                 # Executa testes
npm run test:watch       # Executa testes em modo watch
npm run test:coverage    # Executa testes com cobertura

# Docker
docker-compose up -d     # Inicia serviços
docker-compose down      # Para serviços
docker-compose logs      # Visualiza logs
```

## 🌐 Tecnologias

- **Backend**: Node.js, Express.js, TypeScript
- **Banco de Dados**: PostgreSQL, Prisma ORM
- **Cache**: Redis
- **Containerização**: Docker, Docker Compose
- **Testes**: Jest, Supertest
- **Documentação**: Swagger/OpenAPI
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Qualidade**: ESLint, Prettier

## 📈 Roadmap

### Versão 2.0
- [ ] API GraphQL
- [ ] Autenticação JWT
- [ ] Rate limiting por usuário
- [ ] Webhooks
- [ ] SDK para JavaScript/TypeScript

### Versão 3.0
- [ ] Suporte a múltiplos países
- [ ] API de geocoding
- [ ] Integração com mapas
- [ ] Machine Learning para sugestões

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- Comunidade de desenvolvedores angolanos
- Contribuidores do projeto
- Mantenedores das bibliotecas utilizadas
- Governo de Angola pelos dados oficiais

## 📞 Contato

- **Issues**: [GitHub Issues](../../issues)
- **Discussões**: [GitHub Discussions](../../discussions)
- **Email**: contato@angolan-localization-api.com

## 🌟 Contribuidores

Obrigado a todos os contribuidores que tornam este projeto possível!

<!-- Adicione aqui a lista de contribuidores quando houver -->

---

**Feito com ❤️ por Osvaldo Capir**