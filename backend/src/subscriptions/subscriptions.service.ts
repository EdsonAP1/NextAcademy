import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.plan.findMany({
      orderBy: { price: 'asc' },
    });
  }

  async getActiveSubscription(tenantId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      throw new NotFoundException('No se encontró una suscripción activa para este instituto');
    }

    return subscription;
  }

  async changePlan(tenantId: string, newPlanId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: newPlanId },
    });

    if (!plan) {
      throw new NotFoundException('El plan de suscripción especificado no existe');
    }

    // Cancelar cualquier suscripción activa anterior y crear una nueva
    return this.prisma.$transaction(async (tx) => {
      // Desactivar suscripciones anteriores
      await tx.subscription.updateMany({
        where: {
          tenantId,
          status: 'ACTIVE',
        },
        data: {
          status: 'CANCELED',
        },
      });

      // Crear nueva suscripción por 30 días
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      return tx.subscription.create({
        data: {
          tenantId,
          planId: plan.id,
          status: 'ACTIVE',
          startDate,
          endDate,
        },
        include: {
          plan: true,
        },
      });
    });
  }
}
