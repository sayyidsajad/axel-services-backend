import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IAppService } from './repositories/impl/app.service.impl';

@Injectable()
export class AppService implements IAppService {
  getHello(): string {
    try {
      return 'Welcome to Axel Services!';
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
