import { Connection } from 'mongoose';
import { BookingSchema } from 'src/schemas/bookings.schema';

export const bookingProviders = [
  {
    provide: 'BOOKING_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Booking', BookingSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
