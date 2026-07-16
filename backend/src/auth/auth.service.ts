import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
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
        tenant: user.tenant
          ? {
              id: user.tenant.id,
              name: user.tenant.name,
              slug: user.tenant.slug,
              subscription: user.tenant.subscriptions[0] || null,
            }
          : null,
      },
    };
  }

  async register(
    tenantName: string,
    name: string,
    email: string,
    pass: string,
    planId?: string,
  ) {
    // 1. Validar correo único
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
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

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });
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
          plainPassword: pass,
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
      tenant: user.tenant
        ? {
            id: user.tenant.id,
            name: user.tenant.name,
            slug: user.tenant.slug,
            subscription: user.tenant.subscriptions[0] || null,
          }
        : null,
    };
  }

  async updateTenantUser(
    tenantSlug: string,
    email: string,
    pass: string,
    name?: string,
    status?: string,
    planId?: string,
    endDate?: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: { users: { where: { role: 'OWNER' } } },
    });

    if (!tenant) {
      throw new BadRequestException('Instituto no encontrado');
    }

    const owner = tenant.users[0];
    if (!owner) {
      throw new BadRequestException('Propietario del instituto no encontrado');
    }

    // 1. Update User Owner
    const updateData: any = {};
    if (email) {
      const existingUser = await this.prisma.user.findFirst({
        where: { email, NOT: { id: owner.id } },
      });
      if (existingUser) {
        throw new BadRequestException(
          'El correo ya está en uso por otro usuario',
        );
      }
      updateData.email = email;
    }
    if (pass) {
      updateData.password = await bcrypt.hash(pass, 10);
      updateData.plainPassword = pass;
    }
    if (name) {
      updateData.name = name;
    }

    await this.prisma.user.update({
      where: { id: owner.id },
      data: updateData,
    });

    // 2. Update Tenant Status
    if (status) {
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: { status },
      });
    }

    // 3. Update Subscription
    if (planId || endDate || status) {
      const sub = await this.prisma.subscription.findFirst({
        where: { tenantId: tenant.id },
        orderBy: { endDate: 'desc' },
      });
      if (sub) {
        const subUpdate: any = {};
        if (endDate) subUpdate.endDate = new Date(endDate);
        if (planId) subUpdate.planId = planId;
        if (status) {
          subUpdate.status = status === 'ACTIVE' ? 'ACTIVE' : 'PAST_DUE';
        }
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: subUpdate,
        });
      }
    }

    return {
      message:
        'Instituto y credenciales del propietario actualizados correctamente',
    };
  }

  async getTenants() {
    return this.prisma.tenant.findMany({
      include: {
        users: { where: { role: 'OWNER' } },
        subscriptions: {
          include: { plan: true },
          orderBy: { endDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTenant(data: {
    name: string;
    ownerName: string;
    ownerEmail: string;
    pass: string;
    planId: string;
    endDate: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.ownerEmail },
    });
    if (existingUser) {
      throw new BadRequestException(
        'El correo del propietario ya está registrado',
      );
    }

    const slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    if (existingTenant) {
      throw new BadRequestException('El nombre del instituto ya está en uso');
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: data.planId },
    });
    if (!plan) {
      throw new BadRequestException('Plan de suscripción no encontrado');
    }

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: data.name, slug },
      });

      const hashedPassword = await bcrypt.hash(data.pass, 10);
      await tx.user.create({
        data: {
          email: data.ownerEmail,
          password: hashedPassword,
          plainPassword: data.pass,
          name: data.ownerName,
          role: 'OWNER',
          tenantId: tenant.id,
        },
      });

      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: plan.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(data.endDate),
        },
      });

      return { message: 'Instituto registrado exitosamente' };
    });
  }

  async extendTenantSubscription(tenantId: string, days: number) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { subscriptions: { orderBy: { endDate: 'desc' } } },
    });

    if (!tenant) {
      throw new BadRequestException('Instituto no encontrado');
    }

    const sub = tenant.subscriptions[0];
    if (!sub) {
      throw new BadRequestException(
        'El instituto no tiene una suscripción asignada',
      );
    }

    const currentEnd = new Date(sub.endDate);
    const baseDate = currentEnd >= new Date() ? currentEnd : new Date();
    const newEnd = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        endDate: newEnd,
        status: 'ACTIVE',
      },
    });

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'ACTIVE' },
    });

    return { message: 'Suscripción extendida exitosamente' };
  }

  async deleteTenant(tenantId: string) {
    await this.prisma.tenant.delete({
      where: { id: tenantId },
    });
    return { message: 'Instituto eliminado correctamente' };
  }
}
