import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new AppValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  const uploadsPath = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsPath));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('WashFlow API')
    .setDescription('Laundry and Dry Cleaning SaaS platform API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const port = Number(process.env.PORT ?? 3000);

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  if (adminEmail && adminPassword) {
    const authService = app.get(AuthService);
    const result = await authService.ensureAdminAccount(adminEmail, adminPassword, process.env.ADMIN_NAME?.trim() || 'DryCo Admin');
    logger.log(
      result.created
        ? `Bootstrap admin created for ${result.email}`
        : result.updated
          ? `Bootstrap admin refreshed for ${result.email}`
          : `Bootstrap admin already ready for ${result.email}`,
    );
  }

  await app.listen(port);
  logger.log(`WashFlow backend running on http://localhost:${port}/api`);
}

bootstrap();
