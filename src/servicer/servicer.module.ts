import { Module } from '@nestjs/common';
import { ServicerService } from './servicer.service';
import { ServicerController } from './servicer.controller';
import { servicerProviders } from './servicer.providers';
import { DatabaseModule } from 'src/config/database/database.module';
import { MulterModule } from '@nestjs/platform-express';
import { categoryProviders } from 'src/admin/admin-category.providers';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    DatabaseModule,
    MulterModule.register({
      dest: './upload',
    }),
    CloudinaryModule,
  ],
  controllers: [ServicerController],
  providers: [ServicerService, ...servicerProviders, ...categoryProviders],
})
export class ServicerModule {}
