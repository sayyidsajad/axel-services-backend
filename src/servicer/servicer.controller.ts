import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UseInterceptors,
  Query,
  ValidationPipe,
  UsePipes,
  Req,
  UseFilters,
  UploadedFiles,
  Patch,
} from '@nestjs/common';
import { ServicerService } from './servicer.service';
import {
  CreateServicerDto,
  LoginServicerDto,
  servicerProcedures,
} from './dto/create-servicer.dto';
import { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'docs', maxCount: 4 },
      { name: 'img', maxCount: 1 },
    ]),
  )
  async servicerProcedures(
    @Body() data: servicerProcedures,
    @Res() res: Response,
    @Query('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this._servicerService.servicerProcedures(data, res, files, id);
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
    @Body('status') status?: string,
  ) {
    return this._servicerService.cancelBooking(
      res,
      textArea,
      bookingId,
      userId,
      status,
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
  @Post('createService')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async createService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() data: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this._servicerService.createService(req, res, data, files);
  }
  @Get('additionalList')
  @UsePipes(new ValidationPipe({ transform: true }))
  async additionalServices(@Res() res: Response, @Req() req: Request) {
    return this._servicerService.additionalLists(req, res);
  }
  @Get('getMyDetails')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getMyDetails(@Res() res: Response, @Req() req: Request) {
    return this._servicerService.getMyDetails(res, req);
  }
  @Patch('listUnlist')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listUnlist(@Res() res: Response, @Body('id') id: string) {
    return this._servicerService.listUnlist(res, id);
  }
}
