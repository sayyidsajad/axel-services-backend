/* eslint-disable prettier/prettier */
import { Connection } from 'mongoose';
import { UserSchema } from '../schemas/users.schema';

export const usersProviders = [
  {
    provide: 'USER_MODEL',
    useFactory: (connection: Connection) => connection.model('User', UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
import { BookingSchema } from 'src/schemas/bookings.schema';
import { ServicerSchema } from 'src/schemas/servicers.schema';

export const bookingProviders = [
  {
    provide: 'BOOKING_MODEL',
    useFactory: (connection: Connection) => connection.model('Booking', BookingSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
export const servicerProviders = [
  {
    provide: 'SERVICER_MODEL',
    useFactory: (connection: Connection) => connection.model('Servicer', ServicerSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
