# Guia de Contribuição

Obrigado por considerar contribuir para a API de Localização de Angola! Este guia irá ajudá-lo a começar.

## 🚀 Como Começar

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub, depois clone
git clone https://github.com/angola-dev/angola-localization-api.git
cd angola-localization-api

# Adicione o repositório original como upstream
git remote add upstream https://github.com/angola-dev/angola-localization-api.git
```

### 2. Configuração do Ambiente

```bash
# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Configure o banco de dados
npm run db:generate
npm run db:push
npm run db:seed

# Execute testes para verificar se tudo está funcionando
npm test
```

### 3. Criando uma Branch

```bash
# Sempre crie uma branch para suas mudanças
git checkout -b feature/nome-da-funcionalidade
# ou
git checkout -b fix/descricao-do-bug
```

## 📝 Processo de Desenvolvimento

### 1. Antes de Começar

- Verifique se existe uma issue relacionada
- Se não existir, crie uma issue primeiro para discussão
- Atribua a issue a si mesmo se for trabalhar nela

### 2. Durante o Desenvolvimento

- Faça commits pequenos e frequentes
- Use mensagens de commit descritivas
- Execute testes regularmente: `npm test`
- Execute linting: `npm run lint:fix`
- Mantenha a branch atualizada com a main

### 3. Antes de Fazer Push

```bash
# Atualize sua branch com a main
git checkout main
git pull upstream main
git checkout sua-branch
git rebase main

# Execute todos os checks
npm run lint:fix
npm test
npm run build
```

## 🧪 Testes

### Executando Testes

```bash
# Todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com cobertura
npm run test:coverage
```

### Escrevendo Testes

- Adicione testes para novas funcionalidades
- Mantenha cobertura > 80%
- Use nomes descritivos: `should return provinces when valid request`
- Teste casos de sucesso e erro

### Exemplo de Teste

```typescript
describe('ProvinceController', () => {
  describe('GET /provinces', () => {
    it('should return provinces with pagination', async () => {
      const response = await request(app)
        .get('/api/provinces')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });
});
```

## 📋 Checklist do Pull Request

Antes de submeter seu PR, verifique:

- [ ] Código compila sem erros (`npm run build`)
- [ ] Todos os testes passam (`npm test`)
- [ ] Linting está limpo (`npm run lint:fix`)
- [ ] Commits seguem conventional commits
- [ ] Branch está atualizada com main
- [ ] PR tem descrição clara
- [ ] Issues relacionadas são referenciadas
- [ ] Screenshots incluídos (se aplicável)

## 🎯 Tipos de Contribuição

### 🐛 Correção de Bugs

1. Identifique o bug
2. Crie uma issue descrevendo o problema
3. Crie uma branch `fix/descricao-do-bug`
4. Implemente a correção
5. Adicione testes para o bug
6. Submeta o PR

### ✨ Novas Funcionalidades

1. Discuta a funcionalidade em uma issue
2. Aguarde aprovação dos mantenedores
3. Crie uma branch `feature/nome-da-funcionalidade`
4. Implemente a funcionalidade
5. Adicione testes completos
6. Atualize documentação
7. Submeta o PR

### 📚 Documentação

1. Identifique áreas que precisam de documentação
2. Crie uma branch `docs/descricao`
3. Melhore a documentação
4. Verifique se está clara e precisa
5. Submeta o PR

### 🧪 Testes

1. Identifique código sem cobertura
2. Crie uma branch `test/descricao`
3. Adicione testes abrangentes
4. Mantenha cobertura > 80%
5. Submeta o PR

## 📏 Padrões de Código

### TypeScript

```typescript
// ✅ Bom
interface UserResponse {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<UserResponse> => {
  // implementação
};

// ❌ Evitar
const getUser = async (id) => {
  // implementação
};
```

### Nomenclatura

```typescript
// ✅ Bom
const provinceController = new ProvinceController();
const API_BASE_URL = 'http://localhost:3000/api';

// ❌ Evitar
const pc = new ProvinceController();
const apiUrl = 'http://localhost:3000/api';
```

### Estrutura de Arquivos

```
src/
├── controllers/
│   ├── provinceController.ts
│   └── municipalityController.ts
├── middleware/
│   ├── auth.ts
│   └── errorHandler.ts
└── types/
    └── index.ts
```

## 🔄 Processo de Review

### Para Contribuidores

1. **Aguarde feedback** - Mantenedores revisarão seu PR
2. **Responda a comentários** - Faça as mudanças solicitadas
3. **Mantenha o PR atualizado** - Rebase quando necessário
4. **Seja paciente** - Reviews podem levar tempo

### Para Mantenedores

1. **Revise código** - Verifique qualidade e padrões
2. **Teste funcionalidade** - Execute localmente se necessário
3. **Forneça feedback** - Seja construtivo e específico
4. **Aprove quando pronto** - Merge após aprovação

## 🏷️ Labels e Milestones

### Labels de Issues

- `bug` - Algo não está funcionando
- `enhancement` - Nova funcionalidade
- `documentation` - Melhorias na documentação
- `good first issue` - Ideal para iniciantes
- `help wanted` - Precisa de ajuda extra
- `question` - Pergunta ou discussão

### Labels de PRs

- `ready for review` - Pronto para review
- `work in progress` - Em desenvolvimento
- `needs testing` - Precisa de testes
- `breaking change` - Mudança que quebra compatibilidade

## 🎉 Reconhecimento

Contribuidores ativos serão reconhecidos:

- Listados no README
- Badges de contribuidor
- Menção em releases
- Acesso a repositórios privados (se aplicável)

## 📞 Suporte

Se precisar de ajuda:

- Abra uma issue com label `question`
- Participe das discussões
- Entre em contato com mantenedores

## 📜 Código de Conduta

Este projeto segue o [Código de Conduta do Contributor Covenant](CODE_OF_CONDUCT.md).

### Resumo

- Seja respeitoso e inclusivo
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros
- Aceite críticas construtivas
- Respeite diferentes pontos de vista

---

**Obrigado por contribuir! Juntos, estamos construindo algo incrível para a comunidade angolana de desenvolvedores! 🇦🇴**
