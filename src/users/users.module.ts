import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { reviewsProviders, usersProviders } from './users.providers';
import { DatabaseModule } from '../config/database/database.module';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import {
  additionalServicesProviders,
  servicerProviders,
} from 'src/servicer/servicer.providers';
import * as dotenv from 'dotenv';
import {
  EnquiryProviders,
  bannerProviders,
  bookingProviders,
} from 'src/admin/admin.providers';
import { TwilioModule } from 'nestjs-twilio';
import { messagingsProviders } from 'src/chat/chat.providers';
import { UserRepository } from 'src/repositories/base/user.repository';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { categoryProviders } from 'src/admin/admin-category.providers';
dotenv.config();

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    CloudinaryModule,
    TwilioModule.forRoot({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    ...usersProviders,
    ...bookingProviders,
    ...servicerProviders,
    ...messagingsProviders,
    ...EnquiryProviders,
    ...reviewsProviders,
    ...categoryProviders,
    ...bannerProviders,
    ...additionalServicesProviders,
  ],
  exports: [UsersService],
})
export class UsersModule {}
