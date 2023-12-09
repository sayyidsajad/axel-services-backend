import { Response } from 'express';
import { CategoryAdminDto } from 'src/admin/dto/admin-category.dto';
import { CreateAdminDto, CreateBanner } from 'src/admin/dto/create-admin.dto';
export interface IAdminService {
  adminLogin(createAdminDto: CreateAdminDto, res: Response): Promise<any>;
  approveServicer(id: string, res: Response): Promise<any>;
  cancelApproval(id: string, res: Response): Promise<any>;
  userMgt(res: Response): Promise<any>;
  blockUnblockUser(res: Response, id: string): Promise<any>;
  addCategory(res: Response, category: CategoryAdminDto): Promise<any>;
  listCategory(res: Response): Promise<any>;
  listBookings(res: Response): Promise<any>;
  listUnlist(res: Response, id: string): Promise<any>;
  bannerListUnlist(res: Response, id: string): Promise<any>;
  servicersApproval(res: Response): Promise<any>;
  cancelBooking(
    res: Response,
    textArea: string,
    bookingId: string,
    userId: string,
  ): Promise<any>;
  listServices(res: Response): Promise<any>;
  blockServicer(res: Response, id: string): Promise<any>;
  updateCategory(
    res: Response,
    id: string,
    categoryName: string,
    description: string,
  ): Promise<any>;
  dashboardReports(res: Response): Promise<any>;
  createBanner(
    res: Response,
    banner: CreateBanner,
    images: Array<Express.Multer.File>,
  ): Promise<any>;
  listBanners(res: Response): Promise<any>;
}
