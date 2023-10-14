/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { bookingProviders, usersProviders } from './users.providers';
import { DatabaseModule } from '../config/database/database.module';
import { UsersService } from './users.service';
import { jwtConstants } from '../auth/auth.constants';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { servicerProviders } from 'src/servicer/servicer.providers';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [DatabaseModule, ConfigModule, JwtModule.register({
    global: true,
    secret: jwtConstants.secret,
    signOptions: { expiresIn: '24hr' },
  }),],
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
