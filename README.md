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

- **Autenticação**: Login, registro e recuperação de senha
- **Transações**: Registro de receitas e despesas
- **Categorias**: Organização das transações por categoria
- **Metas Financeiras**: Definição e acompanhamento de objetivos financeiros
- **Dashboard**: Visão geral das finanças

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

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença ISC.
