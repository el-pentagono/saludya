import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: unknown, user: TUser): TUser {
    if (err instanceof UnauthorizedException) {
      // Viene de JwtStrategy.validate() (ej. usuario inactivo), ya tiene mensaje en español.
      throw err;
    }
    if (err || !user) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }
    return user;
  }
}
