import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto, loggedUserDto } from './dto/create-user.dto';
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
import { TwilioService } from 'nestjs-twilio';
dotenv.config();

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_MODEL')
    private _userModel: Model<User>,
    @Inject('BOOKING_MODEL')
    private _bookingModel: Model<any>,
    @Inject('SERVICER_MODEL')
    private _servicerModel: Model<CreateServicerDto>,
    @Inject('MESSAGING_MODEL')
    private _messagingModel: Model<any>,
    private _configService: ConfigService,
    private _jwtService: JwtService,
    private readonly _mailerService: MailerService,
    private readonly _twilioService: TwilioService,
  ) {}
  async userRegister(
    createUserDto: CreateUserDto,
    res: Response,
  ): Promise<User> {
    try {
      const { name, email, phone, password } = createUserDto;
      const adminEmail = this._configService.get<string>('ADMIN_EMAIL');
      const registeredServicer = await this._servicerModel.findOne({
        email: email,
      });
      const registered = await this._userModel.findOne({ phone: phone });
      if (email === adminEmail) {
        throw new HttpException(
          'Admin cannot login as user',
          HttpStatus.BAD_REQUEST,
        );
      } else if (registeredServicer?.['email'] === email) {
        throw new HttpException(
          'This Email has been registered by a servicer',
          HttpStatus.BAD_REQUEST,
        );
      } else if (registeredServicer?.['phone'] === +phone) {
        throw new HttpException(
          'This phone has been already registered by a servicer',
          HttpStatus.CONFLICT,
        );
      } else if (registered?.['email'] === email) {
        throw new HttpException(
          'Email has been already registered',
          HttpStatus.CONFLICT,
        );
      } else if (registered?.['phone'] === +phone) {
        throw new HttpException(
          'Phone has been already registered',
          HttpStatus.CONFLICT,
        );
      } else if (registered?.['password'] !== registered?.['confirmPassword']) {
        throw new HttpException(
          'Password and Confirm Password do not match',
          HttpStatus.NOT_ACCEPTABLE,
        );
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
      const hashedPassword = await bcrypt.hash(password, salt);
      const createdUser = new this._userModel({
        name: name,
        email: email,
        phone: phone,
        password: hashedPassword,
      });
      const userDone = await createdUser.save();
      if (userDone) {
        const payload = { token: userDone._id, name: userDone['name'] };
        return res.status(HttpStatus.CREATED).json({
          access_token: await this._jwtService.sign(payload),
          message: 'success',
          email: createdUser['email'],
        });
      } else {
        throw new HttpException('Token not available', HttpStatus.UNAUTHORIZED);
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
  async userLogin(user: loggedUserDto, res: Response): Promise<User> {
    try {
      const userFind = await this._userModel.findOne({ email: user.email });
      if (!userFind) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const userPassword = await bcrypt.compare(
        user.password,
        userFind['password'],
      );
      if (!userPassword) {
        return res
          .status(HttpStatus.NOT_ACCEPTABLE)
          .json({ message: 'Password is incorrect' });
      } else if (userFind['isBlocked'] === true) {
        return res
          .status(HttpStatus.FORBIDDEN)
          .json({ message: 'User has been blocked by admin' });
      }
      if (userFind['isVerified'] !== true) {
        return res.status(HttpStatus.CONTINUE).json({
          message: 'User not verified, Please verify',
          verified: false,
          email: userFind['email'],
        });
      }
      const payload = { token: userFind._id };
      return res.status(HttpStatus.CREATED).json({
        access_token: await this._jwtService.sign(payload),
        message: 'Success',
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
  async sendMail(res: Response, email: string) {
    try {
      const findId = await this._userModel.findOne({ email: email });
      const otp = await otpGenerator.generate(4, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      this._mailerService.sendMail({
        to: `${email}`,
        from: process.env.DEV_MAIL,
        subject: 'Axel Services Email Verification',
        text: 'Axel Services',
        html: `<table style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <tr>
            <td style="text-align: center; background-color: #000; padding: 10px; color: #fff;">
                <h1>OTP Verification</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px;">
                <p>Hello, ${findId['name'].toUpperCase()}</p>
                <p>You are just one step away from accessing our platform. To ensure your security and access to our services, please verify your identity by entering the OTP (One-Time Password) provided below:</p>
                <p>OTP: <strong style="background-color: #000;color: #fff;">${otp}</strong></p>
                <p>Please use this OTP to complete the verification process and start hosting with us.</p>
                <p>If you did not request this verification, please ignore this email, and contact our support team immediately.</p>
                <p>Thank you for choosing our platform. We look forward to having you as part of our community.</p>
                <p>If you have any questions or need assistance, please feel free to contact our support team.</p>
                <p>Best regards,<br>Your Axel Services Team</p>
            </td>
        </tr>
        <tr>
            <td style="text-align: center; background-color: #000; padding: 10px; color: #fff;">
                <p>&copy; ${new Date().getFullYear()} Axel Services. All rights reserved.</p>
            </td>
        </tr>
    </table>
    `,
      });
      const payload = { token: findId._id };
      return res.status(HttpStatus.CREATED).json({
        message: 'Success',
        otp: otp,
        access_token: await this._jwtService.sign(payload),
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
  async loadHome(res: Response, email: string) {
    try {
      await this._userModel.updateOne(
        { email: email },
        { $set: { isVerified: true } },
      );
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
  async servicerList(res: Response) {
    try {
      const servicesFind = await this._servicerModel.aggregate([
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
      return res.status(HttpStatus.OK).json({ servicesFind: servicesFind });
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
  async logOut(res: Response) {
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
  async bookNow(
    req: Request,
    res: Response,
    id: string,
    date: Date,
    time: string,
    walletChecked?: number,
  ) {
    try {
      const updatedDate = moment(date).format('DD-MM-YYYY');
      const updateTime = moment(time).format('hh:mm A');
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = this._jwtService.verify(token);
      const userId = decoded.token;
      const lastBookingNum = await this._bookingModel
        .findOne({})
        .sort({ createdAt: -1 });
      const serviceAmount = await this._servicerModel.findOne({ _id: id });
      let lastValue = lastBookingNum?.['bookingId'].slice(
        2,
        lastBookingNum?.['bookingId'].length,
      );
      const reducedAmt = walletChecked
        ? serviceAmount['amount'] - walletChecked
        : serviceAmount['amount'];
      if (walletChecked) {
        await this._userModel.updateOne(
          { _id: userId },
          {
            $inc: { wallet: -walletChecked },
            $push: {
              walletHistory: {
                date: new Date(),
                amount: walletChecked,
                description: 'Deducted from Wallet',
              },
            },
          },
        );
      }
      const insertBooking = new this._bookingModel({
        date: updatedDate,
        time: updateTime,
        bookingId: `BK${lastValue ? ++lastValue : 1}`,
        user: userId,
        service: id,
        paymentStatus: 'Pending',
        total: reducedAmt,
      });
      const inserted = await insertBooking.save();
      return res
        .status(HttpStatus.CREATED)
        .json({ message: 'Success', inserted: inserted, reducedAmt });
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
  async bookingsList(res: Response) {
    try {
      const bookings = await this._bookingModel.aggregate([
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
      ]);
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Success', bookings: bookings });
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
  async cancel(req: Request, res: Response, id: string) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = this._jwtService.verify(token);
      const userId = decoded.token;
      await this._bookingModel.updateOne(
        { _id: id },
        { $set: { approvalStatus: 'Cancelled' } },
      );
      const bookedAmt = await this._bookingModel.findById({ _id: id });
      await this._userModel.updateOne(
        { _id: userId },
        {
          $inc: { wallet: bookedAmt['total'] },
          $push: {
            walletHistory: {
              date: new Date(),
              amount: bookedAmt['total'],
              description: 'Added to wallet on cancellation of service.',
            },
          },
        },
      );
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
  async userInbox(res: Response, req: Request) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = this._jwtService.verify(token);
      const userId = decoded.token;
      const result = await this._userModel.aggregate([
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
      const inboxData = result.map((user) => user.inbox);
      const serviceData = result.map(
        (user) => user.inbox.bookingDetails.service,
      );
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Success', inbox: inboxData, service: serviceData });
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
  async cancelAll(res: Response, req: Request) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = this._jwtService.verify(token);
      const userId = decoded.token;
      await this._userModel.updateOne({ _id: userId }, { $set: { inbox: [] } });
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
  async verifyPayment(res: Response, data: any) {
    try {
      const { razorpay_payment_id } = data.res;
      const { _id } = data.inserted.inserted;
      if (razorpay_payment_id) {
        await this._bookingModel.updateOne(
          { _id: _id },
          { $set: { paymentStatus: 'Success' } },
        );
        this._twilioService.client.calls.create({
          url: 'http://demo.twilio.com/docs/voice.xml',
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.MY_NUMBER,
        });
        return res.status(HttpStatus.OK).json({
          message: 'Payment success',
        });
      } else {
        await this._bookingModel.updateOne(
          { _id: _id },
          { $set: { paymentStatus: 'Failed' } },
        );
        throw new HttpException('Payment failed', HttpStatus.BAD_REQUEST);
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
  async userProfile(res: Response, req: Request) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this._jwtService.verify(token);
      const userId = decoded.token;
      const user = await this._userModel.findOne({ _id: userId });
      return res.status(HttpStatus.OK).json({ message: 'Success', user: user });
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
  async servicerDetails(req: Request, res: Response, id: string) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this._jwtService.verify(token);
      const userId = decoded.token;
      const servicesFind = await this._servicerModel.find({ _id: id });
      const wallet = await this._userModel.findById({ _id: userId });
      return res
        .status(HttpStatus.OK)
        .json({ servicesFind, wallet: wallet?.['wallet'] });
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
  async forgotPassword(res: Response, email: string) {
    try {
      const registeredEmail = await this._userModel.findOne({ email: email });
      if (registeredEmail) {
        const resetLink = `localhost:4200/resetPassword?id=${registeredEmail['_id']}`;
        this._mailerService.sendMail({
          to: `${email}`,
          from: process.env.DEV_MAIL,
          subject: 'Axel Services Email Verification',
          text: 'Axel Services',
          html: `<a>${resetLink}</a>`,
        });
        return res.status(HttpStatus.OK).json({ message: 'Success' });
      } else {
        throw new HttpException(
          'There is no email registered in this account',
          HttpStatus.NOT_FOUND,
        );
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
  async verifyConfirmPassword(
    res: Response,
    id: string,
    newPassword: string,
    newConfirmPassword: string,
  ) {
    try {
      if (newPassword !== newConfirmPassword) {
        return res.status(HttpStatus.NOT_ACCEPTABLE).json({
          message: 'New Password and Confirm New Password do not match',
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await this._userModel.updateOne(
        { _id: id },
        { $set: { password: hashedPassword } },
      );
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
  async getRecentChats(id: string, res: Response, req: Request) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this._jwtService.verify(token);
      const userId = decoded.token;
      const findConnection = await this._messagingModel
        .findOne({
          users: { $all: [userId, id] },
        })
        .populate('messages.sender')
        .populate('messages.receiver');
      if (findConnection) {
        return res
          .status(HttpStatus.OK)
          .json({ message: findConnection, userId: userId });
      } else {
        const newRoom = new this._messagingModel({
          users: [userId, id],
        });
        newRoom.save().then((data: any) => {
          return res
            .status(HttpStatus.CREATED)
            .json({ userId: userId, message: data });
        });
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
}
