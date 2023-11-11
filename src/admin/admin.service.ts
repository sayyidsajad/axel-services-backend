import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Res,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Servicer } from 'src/servicer/entities/servicer.entity';
import mongoose, { Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import * as otpGenerator from 'otp-generator';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/admin-category.entity';
import { CategoryAdminDto } from './dto/admin-category.dto';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AdminService {
  constructor(
    @Inject('SERVICER_MODEL')
    private _servicerModel: Model<Servicer>,
    @Inject('USER_MODEL')
    private _userModel: Model<User>,
    @Inject('CATEGORY_MODEL')
    private _categoryModel: Model<Category>,
    @Inject('BOOKING_MODEL')
    private _bookingModel: Model<any>,
    private _configService: ConfigService,
    private _jwtService: JwtService,
    private readonly _mailerService: MailerService,
  ) {}
  async adminLogin(createAdminDto: CreateAdminDto, @Res() res: Response) {
    try {
      const adminEmail = this._configService.get<string>('ADMIN_EMAIL');
      const adminPass = this._configService.get<string>('ADMIN_PASS');
      const adminId = this._configService.get<string>('ADMIN_ID');
      const { email, password } = createAdminDto;
      if (adminEmail === email) {
        if (adminPass === password) {
          const payload = { _id: adminId };
          res.status(HttpStatus.OK).json({
            access_token: await this._jwtService.sign(payload),
            message: 'Successfully Logged In',
          });
        } else {
          res
            .status(HttpStatus.NOT_ACCEPTABLE)
            .json({ message: 'Admin password is incorrect' });
        }
      } else {
        res
          .status(HttpStatus.NOT_ACCEPTABLE)
          .json({ message: 'Admin email is incorrect' });
      }
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async approveServicer(id: string, @Res() res: Response) {
    try {
      const findApproved = await this._servicerModel.findById({ _id: id });
      if (findApproved['isApproved'] === true) {
        await this._servicerModel.updateOne(
          { _id: id },
          { $set: { isApproved: false } },
        );
        return res
          .status(HttpStatus.ACCEPTED)
          .json({ message: 'Not Approved' });
      }
      await this._servicerModel.updateOne(
        { _id: id },
        { $set: { isApproved: true } },
      );
      const servicerEmail = await this._servicerModel.findById({ _id: id });
      if (servicerEmail['isApproved'] === true) {
        const otp = await otpGenerator.generate(4, {
          digits: true,
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        await this._mailerService.sendMail({
          to: `${servicerEmail['email']}`,
          from: process.env.DEV_MAIL,
          subject: 'Axel Services Email Verification',
          text: 'Axel Services',
          html: `<h1>Welcome Servicer, Please enter the OTP to move Further! <b>${otp}</b> </h1>`,
        });
        const altCode = await this._servicerModel.updateOne(
          { _id: id },
          { $set: { altCode: otp } },
        );
        return res
          .status(HttpStatus.ACCEPTED)
          .json({ message: 'Success', altCode: altCode });
      }
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async servicersApproval(@Res() res: Response) {
    try {
      const servicesFind = await this._servicerModel.find({});
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Success', approvals: servicesFind });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async cancelApproval(id: string, @Res() res: Response) {
    try {
      const servicesApproved = await this._servicerModel.updateOne(
        { _id: id },
        { $set: { isApproved: false } },
      );
      return res
        .status(HttpStatus.ACCEPTED)
        .json({ message: 'Success', approvals: servicesApproved });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async userMgt(@Res() res: Response) {
    try {
      const users = await this._userModel.find({});
      res.status(HttpStatus.OK).json({ message: 'Success', users: users });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async blockUnblockUser(@Res() res: Response, id: string) {
    try {
      const findBlock = await this._userModel.findById({ _id: id });
      if (findBlock['isBlocked'] === true) {
        await this._userModel.updateOne(
          { _id: id },
          { $set: { isBlocked: false } },
        );
        return res.status(HttpStatus.ACCEPTED).json({ message: 'Unblocked' });
      }
      await this._userModel.updateOne(
        { _id: id },
        { $set: { isBlocked: true } },
      );
      return res.status(HttpStatus.ACCEPTED).json({ message: 'Blocked' });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async addCategory(res: Response, category: CategoryAdminDto) {
    try {
      const { categoryName, description } = category;
      const newCategory = new this._categoryModel({
        categoryName: categoryName,
        description: description,
      });
      await newCategory.save();
      return res.status(HttpStatus.CREATED).json({ message: 'Success' });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async listCategory(@Res() res: Response) {
    try {
      const listCategories = await this._categoryModel.find({});
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Success', categories: listCategories });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async listBookings(@Res() res: Response) {
    try {
      const listBookings = await this._bookingModel.aggregate([
        {
          $lookup: {
            from: 'servicers',
            localField: 'service',
            foreignField: '_id',
            as: 'services',
          },
        },
        {
          $unwind: {
            path: '$services',
          },
        },
      ]);
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Success', bookings: listBookings });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async logOut(@Res() res: Response) {
    try {
      return res.status(HttpStatus.OK).json({ message: 'Success' });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async listUnlist(@Res() res: Response, id: string) {
    try {
      const listCheck = await this._categoryModel.find({ _id: id });
      if (listCheck[0]['list'] === true) {
        await this._categoryModel.updateOne(
          { _id: id },
          { $set: { list: false } },
        );
        return res.status(HttpStatus.ACCEPTED).json({ message: 'Unlisted' });
      } else {
        await this._categoryModel.updateOne(
          { _id: id },
          { $set: { list: true } },
        );
      }
      return res.status(HttpStatus.ACCEPTED).json({ message: 'Listed' });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async cancelBooking(
    @Res() res: Response,
    textArea: string,
    bookingId: string,
    userId: string,
  ) {
    try {
      await this._bookingModel.updateOne(
        { _id: bookingId },
        { $set: { approvalStatus: 'Cancelled' } },
      );
      await this._userModel.updateOne(
        { _id: userId },
        {
          $push: {
            inbox: {
              cancelReason: textArea,
              bookingId: new mongoose.Types.ObjectId(bookingId),
            },
          },
        },
      );
      return res.status(HttpStatus.ACCEPTED).json({ message: 'Success' });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async listServices(@Res() res: Response) {
    try {
      const listServices = await this._servicerModel.find({});
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Success', services: listServices });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async blockServicer(@Res() res: Response, id: string) {
    try {
      const findServicer = await this._servicerModel.findById({ _id: id });
      if (findServicer['isBlocked']) {
        await this._servicerModel.updateOne(
          { _id: id },
          { $set: { isBlocked: false } },
        );
        return res.status(HttpStatus.ACCEPTED).json({ message: 'Unblocked' });
      } else {
        await this._servicerModel.updateOne(
          { _id: id },
          { $set: { isBlocked: true } },
        );
      }
      return res.status(HttpStatus.ACCEPTED).json({ message: 'Blocked' });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async updateCategory(
    @Res() res: Response,
    id: string,
    categoryName: string,
    description: string,
  ) {
    try {
      await this._categoryModel.updateOne(
        { _id: id },
        { $set: { categoryName: categoryName, description: description } },
      );
      return res.status(HttpStatus.ACCEPTED).json({ message: 'Success' });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
  async dashboardReports(res: Response) {
    try {
      const pending = await this._bookingModel
        .find({ approvalStatus: 'Pending' })
        .count();
      const cancelled = await this._bookingModel
        .find({ approvalStatus: 'Cancelled' })
        .count();
      const serviceCompleted = await this._bookingModel
        .find({ approvalStatus: 'Service Completed' })
        .count();
      return res.status(HttpStatus.OK).json({
        message: 'Success',
        approvalStatus: { pending, cancelled, serviceCompleted },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
}
