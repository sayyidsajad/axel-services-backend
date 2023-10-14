import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from 'src/config/database/database.module';
import { servicerProviders } from 'src/servicer/servicer.providers';
import { usersProviders } from 'src/users/users.providers';
import { categoryProviders } from './admin-category.providers';
import { bookingProviders } from './admin.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    ...servicerProviders,
    ...usersProviders,
    ...categoryProviders,
    ...bookingProviders,
  ],
})
export class AdminModule {}
