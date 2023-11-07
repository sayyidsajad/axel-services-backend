import { Module } from '@nestjs/common';
import { ServicerService } from './servicer.service';
import { ServicerController } from './servicer.controller';
import { servicerProviders } from './servicer.providers';
import { DatabaseModule } from 'src/config/database/database.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';
import { usersProviders } from 'src/users/users.providers';
import { categoryProviders } from 'src/admin/admin-category.providers';
import { bookingProviders } from 'src/admin/admin.providers';
import { messagingsProviders } from 'src/chat/chat.providers';

@Module({
  imports: [DatabaseModule, CloudinaryModule, ConfigModule],
  controllers: [ServicerController],
  providers: [
    ServicerService,
    ...servicerProviders,
    ...categoryProviders,
    ...bookingProviders,
    ...usersProviders,
    ...messagingsProviders,
  ],
})
export class ServicerModule {}
