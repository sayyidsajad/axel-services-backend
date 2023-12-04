import {
  CreateUserDto,
  SocialUser,
  loggedUserDto,
} from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { Response } from 'express';
import { PaymentVerificationDto } from 'src/users/dto/verify-payment.dto';

export interface IUserService {
  userRegister(createUserDto: CreateUserDto, res: Response): Promise<User>;
  userLogin(user: loggedUserDto, res: Response): Promise<any>;
  googleLogin(socialUser: SocialUser, res: Response): Promise<any>;
  sendMail(id: string, res: Response): Promise<any>;
  loadHome(id: string, res: Response): Promise<any>;
  bookNow(
    req: Request,
    res: Response,
    id: string,
    date: string,
    time: string,
    walletChewalletChecked: number,
  ): Promise<any>;
  bookingsList(res: Response): Promise<any>;
  cancel(
    req: Request,
    res: Response,
    id: string,
    textArea: string,
  ): Promise<any>;
  servicerList(res: Response, page?: number, filters?: any): Promise<any>;
  userInbox(res: Response, req: Request): Promise<any>;
  cancelAll(res: Response, req: Request): Promise<any>;
  userProfile(res: Response, req: Request): Promise<any>;
  verifyPayment(res: Response, data: PaymentVerificationDto): Promise<any>;
  servicerDetails(req: Request, res: Response, id: string): Promise<any>;
  forgotPassword(res: Response, email: string): Promise<any>;
  verifyConfirmPassword(
    res: Response,
    newPassword: string,
    newConfirmPassword: string,
    id: string,
  ): Promise<any>;
  getRecentChats(id: string, res: Response, req: Request): Promise<any>;
  userEnquiry(res: Response, data: any): Promise<any>;
  review(res: Response, data: any): Promise<any>;
  reviewsList(id: string, res: Response): Promise<any>;
  listBanners(res: Response): Promise<any>;
  additionalLists(res: Response, id: string): Promise<any>;
  profilePicture(
    req: Request,
    res: Response,
    files: Array<Express.Multer.File>,
  ): Promise<any>;
  filterDates(req: Request, res: Response, id: string): Promise<any>;
  filterTimes(
    req: Request,
    res: Response,
    id: string,
    date: string,
  ): Promise<any>;
  categoriesList(res: Response): Promise<any>;
  findSearched(
    res: Response,
    place: string,
    categ: string,
    date: string,
  ): Promise<any>;
  editProfile(
    req: Request,
    res: Response,
    name: string,
    phone: number,
  ): Promise<any>;
  updatePassword(
    req: Request,
    res: Response,
    currentPassword: string,
    password: string,
  ): Promise<any>;
  viewDetails(res: Response, id: string): Promise<any>;
}
