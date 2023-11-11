import { Controller, Get, UseFilters } from '@nestjs/common';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';

@Controller()
@UseFilters(new HttpExceptionFilter())
export class AppController {
  constructor(private readonly _appService: AppService) {}

  @Get()
  getHello(): string {
    return this._appService.getHello();
  }
}
