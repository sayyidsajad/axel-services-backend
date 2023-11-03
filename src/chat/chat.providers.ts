import { Connection } from 'mongoose';
import { MessagingSchema } from 'src/schemas/messages.schema';

export const messagingsProviders = [
  {
    provide: 'MESSAGING_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Messaging', MessagingSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
