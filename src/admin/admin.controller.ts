import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Patch,
  ValidationPipe,
  UseInterceptors,
  UsePipes,
  UseFilters,
  UploadedFiles,
} from '@nestjs/common';
import { CreateAdminDto, CreateBanner } from './dto/create-admin.dto';
import { Response } from 'express';
import { CategoryAdminDto } from './dto/admin-category.dto';
import { HttpExceptionFilter } from 'src/exceptions/http-exception.filter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';

@Controller('admin')
@UseFilters(new HttpExceptionFilter())
export class AdminController {
  constructor(private _adminService: AdminService) {}
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminLogin(
    @Body() createAdminDto: CreateAdminDto,
    @Res() res: Response,
  ) {
    return this._adminService.adminLogin(createAdminDto, res);
  }
  @Post('approveServicer')
  @UsePipes(new ValidationPipe({ transform: true }))
  async approveServicer(@Body() id: string, @Res() res: Response) {
    return this._adminService.approveServicer(id['id'], res);
  }
  @Post('cancelApproval')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancelServicer(@Body() id: string, @Res() res: Response) {
    return this._adminService.cancelApproval(id['id'], res);
  }
  @Get('userMgt')
  @UsePipes(new ValidationPipe({ transform: true }))
  async userMgt(@Res() res: Response) {
    return this._adminService.userMgt(res);
  }
  @Post('blockUnblockUser')
  @UsePipes(new ValidationPipe({ transform: true }))
  async blockUser(@Body('id') id: string, @Res() res: Response) {
    return this._adminService.blockUnblockUser(res, id);
  }
  @Post('addCategory')
  @UsePipes(new ValidationPipe({ transform: true }))
  async addCategory(@Res() res: Response, @Body() category: CategoryAdminDto) {
    return this._adminService.addCategory(res, category);
  }
  @Get('listCategories')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listCategory(@Res() res: Response) {
    return this._adminService.listCategory(res);
  }
  @Get('listBookings')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listBookings(@Res() res: Response) {
    return this._adminService.listBookings(res);
  }
  @Patch('listUnlist')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listUnlist(@Res() res: Response, @Body('id') id: string) {
    return this._adminService.listUnlist(res, id);
  }
  @Get('servicersApproval')
  @UsePipes(new ValidationPipe({ transform: true }))
  async servicersApproval(@Res() res: Response) {
    return this._adminService.servicersApproval(res);
  }
  @Post('cancelBooking')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancelBooking(
    @Res() res: Response,
    @Body('textArea') textArea: string,
    @Body('bookingId') bookingId: string,
    @Body('userId') userId: string,
  ) {
    return this._adminService.cancelBooking(res, textArea, bookingId, userId);
  }
  @Get('listServices')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listServices(@Res() res: Response) {
    return this._adminService.listServices(res);
  }
  @Post('blockServicer')
  @UsePipes(new ValidationPipe({ transform: true }))
  async blockServicer(@Res() res: Response, @Body('id') id: string) {
    return this._adminService.blockServicer(res, id);
  }
  @Patch('updateCategory')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCategory(
    @Res() res: Response,
    @Body('id') id: string,
    @Body('categoryName') categoryName: string,
    @Body('description') description: string,
  ) {
    return this._adminService.updateCategory(
      res,
      id,
      categoryName,
      description,
    );
  }
  @Get('dashboardReports')
  @UsePipes(new ValidationPipe({ transform: true }))
  async dashboardReports(@Res() res: Response) {
    return this._adminService.dashboardReports(res);
  }
  @Post('createBanner')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 4 }]))
  async createBanner(
    @Res() res: Response,
    @Body() banner: CreateBanner,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    return this._adminService.createBanner(res, banner, images);
  }
  @Get('listBanners')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listBanners(@Res() res: Response) {
    return this._adminService.listBanners(res);
  }
}
