/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable, Res } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Servicer } from 'src/servicer/entities/servicer.entity';
import { Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import * as otpGenerator from 'otp-generator';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/admin-category.entity';
import { CategoryAdminDto } from './dto/admin-category.dto';
import { bookingDto } from 'src/users/dto/create-user.dto';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AdminService {
  constructor(
    @Inject('SERVICER_MODEL')
    private servicerModel: Model<Servicer>,
    @Inject('USER_MODEL')
    private userModel: Model<User>,
    @Inject('CATEGORY_MODEL')
    private categoryModel: Model<Category>,
    @Inject('BOOKING_MODEL')
    private bookingModel: Model<bookingDto>,
    private configService: ConfigService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}
  async adminLogin(createAdminDto: CreateAdminDto, @Res() res: Response) {
    try {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      const adminPass = this.configService.get<string>('ADMIN_PASS');
      const adminId = this.configService.get<string>('ADMIN_ID');
      const { email, password } = createAdminDto;
      if (adminEmail === email) {
        if (adminPass === password) {
          const payload = { _id: adminId };
          res.status(200).json({
            access_token: await this.jwtService.sign(payload),
            message: 'Successfully Logged In',
          });
        } else {
          res.status(400).json({ message: 'Admin password is incorrect' });
        }
      } else {
        res.status(400).json({ message: 'Admin email is incorrect' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async approveServicer(id: string, @Res() res: Response) {
    try {
      const servicesApproved = await this.servicerModel.updateOne(
        { _id: id },
        { $set: { isApproved: true } },
      );
      const servicerEmail = await this.servicerModel.findById({ _id: id });
      if (servicerEmail['isApproved'] === true) {
        const otp = await otpGenerator.generate(4, {
          digits: true,
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        await this.mailerService.sendMail({
          to: `${servicerEmail['email']}`,
          from: process.env.DEV_MAIL,
          subject: 'Axel Services Email Verification',
          text: 'Axel Services',
          html: `<h1>Welcome Servicer, Please enter the OTP to move Further! <b>${otp}</b> </h1>`,
        });
        const altCode = await this.servicerModel.updateOne(
          { _id: id },
          { $set: { altCode: otp } },
        );
        return res.status(201).json({ message: 'Success', altCode: altCode });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async cancelApproval(id: string, @Res() res: Response) {
    try {
      const servicesApproved = await this.servicerModel.updateOne(
        { _id: id },
        { $set: { isApproved: false } },
      );
      return res
        .status(201)
        .json({ message: 'Success', approvals: servicesApproved });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async userMgt(@Res() res: Response) {
    try {
      const users = await this.userModel.find({});
      res.status(200).json({ message: 'Success', users: users });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async blockUnblockUser(@Res() res: Response, id: string) {
    try {
      const findBlock = await this.userModel.findById({ _id: id });
      if (findBlock['isBlocked'] === true) {
        await this.userModel.updateOne(
          { _id: id },
          { $set: { isBlocked: false } },
        );
        return res.status(200).json({ message: 'Success' });
      }
      await this.userModel.updateOne(
        { _id: id },
        { $set: { isBlocked: true } },
      );
      return res.status(200).json({ message: 'Success' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async addCategory(@Res() res: Response, category: CategoryAdminDto) {
    try {
      const { categoryName, description } = category;
      const newCategory = new this.categoryModel({
        categoryName: categoryName,
        description: description,
      });
      await newCategory.save();
      return res.status(200).json({ message: 'Success' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async listCategory(@Res() res: Response) {
    try {
      const listCategories = await this.categoryModel.find({});
      return res
        .status(200)
        .json({ message: 'Success', categories: listCategories });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async listBookings(@Res() res: Response) {
    try {
      const listBookings = await this.bookingModel.find({});
      return res
        .status(200)
        .json({ message: 'Success', bookings: listBookings });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
