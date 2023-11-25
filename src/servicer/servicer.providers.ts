import { Connection } from 'mongoose';
import { ServicerSchema } from '../schemas/servicers.schema';
import { AdditionalServicesSchema } from 'src/schemas/additionalServices.schema';

export const servicerProviders = [
  {
    provide: 'SERVICER_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Servicer', ServicerSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
export const additionalServicesProviders = [
  {
    provide: 'ADDITIONAL_SERVICES_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('AdditionalServices', AdditionalServicesSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
