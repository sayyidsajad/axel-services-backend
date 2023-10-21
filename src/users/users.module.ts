/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { usersProviders } from './users.providers';
import { DatabaseModule } from '../config/database/database.module';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { servicerProviders } from 'src/servicer/servicer.providers';
import * as dotenv from 'dotenv';
import { bookingProviders } from 'src/admin/admin.providers';
dotenv.config();

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    ...usersProviders,
    ...bookingProviders,
    ...servicerProviders
  ],
  exports: [UsersService]
})
export class UsersModule { }
