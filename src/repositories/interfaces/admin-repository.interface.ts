import { BookingDto } from 'src/admin/dto/booking.dto';
import { Category } from 'src/admin/entities/admin-category.entity';
import { Servicer } from 'src/servicer/entities/servicer.entity';
import { User } from 'src/users/entities/user.entity';

export interface IAdminRepository {
  servicerFindId(id: string): Promise<Servicer>;
  servicerApproval(id: string, approval: boolean): Promise<void>;
  altCode(id: string, otp: string): Promise<any>;
  servicerFindAll(): Promise<Servicer>;
  usersFindAll(): Promise<User>;
  userFindId(id: string): Promise<User>;
  blockUpdate(id: string, block: boolean): Promise<void>;
  createCategory(categoryName: string, description: string): Promise<void>;
  categoryFindAll(): Promise<Category>;
  bookingFindAll(): Promise<BookingDto>;
  categoryFind(id: string): Promise<Category>;
  categoryListUpdate(id: string, list: boolean): Promise<void>;
  cancelBooking(id: string): Promise<void>;
  cancelReasonUpdate(
    id: string,
    textArea: string,
    bookingId: string,
  ): Promise<void>;
  servicerBlock(id: string, block: boolean): Promise<void>;
  categoryUpdate(
    id: string,
    categoryName: string,
    description: string,
  ): Promise<void>;
  bookingStatusCount(status: string): Promise<BookingDto>;
}
