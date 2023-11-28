import { User } from 'src/users/entities/user.entity';
import { Servicer } from 'src/servicer/entities/servicer.entity';
import { BookingDto } from 'src/admin/dto/booking.dto';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export interface IUserRepository {
  findAllUsers(): Promise<any[]>;
  servicerEmailFindOne(email: string): Promise<Servicer>;
  userPhoneFindOne(phone: number): Promise<User>;
  createUser(user: User): Promise<User>;
  userEmailFindOne(email: string): Promise<User>;
  userEmailUpdateOne(email: string): Promise<User>;
  servicerList(): Promise<Servicer>;
  lastBookingFindOne(): Promise<BookingDto>;
  servicerFindOneId(id: string): Promise<Servicer>;
  userWalletChecked(id: string, walletChecked: number): Promise<User>;
  createBooking(
    updatedDate: string,
    updateTime: string,
    lastValue: string,
    userId: string,
    id: string,
    reducedAmt: number,
  ): Promise<BookingDto>;
  listBookings(): Promise<BookingDto>;
  cancelBooking(id: string): Promise<BookingDto>;
  bookingFindId(id: string): Promise<BookingDto>;
  cancelBookingUpdateOne(id: string, total: number): Promise<BookingDto>;
  userInbox(id: string): Promise<User>;
  cancelAll(id: string): Promise<User>;
  paymentSuccess(id: string): Promise<void>;
  paymentFailed(id: string): Promise<void>;
  userFindId(id: string): Promise<User>;
  verifyConfirmPassword(id: string, hashedPassword: string): Promise<void>;
  findConnection(userId: string, id: string): Promise<any>;
  createRoom(userId: string, id: string): Promise<any>;
  userEnquiry(
    firstName: string,
    lastName: string,
    email: string,
    message: string,
  ): Promise<void>;
  review(servicerId: string, userId: string, message: string): Promise<void>;
  reviewsList(servicerId: string): Promise<any>;
  listBanners(): Promise<any>;
  additionalServices(id: string): Promise<any>;
  profilePicture(
    id: string,
    image: (UploadApiResponse | UploadApiErrorResponse)[],
  ): Promise<void>;
  filterDates(id: string): Promise<any>;
  filterTimes(id: string, date: any): Promise<any>;
}
