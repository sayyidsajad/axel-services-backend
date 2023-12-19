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
import {
  CreateUserDto,
  SocialUser,
  loggedUserDto,
} from './dto/create-user.dto';
import { PaymentVerificationDto } from './dto/verify-payment.dto';
import { Response } from 'express';
import { HttpExceptionFilter } from 'src/exceptions/http-exception.filter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller()
@UseFilters(new HttpExceptionFilter())
export class UsersController {
  constructor(private _userServices: UsersService) {}
  @Post('signup')
  @UsePipes(new ValidationPipe({ transform: true }))
  async userRegister(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<User> {
    return this._userServices.userRegister(createUserDto, res);
  }
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async userLogin(@Body() user: loggedUserDto, @Res() res: Response) {
    return this._userServices.userLogin(user, res);
  }
  @Post('googleLogin')
  @UsePipes(new ValidationPipe({ transform: true }))
  async googleLogin(@Body() socialUser: SocialUser, @Res() res: Response) {
    return this._userServices.googleLogin(socialUser, res);
  }
  @Get('otpVerification')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendMail(@Query('id') id: string, @Res() res: Response) {
    return this._userServices.sendMail(id, res);
  }
  @Patch('home')
  @UsePipes(new ValidationPipe({ transform: true }))
  async loadHome(@Body('id') id: string, @Res() res: Response) {
    return this._userServices.loadHome(id, res);
  }
  @Post('bookNow')
  @UsePipes(new ValidationPipe({ transform: true }))
  async bookNow(
    @Req() req: Request,
    @Res() res: Response,
    @Body('id') id: string,
    @Body('date') date: string,
    @Body('time') time: string,
    @Body('place') place: string,
    @Body('walletChecked') walletChecked: number,
  ) {
    return this._userServices.bookNow(
      req,
      res,
      id,
      date,
      time,
      place,
      walletChecked,
    );
  }
  @Get('bookingsList')
  @UsePipes(new ValidationPipe({ transform: true }))
  async bookingsList(@Req() req: Request, @Res() res: Response) {
    return this._userServices.bookingsList(req, res);
  }
  @Patch('cancelBooked')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancel(
    @Req() req: Request,
    @Res() res: Response,
    @Body('id') id: string,
    @Body('textArea') textArea: string,
  ) {
    return this._userServices.cancel(req, res, id, textArea);
  }
  @Get('servicerList')
  @UsePipes(new ValidationPipe({ transform: true }))
  async servicerList(
    @Res() res: Response,
    @Query('page') page?: number,
    @Query() filters?: any,
  ) {
    return this._userServices.servicerList(res, page, filters);
  }
  @Get('userInbox')
  @UsePipes(new ValidationPipe({ transform: true }))
  async userInbox(@Res() res: Response, @Req() req: Request) {
    return this._userServices.userInbox(res, req);
  }
  @Get('clearAll')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancelAll(@Res() res: Response, @Req() req: Request) {
    return this._userServices.cancelAll(res, req);
  }
  @Get('userProfile')
  @UsePipes(new ValidationPipe({ transform: true }))
  async userProfile(@Res() res: Response, @Req() req: Request) {
    return this._userServices.userProfile(res, req);
  }
  @Post('verifyPayment')
  @UsePipes(new ValidationPipe({ transform: true }))
  async verifyPayment(
    @Res() res: Response,
    @Body() data: PaymentVerificationDto,
  ) {
    return this._userServices.verifyPayment(res, data);
  }
  @Get('servicerDetails')
  @UsePipes(new ValidationPipe({ transform: true }))
  async servicerDetails(
    @Req() req: Request,
    @Res() res: Response,
    @Query('id') id: string,
  ) {
    return this._userServices.servicerDetails(req, res, id);
  }
  @Post('forgotPassword')
  @UsePipes(new ValidationPipe({ transform: true }))
  async forgotPassword(@Res() res: Response, @Body('email') email: string) {
    return this._userServices.forgotPassword(res, email);
  }
  @Post('verifyConfirmPassword')
  @UsePipes(new ValidationPipe({ transform: true }))
  async verifyConfirmPassword(
    @Res() res: Response,
    @Body('newPassword') newPassword: string,
    @Body('newConfirmPassword') newConfirmPassword: string,
    @Query('id') id: string,
  ) {
    return this._userServices.verifyConfirmPassword(
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
    return this._userServices.getRecentChats(id, res, req);
  }
  @Post('userEnquiry')
  @UsePipes(new ValidationPipe({ transform: true }))
  async userEnquiry(@Res() res: Response, @Body() data: any) {
    return this._userServices.userEnquiry(res, data);
  }
  @Post('review')
  @UsePipes(new ValidationPipe({ transform: true }))
  async review(@Res() res: Response, @Body() data: any) {
    return this._userServices.review(res, data);
  }
  @Get('reviewsList')
  @UsePipes(new ValidationPipe({ transform: true }))
  async reviewsList(@Query('id') id: string, @Res() res: Response) {
    return this._userServices.reviewsList(id, res);
  }
  @Get('listBanners')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listBanners(@Res() res: Response) {
    return this._userServices.listBanners(res);
  }
  @Get('additionalList')
  @UsePipes(new ValidationPipe({ transform: true }))
  async additionalServices(@Res() res: Response, @Query('id') id: string) {
    return this._userServices.additionalLists(res, id);
  }
  @Patch('profilePicture')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileFieldsInterceptor([{ name: 'img', maxCount: 1 }]))
  async profilePicture(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this._userServices.profilePicture(req, res, files);
  }
  @Get('filterDates')
  @UsePipes(new ValidationPipe({ transform: true }))
  async filterDates(
    @Req() req: Request,
    @Res() res: Response,
    @Query('id') id: string,
  ) {
    return this._userServices.filterDates(req, res, id);
  }
  @Post('filterTimes')
  @UsePipes(new ValidationPipe({ transform: true }))
  async filterTimes(
    @Req() req: Request,
    @Res() res: Response,
    @Body('id') id: string,
    @Body('date') date: string,
  ) {
    return this._userServices.filterTimes(req, res, id, date);
  }
  @Get('categoriesList')
  @UsePipes(new ValidationPipe({ transform: true }))
  async categoriesList(@Res() res: Response) {
    return this._userServices.categoriesList(res);
  }
  @Post('findSearched')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findSearched(@Res() res: Response, @Body() data: any) {
    return this._userServices.findSearched(
      res,
      data.place,
      data.categ,
      data.date,
    );
  }
  @Patch('editProfile')
  @UsePipes(new ValidationPipe({ transform: true }))
  async editProfile(
    @Req() req: Request,
    @Res() res: Response,
    @Body('name') name: string,
    @Body('phone') phone: number,
  ) {
    return this._userServices.editProfile(req, res, name, phone);
  }
  @Patch('updatePassword')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePassword(
    @Req() req: Request,
    @Res() res: Response,
    @Body() data: any,
  ) {
    return this._userServices.updatePassword(
      req,
      res,
      data.currentPassword,
      data.password,
    );
  }
  @Patch('clearOne')
  @UsePipes(new ValidationPipe({ transform: true }))
  async clearOne(
    @Req() req: Request,
    @Res() res: Response,
    @Body('inboxId') inboxId: string,
  ) {
    return this._userServices.clearOne(res, req, inboxId);
  }
  @Get('viewDetails')
  @UsePipes(new ValidationPipe({ transform: true }))
  async viewDetails(@Res() res: Response, @Query('id') id: string) {
    return this._userServices.viewDetails(res, id);
  }
}
