import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { BookingDto } from 'src/admin/dto/booking.dto';
import { Category } from 'src/admin/entities/admin-category.entity';
import { Servicer } from 'src/servicer/entities/servicer.entity';
import { User } from 'src/users/entities/user.entity';

export interface IServicerRepository {
  userFindEmail(email: string): Promise<User>;
  createServicer(
    companyName: string,
    email: string,
    phone: number,
    hashedPassword: string,
  ): Promise<Servicer>;
  servicerFindEmail(email: string): Promise<Servicer>;
  categoryFind(category: string): Promise<Category>;
  servicerProceduresUpdate(
    id: string,
    serviceName: string,
    description: string,
    category: string,
    amount: string,
    address: string,
    image: (UploadApiResponse | UploadApiErrorResponse)[],
    images: (UploadApiResponse | UploadApiErrorResponse)[],
  ): Promise<void>;
  servicerDashboard(): Promise<Servicer>;
  servicerDetails(id: string): Promise<Servicer>;
  serviceFindAll(): Promise<Servicer>;
  approveServicer(): Promise<Servicer>;
  servicerFindId(id: string): Promise<Servicer>;
  loadDashboard(id: string): Promise<void>;
  categoriesList(): Promise<Category>;
  bookingsList(): Promise<BookingDto>;
  bookingApprovalStatus(id: string, status: string): Promise<void>;
  cancelBooking(bookingId: string, id: string, textArea: string): Promise<void>;
  findConnection(id: string): Promise<any>;
  recentChats(servicerId: string, id: string): Promise<any>;
  createRoom(serviceId: string, id: string): Promise<any>;
  bookingStatusCount(id: string, status: string): Promise<BookingDto>;
  salesByYear(id: string, currentSalesYear: Date): Promise<BookingDto>;
  bookingFindId(id: string): Promise<BookingDto>;
}
