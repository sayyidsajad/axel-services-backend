/* eslint-disable prettier/prettier */
import { Connection } from 'mongoose';
import { ServicerSchema } from '../schemas/servicers.schema';

export const servicerProviders = [
    {
        provide: 'SERVICER_MODEL',
        useFactory: (connection: Connection) => connection.model('Servicer', ServicerSchema),
        inject: ['DATABASE_CONNECTION'],
    },
];
