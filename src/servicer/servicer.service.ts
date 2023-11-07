/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable, Res, UploadedFile } from '@nestjs/common';
import {
  CreateServicerDto,
  servicerProcedures,
} from './dto/create-servicer.dto';
import { Servicer } from './entities/servicer.entity';
import mongoose, { Model } from 'mongoose';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { loggedUserDto } from 'src/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as otpGenerator from 'otp-generator';
import { MailerService } from '@nestjs-modules/mailer';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
dotenv.config();

@Injectable()
export class ServicerService {
  constructor(
    @Inject('SERVICER_MODEL')
    private servicerModel: Model<Servicer>,
    @Inject('CATEGORY_MODEL')
    private categoryModel: Model<any>,
    @Inject('BOOKING_MODEL')
    private bookingModel: Model<any>,
    @Inject('USER_MODEL')
    private userModel: Model<any>,
    @Inject('MESSAGING_MODEL')
    private messagingModel: Model<any>,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    private cloudinary: CloudinaryService,
    private configService: ConfigService,
  ) {}
  async servicerRegister(
    createServicerDto: CreateServicerDto,
    @Res() res: Response,
  ) {
    try {
      const { companyName, email, password, confirmPassword, phone } =
        createServicerDto;
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      const createdServicer = await this.servicerModel.findOne({
        email: email,
      });
      const createdUser = await this.userModel.findOne({ email: email });
      if (adminEmail === email) {
        return res
          .status(400)
          .json({ message: 'Admin cannot be logged in as a servicer' });
      } else if (createdUser?.['email'] === email) {
        return res
          .status(400)
          .json({ message: 'Email has been already used by an user' });
      } else if (createdUser?.['phone'] === phone) {
        return res
          .status(400)
          .json({ message: 'Phone has been already by a servicer' });
      } else if (createdServicer?.['phone'] === phone) {
        return res
          .status(400)
          .json({ message: 'Phone has been already registered' });
      } else if (
        createdServicer?.['password'] !== createdServicer?.['confirmPassword']
      ) {
        return res
          .status(400)
          .json({ message: 'Password and Confirm Password do not match' });
      }
      if (!createdServicer) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newServicer = new this.servicerModel({
          companyName: companyName,
          email: email,
          phone: phone,
          password: hashedPassword,
        });
        const savedServicer = await newServicer.save();
        const payload = { token: savedServicer._id };
        return res.status(200).json({
          access_token: await this.jwtService.sign(payload),
          message: 'Success',
          id: savedServicer._id,
        });
      } else {
        return res
          .status(400)
          .json({ message: 'Email has been already registered' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async servicerLogin(loggedServicer: loggedUserDto, @Res() res: Response) {
    try {
      const { email, password } = loggedServicer;
      const searchEmail = await this.servicerModel.findOne({ email: email });
      const userPassword = await bcrypt.compare(
        password,
        searchEmail['password'],
      );
      if (!searchEmail) {
        return res.status(400).json({ message: "Email hasn't registered" });
      } else if (!userPassword) {
        return res.status(400).json({ message: 'Incorrect Password' });
      } else if (searchEmail['isApproved'] !== true) {
        return res
          .status(400)
          .json({ message: 'Your email has not been Approved' });
      }
      const payload = { token: searchEmail._id };
      res.status(200).json({
        access_token: await this.jwtService.sign(payload),
        message: 'Successfully Logged In',
        isVerified: searchEmail['isVerified'],
        isApproved: searchEmail['isApproved'],
        altCode: searchEmail['altCode'],
        id: searchEmail['_id'],
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async servicerProcedures(
    servicerProcedures: servicerProcedures,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    id: string,
  ) {
    try {
      const { serviceName, description, amount, category } = servicerProcedures;
      if (servicerProcedures['file']) {
        const categoryId = await this.categoryModel.findOne({
          categoryName: category,
        });
        await this.servicerModel.updateOne(
          { _id: new mongoose.Types.ObjectId(id) },
          {
            $set: {
              serviceName: serviceName,
              description: description,
              category: categoryId._id,
              amount: amount,
              isApproved: false,
            },
          },
        );
        const payload = { token: id };
        res.status(200).json({
          access_token: await this.jwtService.sign(payload),
          message: 'Success',
          id: id,
        });
      } else {
        return res.status(400).json({ message: 'Valid Documents Required' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async servicerDashboard(@Res() res: Response) {
    try {
      const servicesFind = await this.servicerModel.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryInfo',
          },
        },
        {
          $unwind: {
            path: '$categoryInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);
      return res.status(200).json({ servicesFind });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async servicerDetails(@Res() res: Response, id: string) {
    try {
      const servicesFind = await this.servicerModel.find({ _id: id });
      return res.status(200).json({ servicesFind });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async servicersApproval(@Res() res: Response) {
    try {
      const servicesFind = await this.servicerModel.find({});
      return res
        .status(200)
        .json({ message: 'Success', approvals: servicesFind });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async approveServicer(id: string, @Res() res: Response) {
    try {
      const servicesFind = await this.servicerModel.find(
        {},
        { isApproved: false },
      );
      return res
        .status(200)
        .json({ message: 'Success', approvals: servicesFind });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async sendMail(@Res() res: Response, id: string) {
    try {
      const findEmail = await this.servicerModel.findById({ _id: id });
      const otp = await otpGenerator.generate(4, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      this.mailerService.sendMail({
        to: `${findEmail['email']}`,
        from: process.env.DEV_MAIL,
        subject: 'Axel Services Email Verification',
        text: 'Axel Services',
        html: `<h1>Welcome User, Please enter the OTP to move Further! <b>${otp}</b> </h1>`,
      });
      return res.status(200).json({ message: 'Success', otp: otp });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async loadDashboard(@Res() res: Response, id: string) {
    try {
      await this.servicerModel.updateOne(
        { _id: id },
        { $set: { isVerified: true } },
      );
      const payload = { token: id };

      return res.status(200).json({
        access_token: await this.jwtService.sign(payload),
        message: 'Success',
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async categoriesList(@Res() res: Response) {
    try {
      const categories = await this.categoryModel.find({});
      return res
        .status(200)
        .json({ message: 'Success', categories: categories });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async listBookings(@Res() res: Response) {
    try {
      const listBookings = await this.bookingModel.aggregate([
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
        .status(200)
        .json({ message: 'Success', bookings: listBookings });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async approveBooking(@Res() res: Response, id: string) {
    try {
      const booked = await this.bookingModel.findById({ _id: id });
      if (booked['approvalStatus'] === 'Pending') {
        await this.bookingModel.updateOne(
          { _id: id },
          { $set: { approvalStatus: 'Approved' } },
        );
      } else {
        await this.bookingModel.updateOne(
          { _id: id },
          { $set: { approvalStatus: 'Cancelled' } },
        );
      }
      return res.status(201).json({ message: 'Success' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async logOut(@Res() res: Response) {
    try {
      return res.status(200).json({ message: 'Success' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async cancelBooking(
    @Res() res: Response,
    textArea: string,
    bookingId: string,
    userId: string,
  ) {
    try {
      await this.bookingModel.updateOne(
        { _id: bookingId },
        { $set: { approvalStatus: 'Cancelled' } },
      );
      await this.userModel.updateOne(
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
      return res.status(201).json({ message: 'Success' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async getRecentUsers(res: Response, req: Request) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this.jwtService.verify(token);
      const servicerId = decoded.token;
      const findConnection = await this.messagingModel
        .findOne({
          users: { $in: [servicerId] },
        })
        .populate('messages.sender')
        .populate('messages.receiver');

      const userSenderTypes = findConnection.messages
        .filter((message) => message.senderType === 'User')
        .map((message) => ({
          name: message.sender.name,
          id: message.sender._id,
        }));
      const uniqueUserSenderTypes = [
        ...new Set(userSenderTypes.map((obj) => JSON.stringify(obj))),
      ].map((str) => JSON.parse(str as string));
      return res.status(200).json({
        message: uniqueUserSenderTypes,
        servicerId: servicerId,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async getRecentChats(id: string, res: Response, req: Request) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this.jwtService.verify(token);
      const servicerId = decoded.token;
      const findConnection = await this.messagingModel
        .findOne({
          users: { $all: [servicerId, id] },
        })
        .populate('messages.sender')
        .populate('messages.receiver');
      if (findConnection) {
        return res.status(200).json({
          message: findConnection,
          servicerId: servicerId,
          id: findConnection._id,
        });
      } else {
        const newRoom = new this.messagingModel({
          users: [servicerId, id],
        });
        newRoom.save().then((data: any) => {
          return res
            .status(200)
            .json({ message: data, servicerId: servicerId, id: data._id });
        });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async dashboardReports(res: Response) {
    try {
      const Pending = await this.bookingModel.find({
        approvalStatus: 'Pending',
      });
      console.log(Pending,'this is pending in the backend');
      
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
