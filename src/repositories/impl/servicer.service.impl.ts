import { Response } from 'express';
import {
  CreateServicerDto,
  LoginServicerDto,
  servicerProcedures,
} from 'src/servicer/dto/create-servicer.dto';
export interface IServicerService {
  servicerRegister(
    createServicerDto: CreateServicerDto,
    res: Response,
  ): Promise<any>;
  servicerProcedures(
    data: servicerProcedures,
    res: Response,
    files: Array<Express.Multer.File>,
    id: string,
  ): Promise<any>;
  servicerLogin(loggedServicer: LoginServicerDto, res: Response): Promise<any>;
  servicerDashboard(res: Response): Promise<any>;
  servicerDetails(res: Response, id: string): Promise<any>;
  servicersApproval(res: Response): Promise<any>;
  sendMail(res: Response, id: string): Promise<any>;
  loadDashboard(res: Response, id: string): Promise<any>;
  categoriesList(res: Response): Promise<any>;
  listBookings(req: Request, res: Response): Promise<any>;
  listReviews(req: Request, res: Response): Promise<any>;
  approveBooking(res: Response, id: string): Promise<any>;
  cancelBooking(
    res: Response,
    textArea: string,
    bookingId: string,
    userId: string,
    status?: string,
  ): Promise<any>;
  getRecentUsers(res: Response, req: Request): Promise<any>;
  getRecentChats(id: string, res: Response, req: Request): Promise<any>;
  dashboardReports(res: Response, req: Request): Promise<any>;
  createService(
    req: Request,
    res: Response,
    data: any,
    files: Array<Express.Multer.File>,
  ): Promise<any>;
  additionalLists(req: Request, res: Response): Promise<any>;
  getMyDetails(res: Response, req: Request): Promise<any>;
  listUnlist(res: Response, id: string): Promise<any>;
  updateService(
    res: Response,
    data: any,
    files: Array<Express.Multer.File>,
  ): Promise<any>;
  servicerCaptcha(res: Response): Promise<any>;
}
