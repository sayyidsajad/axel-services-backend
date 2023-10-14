/* eslint-disable @typescript-eslint/no-unused-vars */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { ServicerModule } from './servicer/servicer.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { excluded } from './auth/exclude.auth';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    UsersModule,
    AdminModule,
    ServicerModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.development'],
      ignoreEnvFile: true,
      isGlobal: true,
      cache: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        service: 'Gmail',
        secure: true,
        auth: {
          user: process.env.DEV_MAIL,
          pass: process.env.DEV_PASS,
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@localhost>',
      },
      preview: true,
    }),
    AuthModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthService)
      .exclude(...excluded)
      .forRoutes('*');
  }
}
