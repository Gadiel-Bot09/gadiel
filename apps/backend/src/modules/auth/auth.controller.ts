import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { AuthService } from './auth.service';

class SignInDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signIn(@Body() body: SignInDto) {
    const { userId, companyId, role } = await this.authService.validateUser(body.email, body.password);
    return this.authService.issueTokens({ sub: userId, companyId, role });
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    const payload = await this.authService.decodeRefreshToken(body.refreshToken);
    return this.authService.refreshTokens(payload.sub, body.refreshToken);
  }
}
