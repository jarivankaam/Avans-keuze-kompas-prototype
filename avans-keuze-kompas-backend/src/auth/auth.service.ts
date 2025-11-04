import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    console.log('👤 User:', user);

    if (!user) return null;

    const match = await bcrypt.compare(pass, user.password);
    console.log('🔐 Password match:', match);

    if (!match) return null;

    const { password, ...safeUser } = user.toObject();
    return safeUser;
  }

  async login(user: any) {
    const payload = {
      username: user.email,
      sub: user._id,
      is_admin: user.is_admin,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
