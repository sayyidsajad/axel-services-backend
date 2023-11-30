import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from 'src/config/database/database.module';
import { servicerProviders } from 'src/servicer/servicer.providers';
import { usersProviders } from 'src/users/users.providers';
import { categoryProviders } from './admin-category.providers';
import {
  EnquiryProviders,
  bannerProviders,
  bookingProviders,
} from './admin.providers';
import { AdminRepository } from 'src/repositories/base/admin.repository';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [DatabaseModule, CloudinaryModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminRepository,
    ...servicerProviders,
    ...usersProviders,
    ...categoryProviders,
    ...bookingProviders,
    ...EnquiryProviders,
    ...bannerProviders,
  ],
})
export class AdminModule {}
