"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcryptjs"));
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Seeding database...');
    await prisma.subscription.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.tenant.deleteMany({});
    await prisma.plan.deleteMany({});
    const planEsencial = await prisma.plan.create({
        data: {
            name: 'Plan Esencial',
            price: 199.0,
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
            price: 399.0,
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
            price: 799.0,
            billingCycle: 'MONTHLY',
            features: {
                students: -1,
                courses: -1,
                users: -1,
                branches: -1,
                modules: ['students', 'courses', 'schedules', 'payments', 'cash-register', 'expenses', 'reports', 'audit', 'notifications', 'settings'],
            },
        },
    });
    console.log('Planes creados.');
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
    const tenantDemo = await prisma.tenant.create({
        data: {
            name: 'Instituto de Idiomas Oxford',
            slug: 'oxford',
            status: 'ACTIVE',
        },
    });
    console.log('Tenant Demo creado.');
    const ownerPassword = await bcrypt.hash('OwnerSecurePass123!', 10);
    await prisma.user.create({
        data: {
            email: 'owner@oxford.edu.bo',
            password: ownerPassword,
            plainPassword: 'OwnerSecurePass123!',
            name: 'Lic. Juan Pérez',
            role: 'OWNER',
            tenantId: tenantDemo.id,
        },
    });
    console.log('Owner Demo creado.');
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
//# sourceMappingURL=seed.js.map