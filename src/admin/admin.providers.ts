/* eslint-disable prettier/prettier */
import { Connection } from 'mongoose';
import { ServicerSchema } from '../schemas/servicers.schema';
import { BookingSchema } from 'src/schemas/bookings.schema';

export const servicerProviders = [
    {
        provide: 'SERVICER_MODEL',
        useFactory: (connection: Connection) => connection.model('Servicer', ServicerSchema),
        inject: ['DATABASE_CONNECTION'],
    },
];
export const bookingProviders = [
    {
        provide: 'BOOKING_MODEL',
        useFactory: (connection: Connection) => connection.model('Booking', BookingSchema),
        inject: ['DATABASE_CONNECTION'],
    },
];
