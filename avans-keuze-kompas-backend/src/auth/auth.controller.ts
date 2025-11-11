import { Controller, Get, Post, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.login(req.user);
    const nodeEnv = this.configService.get<string>('nodeEnv');
    const isProduction = nodeEnv === 'production';

    console.log('🍪 Cookie Configuration:');
    console.log('  NODE_ENV:', nodeEnv);
    console.log('  isProduction:', isProduction);
    console.log('  secure:', isProduction);
    console.log('  sameSite:', isProduction ? 'none' : 'lax');
    console.log('  domain:', '.panel.evonix-development.tech');

    res.cookie('access_token', token.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin, requires secure
      domain: '.panel.evonix-development.tech', // Share cookie across all subdomains
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log('✅ Cookie set successfully');

    return token; // ✅ frontend now gets { access_token }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req) {
    // Returns the current user info from the JWT token
    // The JWT strategy already extracts userId, email, and is_admin from the cookie
    return {
      userId: req.user.userId,
      email: req.user.email,
      is_admin: req.user.is_admin,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logout successful' };
  }
}
