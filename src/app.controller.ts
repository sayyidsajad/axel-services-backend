import { Controller, Get, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';
import { AppService } from './app.service';

@Controller()
@UseFilters(new HttpExceptionFilter())
export class AppController {
  constructor(private _appService: AppService) {}

  @Get()
  getHello(): string {
    return this._appService.getHello();
  }
}
