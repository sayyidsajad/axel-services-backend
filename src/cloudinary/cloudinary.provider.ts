import { v2 } from 'cloudinary';
import { CLOUDINARY } from './constants';
import * as dotenv from 'dotenv';
dotenv.config();

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    return v2.config({
      cloud_name: 'dfsqgv3te',
      api_key: '239651184532697',
      api_secret: 'kfVzOhsYIGdewiRKdwvLzKo3M5U',
    });
  },
};
