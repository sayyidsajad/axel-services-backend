import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadImage(
    files: Array<Express.Multer.File>,
  ): Promise<Array<UploadApiResponse | UploadApiErrorResponse>> {
    const uploadPromises: Promise<
      UploadApiResponse | UploadApiErrorResponse
    >[] = [];
    files.forEach((file) => {
      const promise = new Promise<UploadApiResponse | UploadApiErrorResponse>(
        (resolve, reject) => {
          const upload = v2.uploader.upload_stream(
            { folder: 'axelServices' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
          toStream(file.buffer).pipe(upload);
        },
      );

      uploadPromises.push(promise);
    });

    return Promise.all(uploadPromises);
  }
}
