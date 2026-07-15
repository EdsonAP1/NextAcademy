import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Limpiar datos existentes
  await prisma.subscription.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.plan.deleteMany({});

  // 2. Crear Planes de Suscripción
  const planEsencial = await prisma.plan.create({
    data: {
      name: 'Plan Esencial',
      price: 199.0, // Bs. 199 / mes
      billingCycle: 'MONTHLY',
      features: {
        students: 200,
        courses: 10,
        users: 3,
        branches: 1,
        modules: ['students', 'courses', 'schedules', 'payments'],
      },
    },
  });

  const planCrecimiento = await prisma.plan.create({
    data: {
      name: 'Plan Crecimiento',
      price: 399.0, // Bs. 399 / mes
      billingCycle: 'MONTHLY',
      features: {
        students: 1000,
        courses: 50,
        users: 10,
        branches: 3,
        modules: ['students', 'courses', 'schedules', 'payments', 'cash-register', 'expenses', 'reports'],
      },
    },
  });

  const planElite = await prisma.plan.create({
    data: {
      name: 'Academia Élite',
      price: 799.0, // Bs. 799 / mes
      billingCycle: 'MONTHLY',
      features: {
        students: -1, // Ilimitados
        courses: -1,
        users: -1,
        branches: -1,
        modules: ['students', 'courses', 'schedules', 'payments', 'cash-register', 'expenses', 'reports', 'audit', 'notifications', 'settings'],
      },
    },
  });

  console.log('Planes creados.');

  // 3. Crear Super Admin (Propietario del SaaS)
  const superAdminPassword = await bcrypt.hash('SuperAdminSecurePass123!', 10);
  await prisma.user.create({
    data: {
      email: 'superadmin@nextacademy.bo',
      password: superAdminPassword,
      name: 'Super Admin NextAcademy',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Super Admin creado.');

  // 4. Crear un Tenant Demo (Instituto de Idiomas Demo)
  const tenantDemo = await prisma.tenant.create({
    data: {
      name: 'Instituto de Idiomas Oxford',
      slug: 'oxford',
      status: 'ACTIVE',
    },
  });

  console.log('Tenant Demo creado.');

  // 5. Crear Owner (Dueño del Instituto Demo)
  const ownerPassword = await bcrypt.hash('OwnerSecurePass123!', 10);
  await prisma.user.create({
    data: {
      email: 'owner@oxford.edu.bo',
      password: ownerPassword,
      name: 'Lic. Juan Pérez',
      role: 'OWNER',
      tenantId: tenantDemo.id,
    },
  });

  console.log('Owner Demo creado.');

  // 6. Asignar Suscripción al Tenant Demo (Plan Crecimiento por 1 año)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(startDate.getFullYear() + 1);

  await prisma.subscription.create({
    data: {
      tenantId: tenantDemo.id,
      planId: planCrecimiento.id,
      status: 'ACTIVE',
      startDate,
      endDate,
    },
  });

  console.log('Suscripción asignada al Tenant Demo.');
  console.log('Seeding completado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
