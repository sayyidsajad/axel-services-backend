import { Connection } from 'mongoose';
import { BookingSchema } from 'src/schemas/bookings.schema';
import { EnquirySchema } from 'src/schemas/enquiries.schema';
import { BannerSchema } from 'src/schemas/banner.schema';

export const bookingProviders = [
  {
    provide: 'BOOKING_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Booking', BookingSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

export const bannerProviders = [
  {
    provide: 'BANNER_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Banner', BannerSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

export const EnquiryProviders = [
  {
    provide: 'ENQUIRY_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Enquiry', EnquirySchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
