import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { usersProviders } from './users.providers';
import { DatabaseModule } from '../config/database/database.module';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { servicerProviders } from 'src/servicer/servicer.providers';
import * as dotenv from 'dotenv';
import { EnquiryProviders, bookingProviders } from 'src/admin/admin.providers';
import { TwilioModule } from 'nestjs-twilio';
import { messagingsProviders } from 'src/chat/chat.providers';
import { UserRepository } from 'src/repositories/base/user.repository';
dotenv.config();

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    TwilioModule.forRoot({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    ...usersProviders,
    ...bookingProviders,
    ...servicerProviders,
    ...messagingsProviders,
    ...EnquiryProviders,
    UserRepository,
  ],
  exports: [UsersService],
})
export class UsersModule {}
