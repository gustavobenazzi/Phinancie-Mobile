# Phinancie - App de Controle Financeiro

Um aplicativo completo de controle financeiro pessoal com backend em Node.js/Express/Prisma e frontend em React Native/Expo.

## Estrutura do Projeto

```
phinancie-mobile/
├── backend/          # API REST em Node.js
├── frontend/         # App React Native/Expo
├── README.md
└── .env.example
```

## Funcionalidades

- **Autenticação completa**: Login/registro, recuperação de senha, opção de “lembrar login” com sincronização segura no dispositivo.
- **Dashboard e resumo**: Cards de resumo com totais de receita/despesa atualizados em tempo real e ícones customizados.
- **Transações manuais**: Formulário para registrar receitas e despesas com data, hora, estabelecimento, seleção/edição de categorias e ícones personalizados.
- **Importação de extratos bancários**: Upload de arquivos OFX/QFX (e perfis CSV suportados no backend) com análise automática, pré-visualização e seleção de lançamentos antes de salvar.
- **Filtros avançados**: Lista de transações com filtros por período (dia, semana, mês), categoria, ordenação por data/valor e destaques visuais por tipo de operação.
- **Gestão de categorias**: CRUD completo, escolha de ícones (carro, mercado, farmácia, etc.), edição e exclusão diretamente pelo app.
- **Configurações e limpeza de dados**: Tela dedicada para sair da sessão, limpar todas as transações ou categorias e manter o app organizado.
- **Validações e alertas**: Feedback amigável via modais/alerts para importação, erros de rede e confirmações de ações sensíveis.

## Tecnologias

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs

### Frontend
- React Native
- Expo
- React Navigation
- Axios
- React Hook Form
- Zod

## Configuração

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Expo CLI

### Backend

1. Instalar dependências:
```bash
cd backend
npm install
```

2. Configurar banco de dados:
```bash
cp .env.example .env
# Editar .env com suas configurações
npx prisma migrate dev
```

3. Executar:
```bash
npm run dev
```

### Frontend

1. Instalar dependências:
```bash
cd frontend
npm install
```

2. Executar:
```bash
npm start
```

3. Verificar qualidade do código (ESLint):
```bash
cd frontend
npm run lint # ou npx eslint .
```

## Qualidade de Código

O projeto utiliza ESLint (configuração compatível com React Native) para garantir padrão de código. Execute `npm run lint` no diretório `frontend` antes de fazer deploy.

## API Endpoints

### Autenticação
- `POST /auth/login` - Login
- `POST /auth/forgot` - Solicitar reset de senha
- `POST /auth/reset` - Resetar senha

### Usuários
- `GET /users/profile` - Perfil do usuário
- `POST /users` - Criar usuário
- `GET /users/:id` - Buscar usuário
- `PUT /users/:id` - Atualizar usuário

### Transações
- `GET /transactions` - Listar transações
- `POST /transactions` - Criar transação
- `GET /transactions/:id` - Buscar transação
- `PUT /transactions/:id` - Atualizar transação
- `DELETE /transactions/:id` - Deletar transação

### Categorias
- `GET /categories` - Listar categorias
- `POST /categories` - Criar categoria
- `GET /categories/:id` - Buscar categoria
- `PUT /categories/:id` - Atualizar categoria
- `DELETE /categories/:id` - Deletar categoria

### Metas
- `GET /goals` - Listar metas
- `POST /goals` - Criar meta
- `PUT /goals/:id` - Atualizar meta
- `DELETE /goals/:id` - Deletar meta

## Desenvolvimento

O projeto segue boas práticas de desenvolvimento:
- Separação clara entre frontend e backend
- Autenticação JWT
- Validação de dados
- Tratamento de erros
- Estrutura modular

## Licença

Este projeto está sob a licença ISC.
