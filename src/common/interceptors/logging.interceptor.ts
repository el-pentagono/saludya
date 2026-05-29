import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, ip } = req;
    const inicio = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - inicio;
        this.logger.log(`${method} ${url} [${ip}] — ${ms}ms`);
      }),
    );
  }
}
