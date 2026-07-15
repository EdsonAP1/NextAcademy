import { Controller, Get, Post, Body, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AuthGuard } from '../auth/auth.guard';
import type { Request } from 'express';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('active')
  @UseGuards(AuthGuard)
  async getActiveSubscription(@Req() req: Request) {
    const userPayload = (req as any).user;
    if (!userPayload.tenantId) {
      throw new ForbiddenException('El usuario administrador del SaaS no posee suscripción institucional');
    }
    return this.subscriptionsService.getActiveSubscription(userPayload.tenantId);
  }

  @Post('change')
  @UseGuards(AuthGuard)
  async changePlan(
    @Req() req: Request,
    @Body() body: { planId: string },
  ) {
    const userPayload = (req as any).user;
    
    // Solo OWNER o SUPER_ADMIN pueden cambiar planes
    if (userPayload.role !== 'OWNER' && userPayload.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Solo el propietario del instituto puede cambiar el plan de suscripción');
    }

    if (!userPayload.tenantId) {
      throw new ForbiddenException('El usuario administrador del SaaS no puede modificar planes de institutos');
    }

    return this.subscriptionsService.changePlan(userPayload.tenantId, body.planId);
  }
}
