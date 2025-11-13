import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o processo de seed...');

  await prisma.transaction.deleteMany();
  await prisma.financialGoal.deleteMany();
  await prisma.category.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
  console.log('Banco de dados limpo.');

  const hashedPassword = await bcrypt.hash('123456', 10);

  const user = await prisma.user.create({
    data: {
      email: 'teste@phinancie.com',
      name: 'Usuário de Teste',
      passwordHash: hashedPassword,
    },
  });
  console.log(`Usuário de teste criado: ${user.email}`);

  const categoryIncome = await prisma.category.create({
    data: {
      name: 'Salário',
      icon: 'salary_icon',
      type: 'INCOME', 
      userId: user.id,
    },
  });

  const categoryExpenseFood = await prisma.category.create({
    data: {
      name: 'Alimentação',
      icon: 'food_icon',
      type: 'EXPENSE',
      userId: user.id,
    },
  });

  const categoryExpenseTransport = await prisma.category.create({
    data: {
      name: 'Transporte',
      icon: 'transport_icon',
      type: 'EXPENSE',
      userId: user.id,
    },
  });
  console.log('Categorias padrão criadas.');

  await prisma.transaction.create({
    data: {
      amount: 5000.0,
      type: 'INCOME',
      description: 'Salário de Novembro',
      userId: user.id,
      categoryId: categoryIncome.id,
    },
  });

  await prisma.transaction.create({
    data: {
      amount: 120.5,
      type: 'EXPENSE',
      description: 'iFood - Pizza',
      userId: user.id,
      categoryId: categoryExpenseFood.id,
    },
  });

  await prisma.transaction.create({
    data: {
      amount: 45.0,
      type: 'EXPENSE',
      description: 'Uber para a faculdade',
      userId: user.id,
      categoryId: categoryExpenseTransport.id,
    },
  });
  console.log('Transações de exemplo criadas.');

  await prisma.financialGoal.create({
    data: {
      title: 'Viagem de Férias',
      value: 3000.0,
      endDate: new Date('2026-01-15T00:00:00Z'),
      userId: user.id,
    },
  });
  console.log('Meta financeira de exemplo criada.');

  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });