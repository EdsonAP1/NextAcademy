import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        tenant: {
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' },
              include: { plan: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.tenant && user.tenant.status !== 'ACTIVE') {
      throw new UnauthorizedException('El instituto está suspendido');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenant: user.tenant ? {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
          subscription: user.tenant.subscriptions[0] || null,
        } : null,
      },
    };
  }

  async register(tenantName: string, name: string, email: string, pass: string, planId?: string) {
    // 1. Validar correo único
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // 2. Generar slug
    const slug = tenantName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existingTenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      throw new BadRequestException('El nombre del instituto ya está en uso');
    }

    // 3. Obtener plan
    let plan = null;
    if (planId) {
      plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    } else {
      plan = await this.prisma.plan.findFirst({ orderBy: { price: 'asc' } }); // Más económico
    }

    if (!plan) {
      throw new BadRequestException('Plan de suscripción no encontrado');
    }

    // 4. Crear todo en una transacción de Prisma
    return this.prisma.$transaction(async (tx) => {
      // Crear Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug,
        },
      });

      // Crear Owner
      const hashedPassword = await bcrypt.hash(pass, 10);
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'OWNER',
          tenantId: tenant.id,
        },
      });

      // Asignar Suscripción inicial por 30 días
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      const subscription = await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: plan.id,
          status: 'ACTIVE',
          startDate,
          endDate,
        },
      });

      // Generar Token JWT
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
      };

      const token = await this.jwtService.signAsync(payload);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: tenant.id,
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            subscription: {
              ...subscription,
              plan,
            },
          },
        },
      };
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' },
              include: { plan: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      tenant: user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
        subscription: user.tenant.subscriptions[0] || null,
      } : null,
    };
  }
}
