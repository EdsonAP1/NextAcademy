import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Actualizando contraseñas en texto claro...');
  
  // 1. Oxford Owner
  await prisma.user.updateMany({
    where: { email: 'owner@oxford.edu.bo' },
    data: { plainPassword: 'OwnerSecurePass123!' }
  });

  // 2. Edson Owner (zeus)
  await prisma.user.updateMany({
    where: { email: 'edson@gmail.com' },
    data: { plainPassword: '1234' } // default password
  });

  console.log('Contraseñas actualizadas.');
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
