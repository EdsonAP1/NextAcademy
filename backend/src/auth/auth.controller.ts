import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setAuthCookie(res: Response, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction, // solo https en producción
      sameSite: 'lax', // lax es adecuado para desarrollo local y peticiones cruzadas
      maxAge: 24 * 60 * 60 * 1000, // 1 día en milisegundos
      path: '/',
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: { email: string; pass: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto.email, loginDto.pass);
    this.setAuthCookie(res, result.token);
    return { user: result.user };
  }

  @Post('register')
  async register(
    @Body()
    registerDto: {
      tenantName: string;
      name: string;
      email: string;
      pass: string;
      planId?: string;
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(
      registerDto.tenantName,
      registerDto.name,
      registerDto.email,
      registerDto.pass,
      registerDto.planId,
    );
    this.setAuthCookie(res, result.token);
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
    });
    return { message: 'Sesión cerrada con éxito' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    const userPayload = (req as any).user;
    return this.authService.getProfile(userPayload.sub);
  }

  @Post('update-tenant-user')
  @UseGuards(AuthGuard)
  async updateTenantUser(
    @Req() req: Request,
    @Body()
    body: {
      tenantSlug: string;
      email: string;
      pass: string;
      name?: string;
      status?: string;
      planId?: string;
      endDate?: string;
    },
  ) {
    const userPayload = (req as any).user;
    if (userPayload.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Solo el super administrador puede realizar esta acción',
      );
    }
    return this.authService.updateTenantUser(
      body.tenantSlug,
      body.email,
      body.pass,
      body.name,
      body.status,
      body.planId,
      body.endDate,
    );
  }

  @Get('admin/tenants')
  @UseGuards(AuthGuard)
  async getTenants(@Req() req: Request) {
    const userPayload = (req as any).user;
    if (userPayload.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Solo el super administrador puede realizar esta acción',
      );
    }
    return this.authService.getTenants();
  }

  @Post('admin/tenants')
  @UseGuards(AuthGuard)
  async createTenant(
    @Req() req: Request,
    @Body()
    body: {
      name: string;
      ownerName: string;
      ownerEmail: string;
      pass: string;
      planId: string;
      endDate: string;
    },
  ) {
    const userPayload = (req as any).user;
    if (userPayload.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Solo el super administrador puede realizar esta acción',
      );
    }
    return this.authService.createTenant(body);
  }

  @Post('admin/tenants/extend')
  @UseGuards(AuthGuard)
  async extendTenant(
    @Req() req: Request,
    @Body() body: { tenantId: string; days: number },
  ) {
    const userPayload = (req as any).user;
    if (userPayload.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Solo el super administrador puede realizar esta acción',
      );
    }
    return this.authService.extendTenantSubscription(body.tenantId, body.days);
  }

  @Post('admin/tenants/delete')
  @UseGuards(AuthGuard)
  async deleteTenant(@Req() req: Request, @Body() body: { tenantId: string }) {
    const userPayload = (req as any).user;
    if (userPayload.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Solo el super administrador puede realizar esta acción',
      );
    }
    return this.authService.deleteTenant(body.tenantId);
  }
}
