import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { reviewsProviders, usersProviders } from 'src/users/users.providers';
import { DatabaseModule } from 'src/config/database/database.module';
import { UserRepository } from 'src/repositories/base/user.repository';
import { servicerProviders } from 'src/servicer/servicer.providers';
import {
  EnquiryProviders,
  bannerProviders,
  bookingProviders,
} from 'src/admin/admin.providers';
import { messagingsProviders } from 'src/chat/chat.providers';

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
    TasksService,
    UserRepository,
  ],
})
export class TasksModule {}
