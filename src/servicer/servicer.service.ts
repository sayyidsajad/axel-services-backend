/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Inject,
  Injectable,
  Res,
  UploadedFile,
} from '@nestjs/common';
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
dotenv.config();

@Injectable()
export class ServicerService {
  constructor(
    @Inject('SERVICER_MODEL')
    private servicerModel: Model<Servicer>,
    @Inject('CATEGORY_MODEL')
    private categoryModel: Model<any>,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    private cloudinary: CloudinaryService,
  ) {}
  async servicerRegister(
    createServicerDto: CreateServicerDto,
    @Res() res: Response,
  ) {
    try {
      const { companyName, email, password, confirmPassword, phone } =
        createServicerDto;
      const createdServicer = await this.servicerModel.findOne({
        email: email,
      });
      if (!createdServicer) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const hashedConfirmPassword = await bcrypt.hash(confirmPassword, salt);
        const newServicer = new this.servicerModel({
          companyName: companyName,
          email: email,
          phone: phone,
          password: hashedPassword,
          confirmPassword: hashedConfirmPassword,
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
    id: number,
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
      const servicesFind = await this.servicerModel.find();
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
      const findId = await this.servicerModel.updateOne(
        { _id: id },
        { $set: { isVerified: true } },
      );
      return res.status(200).json({ message: 'Success' });
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
}
