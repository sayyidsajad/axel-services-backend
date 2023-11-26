import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  Query,
  Patch,
  ValidationPipe,
  UseInterceptors,
  UsePipes,
  UseFilters,
  UploadedFiles,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  SocialUser,
  loggedUserDto,
} from './dto/create-user.dto';
import { PaymentVerificationDto } from './dto/verify-payment.dto';
import { Response } from 'express';
import { HttpExceptionFilter } from 'src/exceptions/http-exception.filter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller()
@UseFilters(new HttpExceptionFilter())
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}
  @Post('signup')
  @UsePipes(new ValidationPipe({ transform: true }))
  async userRegister(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    return this._usersService.userRegister(createUserDto, res);
  }
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async userLogin(@Body() user: loggedUserDto, @Res() res: Response) {
    return this._usersService.userLogin(user, res);
  }
  @Post('googleLogin')
  @UsePipes(new ValidationPipe({ transform: true }))
  async googleLogin(@Body() socialUser: SocialUser, @Res() res: Response) {
    return this._usersService.googleLogin(socialUser, res);
  }
  @Get('otpVerification')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendMail(@Query('email') email: string, @Res() res: Response) {
    return this._usersService.sendMail(res, email);
  }
  @Patch('home')
  @UsePipes(new ValidationPipe({ transform: true }))
  async loadHome(@Res() res: Response, @Body('email') email: string) {
    return this._usersService.loadHome(res, email);
  }
  @Post('bookNow')
  @UsePipes(new ValidationPipe({ transform: true }))
  async bookNow(
    @Req() req: Request,
    @Res() res: Response,
    @Body('id') id: string,
    @Body('date') date: Date,
    @Body('time') time: string,
    @Body('walletChecked') walletChecked: number,
  ) {
    return this._usersService.bookNow(req, res, id, date, time, walletChecked);
  }
  @Get('bookingsList')
  @UsePipes(new ValidationPipe({ transform: true }))
  async bookingsList(@Res() res: Response) {
    return this._usersService.bookingsList(res);
  }
  @Patch('cancelBooked')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancel(
    @Req() req: Request,
    @Res() res: Response,
    @Body('id') id: string,
  ) {
    return this._usersService.cancel(req, res, id);
  }
  @Get('servicerList')
  @UsePipes(new ValidationPipe({ transform: true }))
  async servicerList(@Res() res: Response) {
    return this._usersService.servicerList(res);
  }
  @Get('userInbox')
  @UsePipes(new ValidationPipe({ transform: true }))
  async userInbox(@Res() res: Response, @Req() req: Request) {
    return this._usersService.userInbox(res, req);
  }
  @Get('clearAll')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancelAll(@Res() res: Response, @Req() req: Request) {
    return this._usersService.cancelAll(res, req);
  }
  @Get('userProfile')
  @UsePipes(new ValidationPipe({ transform: true }))
  async userProfile(@Res() res: Response, @Req() req: Request) {
    return this._usersService.userProfile(res, req);
  }
  @Post('verifyPayment')
  @UsePipes(new ValidationPipe({ transform: true }))
  async verifyPayment(
    @Res() res: Response,
    @Body() data: PaymentVerificationDto,
  ) {
    return this._usersService.verifyPayment(res, data);
  }
  @Get('servicerDetails')
  @UsePipes(new ValidationPipe({ transform: true }))
  async servicerDetails(
    @Req() req: Request,
    @Res() res: Response,
    @Query('id') id: string,
  ) {
    return this._usersService.servicerDetails(req, res, id);
  }
  @Post('forgotPassword')
  @UsePipes(new ValidationPipe({ transform: true }))
  async forgotPassword(@Res() res: Response, @Body('email') email: string) {
    return this._usersService.forgotPassword(res, email);
  }
  @Post('verifyConfirmPassword')
  @UsePipes(new ValidationPipe({ transform: true }))
  async verifyConfirmPassword(
    @Res() res: Response,
    @Body('newPassword') newPassword: string,
    @Body('newConfirmPassword') newConfirmPassword: string,
    @Query('id') id: string,
  ) {
    return this._usersService.verifyConfirmPassword(
      res,
      id,
      newPassword,
      newConfirmPassword,
    );
  }
  @Get('getRecentChats')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRecentChats(
    @Query('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    return this._usersService.getRecentChats(id, res, req);
  }
  @Post('userEnquiry')
  @UsePipes(new ValidationPipe({ transform: true }))
  async userEnquiry(@Res() res: Response, @Body() data: any) {
    return this._usersService.userEnquiry(res, data);
  }
  @Post('review')
  @UsePipes(new ValidationPipe({ transform: true }))
  async review(@Res() res: Response, @Body() data: any) {
    return this._usersService.review(res, data);
  }
  @Get('reviewsList')
  @UsePipes(new ValidationPipe({ transform: true }))
  async reviewsList(@Query('id') id: string, @Res() res: Response) {
    return this._usersService.reviewsList(id, res);
  }
  @Get('listBanners')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listBanners(@Res() res: Response) {
    return this._usersService.listBanners(res);
  }
  @Get('additionalList')
  @UsePipes(new ValidationPipe({ transform: true }))
  async additionalServices(@Res() res: Response, @Query('id') id: string) {
    return this._usersService.additionalLists(res, id);
  }
  @Patch('profilePicture')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileFieldsInterceptor([{ name: 'img', maxCount: 1 }]))
  async profilePicture(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this._usersService.profilePicture(req, res, files);
  }
}
