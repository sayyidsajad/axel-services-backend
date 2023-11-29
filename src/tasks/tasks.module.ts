import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { reviewsProviders, usersProviders } from 'src/users/users.providers';
import { DatabaseModule } from 'src/config/database/database.module';
import { UserRepository } from 'src/repositories/base/user.repository';
import {
  additionalServicesProviders,
  servicerProviders,
} from 'src/servicer/servicer.providers';
import {
  EnquiryProviders,
  bannerProviders,
  bookingProviders,
} from 'src/admin/admin.providers';
import { messagingsProviders } from 'src/chat/chat.providers';
import { categoryProviders } from 'src/admin/admin-category.providers';

@Module({
  imports: [DatabaseModule],
  providers: [
    ...usersProviders,
    ...servicerProviders,
    ...bookingProviders,
    ...messagingsProviders,
    ...EnquiryProviders,
    ...reviewsProviders,
    ...bannerProviders,
    ...categoryProviders,
    ...additionalServicesProviders,
    TasksService,
    UserRepository,
  ],
})
export class TasksModule {}
