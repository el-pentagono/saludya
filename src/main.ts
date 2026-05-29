import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const config = new DocumentBuilder()
    .setTitle('SaludYa API')
    .setDescription('Plataforma de salud digital: turnos, historia clinica, teleconsulta y certificados medicos')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticacion y registro')
    .addTag('usuarios', 'Pacientes y profesionales de la salud')
    .addTag('appointments', 'Gestion de turnos y agenda medica')
    .addTag('medical-records', 'Historia clinica digital')
    .addTag('teleconsult', 'Videoconsulta y sala virtual')
    .addTag('treatments', 'Seguimiento de tratamientos y prescripciones')
    .addTag('documents', 'Certificados y constancias via TramitExpress')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.APP_PORT || 3070;
  await app.listen(port);
  console.log(`SaludYa corriendo en http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
