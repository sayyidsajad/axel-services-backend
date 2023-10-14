/* eslint-disable @typescript-eslint/no-unused-vars */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { ServicerModule } from './servicer/servicer.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const clientHost = configService.get('CLIENT_HOST');
  app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );
  const corsOptions: CorsOptions = {
    origin: [clientHost],
    credentials: true,
  };
  const adminOptions = new DocumentBuilder()
    .setTitle('Axel Admin')
    .setDescription('The admin API description')
    .setVersion('1.0')
    .addTag('admin')
    .build();
  const adminDocument = SwaggerModule.createDocument(app, adminOptions, {
    include: [AdminModule],
  });
  SwaggerModule.setup('api/admin', app, adminDocument);

  const servicerOptions = new DocumentBuilder()
    .setTitle('Axel Servicer')
    .setDescription('The servicer API description')
    .setVersion('1.0')
    .addTag('servicer')
    .build();
  const servicersDocument = SwaggerModule.createDocument(app, servicerOptions, {
    include: [ServicerModule],
  });
  SwaggerModule.setup('api/servicer', app, servicersDocument);

  const userOptions = new DocumentBuilder()
    .setTitle('Axel User')
    .setDescription('The user API description')
    .setVersion('1.0')
    .addTag('user')
    .build();
  const usersDocument = SwaggerModule.createDocument(app, userOptions, {
    include: [UsersModule],
  });
  SwaggerModule.setup('api', app, usersDocument);

  app.enableCors(corsOptions);
  await app.listen(port);
}
bootstrap();
