/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UseInterceptors,
  Query,
  UploadedFile,
  ValidationPipe,
  UsePipes,
  Req,
  UseFilters,
} from '@nestjs/common';
import { ServicerService } from './servicer.service';
import {
  CreateServicerDto,
  LoginServicerDto,
  servicerProcedures,
} from './dto/create-servicer.dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { HttpExceptionFilter } from 'src/exceptions/http-exception.filter';

@Controller('servicer')
@UseFilters(new HttpExceptionFilter())
export class ServicerController {
  constructor(private readonly _servicerService: ServicerService) {}
  @Post('signup')
  @UsePipes(new ValidationPipe({ transform: true }))
  async servicerRegister(
    @Body() createServicerDto: CreateServicerDto,
    @Res() res: Response,
  ) {
    return this._servicerService.servicerRegister(createServicerDto, res);
  }
  @Post('servicerProcedures')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('file'))
  async servicerProcedures(
    @Body() servicerProcedures: servicerProcedures,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Query('id') id: string,
  ) {
    return this._servicerService.servicerProcedures(
      servicerProcedures,
      res,
      file,
      id,
    );
  }
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async servicerLogin(
    @Body() loggedServicer: LoginServicerDto,
    @Res() res: Response,
  ) {
    return this._servicerService.servicerLogin(loggedServicer, res);
  }
  @Get('servicerList')
  @UsePipes(new ValidationPipe({ transform: true }))
  async servicerDashboard(@Res() res: Response) {
    return this._servicerService.servicerDashboard(res);
  }
  @Get('servicerDetails')
  @UsePipes(new ValidationPipe({ transform: true }))
  async servicerDetails(@Res() res: Response, @Query('id') id: string) {
    return this._servicerService.servicerDetails(res, id);
  }
  @Get('servicersApproval')
  @UsePipes(new ValidationPipe({ transform: true }))
  async servicersApproval(@Res() res: Response) {
    return this._servicerService.servicersApproval(res);
  }
  @Get('servicerOtpVerification')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendMail(@Res() res: Response, @Query('id') id: string) {
    return this._servicerService.sendMail(res, id);
  }
  @Post('servicerDashboard')
  @UsePipes(new ValidationPipe({ transform: true }))
  async loadDashboard(@Res() res: Response, @Body('id') id: string) {
    return this._servicerService.loadDashboard(res, id);
  }
  @Get('categoriesList')
  @UsePipes(new ValidationPipe({ transform: true }))
  async servicesList(@Res() res: Response) {
    return this._servicerService.categoriesList(res);
  }
  @Get('logOut')
  @UsePipes(new ValidationPipe({ transform: true }))
  async logOut(@Res() res: Response) {
    return this._servicerService.logOut(res);
  }
  @Get('listBookings')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listBookings(@Res() res: Response) {
    return this._servicerService.listBookings(res);
  }
  @Post('approveBooking')
  @UsePipes(new ValidationPipe({ transform: true }))
  async approveBooking(@Res() res: Response, @Body('id') id: string) {
    return this._servicerService.approveBooking(res, id);
  }
  @Post('cancelBooking')
  @UsePipes(new ValidationPipe({ transform: true }))
  async scancelBooking(
    @Res() res: Response,
    @Body('textArea') textArea: string,
    @Body('bookingId') bookingId: string,
    @Body('userId') userId: string,
  ) {
    return this._servicerService.cancelBooking(
      res,
      textArea,
      bookingId,
      userId,
    );
  }
  @Get('getRecentUsers')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRecentUsers(@Req() req: Request, @Res() res: Response) {
    return this._servicerService.getRecentUsers(res, req);
  }
  @Get('getRecentChats')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRecentChats(
    @Query('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    return this._servicerService.getRecentChats(id, res, req);
  }
  @Get('dashboardReports')
  @UsePipes(new ValidationPipe({ transform: true }))
  async dashboardReports(@Res() res: Response, @Req() req: Request) {
    return this._servicerService.dashboardReports(res, req);
  }
}
