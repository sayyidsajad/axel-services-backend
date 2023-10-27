/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Inject, Injectable, Req, Res } from '@nestjs/common';
import { CreateUserDto, bookingDto, loggedUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Response } from 'express';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as otpGenerator from 'otp-generator';
import * as dotenv from 'dotenv';
import { CreateServicerDto } from 'src/servicer/dto/create-servicer.dto';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
dotenv.config();

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
    @Inject('BOOKING_MODEL')
    private bookingModel: Model<bookingDto>,
    @Inject('SERVICER_MODEL')
    private servicerModel: Model<CreateServicerDto>,
    private configService: ConfigService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService
  ) { }
  async userRegister(createUserDto: CreateUserDto, @Res() res: Response): Promise<User> {
    try {
      const { name, email, phone, password, confirmPassword } = createUserDto
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      const registeredServicer = await this.servicerModel.findOne({ email: email })
      const registered = await this.userModel.findOne({ phone: phone })
      if (email === adminEmail) {
        return res.status(400).json({ message: 'Admin cannot login as user' })
      } else if (registeredServicer?.['email'] === email) {
        return res.status(400).json({ message: 'This Email has been registered by a servicer' })
      } else if (registeredServicer?.['phone'] === +phone) {
        return res.status(400).json({ message: 'This phone has been already registered by a servicer' })
      } else if (registered?.['email'] === email) {
        return res.status(400).json({ message: 'Email has been already registered' })
      } else if (registered?.['phone'] === +phone) {
        return res.status(400).json({ message: 'Phone has been already registered' })
      }else if(registered?.['password'] !== registered?.['confirmPassword']){
        return res.status(400).json({ message: 'Password and Confirm Password do not match' })
      }
      // if (userFind['provider'] === 'GOOGLE') {
      //   const createdUser = new this.userModel({
      //     name: name,
      //     email: email,
      //     phone: phone,
      //   });
      //   return await createdUser.save();
      // }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt)
      const createdUser = new this.userModel({
        name: name,
        email: email,
        phone: phone,
        password: hashedPassword,
      });
      const userDone = await createdUser.save();
      if (userDone) {
        const payload = { token: userDone._id, name: userDone['name'] }
        return res.status(201).json({ access_token: await this.jwtService.sign(payload), message: 'success', email: createdUser['email'] })
      } else {
        return res.status(400).json({ message: 'Token not available' })
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async userLogin(user: loggedUserDto, @Res() res: Response): Promise<User> {
    try {
      const userFind = await this.userModel.findOne({ email: user.email })
      if (!userFind) {
        return res.status(400).json({ message: 'User not found' })
      }
      const userPassword = await bcrypt.compare(user.password, userFind['password'])
      if (!userPassword) {
        return res.status(400).json({ message: 'Password is incorrect' });
      } else if (userFind['isBlocked'] === true) {
        return res.status(400).json({ message: 'User has been blocked by admin' });
      }
      const payload = { token: userFind._id }
      return res.status(200).json({ access_token: await this.jwtService.sign(payload), message: "Success" })
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async sendMail(@Res() res: Response, email: string) {
    try {
      const findId = await this.userModel.findOne({ email: email })
      const otp = await otpGenerator.generate(4, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
      this.mailerService.sendMail({
        to: `${email}`,
        from: process.env.DEV_MAIL,
        subject: 'Axel Services Email Verification',
        text: 'Axel Services',
        html: `<h1>Welcome User, Please enter the OTP to move Further! <b>${otp}</b> </h1>`
      })
      const payload = { token: findId._id }
      return res.status(200).json({ message: 'Success', otp: otp, access_token: await this.jwtService.sign(payload) })
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async loadHome(@Res() res: Response) {
    try {
      return res.status(200).json({ message: 'Success' })
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async servicerList(req: Request, @Res() res: Response) {
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
      return res.status(200).json({ servicesFind: servicesFind });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async logOut(@Res() res: Response) {
    try {
      return res.status(200).json({ message: 'Success' })
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async bookNow(@Req() req: Request, @Res() res: Response, id: string, date: Date, time: string, walletChecked?: number) {
    try {      
      const updatedDate = moment(date).format('DD-MM-YYYY');
      const updateTime = moment(time).format('hh:mm A');      
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token);
      const userId = decoded.token;
      const lastBookingNum = await this.bookingModel.findOne({}).sort({ createdAt: -1 })
      const serviceAmount = await this.servicerModel.findOne({ _id: id })
      let lastValue = lastBookingNum?.['bookingId'].slice(2, lastBookingNum?.['bookingId'].length)
      const reducedAmt = walletChecked ? (serviceAmount['amount'] - walletChecked) : serviceAmount['amount'];
      if (walletChecked) {
        await this.userModel.updateOne({ _id: userId }, { $inc: { wallet: -walletChecked }, $push: { walletHistory: { date: new Date(), amount: walletChecked, description: 'Deducted from Wallet' } } })
      }
      const insertBooking = new this.bookingModel({
        date: updatedDate,
        time: updateTime,
        bookingId: `BK${lastValue ? ++lastValue : 1}`,
        user: userId,
        service: id,
        paymentStatus: 'Pending',
        total: reducedAmt
      })
      const inserted = await insertBooking.save()
      return res.status(200).json({ message: 'Success', inserted: inserted, reducedAmt })
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async bookingsList(@Res() res: Response) {
    try {
      const bookings = await this.bookingModel.aggregate([
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
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      return res.status(200).json({ message: 'Success', bookings: bookings })
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async cancel(req: Request, @Res() res: Response, id: string, amount: string) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token);
      const userId = decoded.token;
      await this.bookingModel.updateOne({ _id: id }, { $set: { approvalStatus: 'Cancelled' } })
      const bookedAmt = await this.bookingModel.findById({ _id: id })
      await this.userModel.updateOne({ _id: userId }, { $inc: { wallet: bookedAmt['total'] }, $push: { walletHistory: { date: new Date(), amount: bookedAmt['total'], description: 'Added to wallet on cancellation of service.' } } })
      return res.status(201).json({ message: 'Success' })
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async userInbox(@Res() res: Response, req: Request) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token);
      const userId = decoded.token;
      const result = await this.userModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        {
          $unwind: '$inbox',
        },
        {
          $lookup: {
            from: 'bookings',
            localField: 'inbox.bookingId',
            foreignField: '_id',
            as: 'inbox.bookingDetails',
          },
        },
        {
          $unwind: '$inbox.bookingDetails',
        },
        {
          $lookup: {
            from: 'servicers',
            localField: 'inbox.bookingDetails.service',
            foreignField: '_id',
            as: 'inbox.bookingDetails.service',
          },
        },
        {
          $unwind: '$inbox.bookingDetails.service',
        },
      ]);
      const inboxData = result.map(user => user.inbox);
      const serviceData = result.map(user => user.inbox.bookingDetails.service);
      return res.status(200).json({ message: 'Success', inbox: inboxData, service: serviceData })
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async cancelAll(@Res() res: Response, @Req() req: Request) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token);
      const userId = decoded.token;
      await this.userModel.updateOne({ _id: userId }, { $set: { inbox: [] } })
      return res.status(200).json({ message: 'Success' })
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async verifyPayment(@Res() res: Response, @Body() data: any) {
    try {
      const { razorpay_payment_id } = data.res
      const { _id } = data.inserted.inserted
      if (razorpay_payment_id) {
        await this.bookingModel.updateOne(
          { _id: _id },
          { $set: { paymentStatus: "Success" } }
        );
        return res.status(200).json({
          message: "Payment success",
        });
      } else {
        await this.bookingModel.updateOne(
          { _id: _id },
          { $set: { paymentStatus: "Failed" } }
        );
        return res.status(400).json({
          message: "Payment failed",
        });
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  async userProfile(@Res() res: Response, req: Request) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this.jwtService.verify(token);
      const userId = decoded.token;
      const user = await this.userModel.findOne({ _id: userId })
      return res.status(200).json({ message: 'Success', user: user })
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async servicerDetails(req: Request, @Res() res: Response, id: string) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this.jwtService.verify(token);
      const userId = decoded.token;
      const servicesFind = await this.servicerModel.find({ _id: id })
      const wallet = await this.userModel.findById({ _id: userId })
      return res.status(200).json({ servicesFind, wallet: wallet['wallet'] });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}