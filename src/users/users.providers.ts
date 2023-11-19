import { Connection } from 'mongoose';
import { UserSchema } from '../schemas/users.schema';
import { ReviewSchema } from 'src/schemas/reviews.schema';

export const usersProviders = [
  {
    provide: 'USER_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('User', UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

export const reviewsProviders = [
  {
    provide: 'REVIEW_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Review', ReviewSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
