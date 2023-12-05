import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const { query } = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    try {
      const response: AxiosResponse<any> = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?response=${query.recaptcha}&secret=${process.env.RECAPTCHA_SECRET}`,
      );

      if (!response.data.success) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Invalid Captcha' });
      }
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
}
