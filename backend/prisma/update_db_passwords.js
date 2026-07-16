"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Actualizando contraseñas en texto claro...');
    await prisma.user.updateMany({
        where: { email: 'owner@oxford.edu.bo' },
        data: { plainPassword: 'OwnerSecurePass123!' }
    });
    await prisma.user.updateMany({
        where: { email: 'edson@gmail.com' },
        data: { plainPassword: '1234' }
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
//# sourceMappingURL=update_db_passwords.js.map