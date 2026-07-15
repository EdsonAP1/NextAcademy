import { Controller, Post, Body, Get, Res, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
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
      sameSite: 'lax',       // lax es adecuado para desarrollo local y peticiones cruzadas
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
    @Body() registerDto: { tenantName: string; name: string; email: string; pass: string; planId?: string },
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
}
