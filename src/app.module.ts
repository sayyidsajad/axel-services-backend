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
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import * as dotenv from 'dotenv';
import { jwtConstants } from './auth/auth.constants';
import { JwtModule } from '@nestjs/jwt';
import { excluded } from './auth/exclude.auth';
import { ChatModule } from './chat/chat.module';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { OpenAiModule } from './open-ai/open-ai.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
dotenv.config();

@Module({
  imports: [
    UsersModule,
    AdminModule,
    ServicerModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24hr' },
    }),
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
    ScheduleModule.forRoot(),
    AuthModule,
    CloudinaryModule,
    ChatModule,
    OpenAiModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthService)
      .exclude(...excluded)
      .forRoutes('*');
  }
}
