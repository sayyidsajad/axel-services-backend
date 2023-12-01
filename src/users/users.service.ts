import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  SocialUser,
  loggedUserDto,
} from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as otpGenerator from 'otp-generator';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from 'nestjs-twilio';
import { UserRepository } from 'src/repositories/base/user.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as moment from 'moment';
dotenv.config();

@Injectable()
export class UsersService {
  constructor(
    private _configService: ConfigService,
    private _jwtService: JwtService,
    private _userRepository: UserRepository,
    private readonly _mailerService: MailerService,
    private readonly _twilioService: TwilioService,
    private _cloudinary: CloudinaryService,
  ) {}
  async userRegister(
    createUserDto: CreateUserDto,
    res: Response,
  ): Promise<User> {
    try {
      const { email, phone } = createUserDto;
      const adminEmail = this._configService.get<string>('ADMIN_EMAIL');
      const registeredServicer =
        await this._userRepository.servicerEmailFindOne(email);
      const registered = await this._userRepository.userPhoneFindOne(phone);
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
      const userDone = await this._userRepository.createUser(createUserDto);
      if (userDone) {
        const payload = { token: userDone['_id'], name: userDone['name'] };
        return res.status(HttpStatus.CREATED).json({
          access_token: await this._jwtService.sign(payload),
          message: 'success',
          id: userDone['_id'],
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
      const userFind = await this._userRepository.userEmailFindOne(user.email);
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
        return res.status(HttpStatus.OK).json({
          message: 'User not verified, Please verify',
          verified: false,
          id: userFind['_id'],
        });
      }
      const payload = { token: userFind['_id'] };
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
  async googleLogin(socialUser: SocialUser, res: Response): Promise<User> {
    try {
      const userFind = await this._userRepository.userEmailFindOne(
        socialUser.email,
      );
      if (!userFind) {
        throw new HttpException(
          'Please Register in order to login with google',
          HttpStatus.NOT_FOUND,
        );
      }
      const payload = { token: userFind['_id'] };
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
  async sendMail(res: Response, id: string) {
    try {
      const findId = await this._userRepository.userFindId(id);
      const otp = await otpGenerator.generate(4, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      this._mailerService.sendMail({
        to: `${findId['email']}`,
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
      const payload = { token: findId['_id'] };
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
  async loadHome(res: Response, id: string) {
    try {
      await this._userRepository.userEmailUpdateOne(id);
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
  async servicerList(res: Response, page: number, filters: any) {
    try {
      const perPage = 6;
      const currPage = Number(page) || 1;
      const skip = perPage * (currPage - 1);
      const servicesFind = await this._userRepository.servicerList(
        skip,
        perPage,
        filters,
      );
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
  async bookNow(
    req: Request,
    res: Response,
    id: string,
    date: string,
    time: string,
    walletChecked?: number,
  ) {
    try {
      const inputDate = moment(date);
      const formattedDate =
        inputDate.format('ddd MMM DD YYYY HH:mm:ss [GMT]Z') +
        ' (India Standard Time)';
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = this._jwtService.verify(token);
      const userId = decoded.token;
      const lastBookingNum = await this._userRepository.lastBookingFindOne();
      const serviceAmount = await this._userRepository.servicerFindOneId(id);
      let lastValue = lastBookingNum?.['bookingId'].slice(
        2,
        lastBookingNum?.['bookingId'].length,
      );
      const reducedAmt = walletChecked
        ? serviceAmount['amount'] - walletChecked
        : serviceAmount['amount'];
      if (walletChecked) {
        if (walletChecked > serviceAmount['amount']) {
          walletChecked = serviceAmount['amount'];
        }
        await this._userRepository.userWalletChecked(userId, walletChecked);
      }
      const inserted = await this._userRepository.createBooking(
        formattedDate,
        time,
        `BK${lastValue ? ++lastValue : 1}`,
        userId,
        id,
        reducedAmt,
      );
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
      const bookings = await this._userRepository.listBookings();
      return res.status(HttpStatus.OK).json({ bookings });
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
      await this._userRepository.cancelBooking(id);
      const bookedAmt = await this._userRepository.bookingFindId(id);
      await this._userRepository.cancelBookingUpdateOne(
        userId,
        bookedAmt['total'],
      );
      return res
        .status(HttpStatus.CREATED)
        .json({ message: 'Successfully Cancelled' });
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
      const result = await this._userRepository.userInbox(userId);
      const inboxData = result.map((user) => user.inbox);
      const serviceData = result.map(
        (user) => user.inbox.bookingDetails.service,
      );
      return res
        .status(HttpStatus.OK)
        .json({ inbox: inboxData, service: serviceData });
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
      await this._userRepository.cancelAll(userId);
      return res.status(HttpStatus.CREATED);
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
        await this._userRepository.paymentSuccess(_id);
        this._twilioService.client.calls.create({
          url: 'http://demo.twilio.com/docs/voice.xml',
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.MY_NUMBER,
        });
        return res.status(HttpStatus.OK).json({
          message: 'Payment success',
        });
      } else {
        await this._userRepository.paymentFailed(_id);
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
      const user = await this._userRepository.userFindId(userId);
      return res.status(HttpStatus.OK).json({ user });
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
      const servicesFind = await this._userRepository.servicerFindOneId(id);
      const wallet = await this._userRepository.userFindId(userId);
      return res
        .status(HttpStatus.OK)
        .json({ servicesFind: servicesFind, wallet: wallet?.['wallet'] });
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
      const registeredEmail =
        await this._userRepository.userEmailFindOne(email);
      if (registeredEmail) {
        const resetLink = `localhost:4200/resetPassword?id=${registeredEmail['_id']}`;
        this._mailerService.sendMail({
          to: `${email}`,
          from: process.env.DEV_MAIL,
          subject: 'Axel Services Email Verification',
          text: 'Axel Services',
          html: `<a>${resetLink}</a>`,
        });
        return res.status(HttpStatus.OK);
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
      await this._userRepository.verifyConfirmPassword(id, hashedPassword);
      return res.status(HttpStatus.CREATED);
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
      const findConnection = await this._userRepository.findConnection(
        userId,
        id,
      );
      if (findConnection) {
        return res
          .status(HttpStatus.OK)
          .json({ message: findConnection, userId: userId });
      } else {
        const newRoom = this._userRepository.createRoom(userId, id);
        newRoom.then((data: any) => {
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
  async userEnquiry(res: Response, data: any) {
    try {
      const { firstName, lastName, email, message } = data;
      await this._userRepository.userEnquiry(
        firstName,
        lastName,
        email,
        message,
      );
      return res.status(HttpStatus.ACCEPTED);
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
  async review(res: Response, data: any) {
    try {
      const { servicerId, userId, message } = data;
      await this._userRepository.review(servicerId, userId, message);
      return res.status(HttpStatus.ACCEPTED);
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
  async reviewsList(id: string, res: Response) {
    try {
      const reviews = await this._userRepository.reviewsList(id);
      return res.status(HttpStatus.ACCEPTED).json({ reviews });
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
  async listBanners(res: Response) {
    try {
      const banners = await this._userRepository.listBanners();
      return res.status(HttpStatus.OK).json({ banners });
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
  async additionalLists(res: Response, id: string) {
    try {
      const additional = await this._userRepository.additionalServices(id);
      return res.status(HttpStatus.OK).json({ additional });
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
  async profilePicture(
    req: Request,
    res: Response,
    files: Array<Express.Multer.File>,
  ) {
    try {
      const image = await this._cloudinary.uploadImage(files['img']);
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this._jwtService.verify(token);
      const userId = decoded.token;
      await this._userRepository.profilePicture(userId, image);
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
  async filterDates(req: Request, res: Response, id: string) {
    try {
      const filterDates = await this._userRepository.filterDates(id);
      return res.status(HttpStatus.ACCEPTED).json({ filterDates });
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
  async filterTimes(req: Request, res: Response, id: string, date: string) {
    try {
      const originalDate = new Date(date);
      const filterTimes = await this._userRepository.filterTimes(
        id,
        originalDate,
      );
      return res.status(HttpStatus.ACCEPTED).json({ filterTimes });
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
  async categoriesList(res: Response) {
    try {
      const categories = await this._userRepository.categoriesList();
      return res.status(HttpStatus.ACCEPTED).json({ categories });
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
  async findSearched(
    res: Response,
    search?: string,
    categ?: string,
    date?: string,
  ) {
    try {
      const findSearched = await this._userRepository.findSearched(
        search,
        categ,
        date,
      );
      if (findSearched.length > 0) {
        return res.status(HttpStatus.ACCEPTED).json({ findSearched });
      }
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'There is no Servicer on the specified filters' });
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
  async editProfile(req: Request, res: Response, name: string, phone: number) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this._jwtService.verify(token);
      const userId = decoded.token;
      await this._userRepository.editProfile(userId, name, phone);
      return res
        .status(HttpStatus.CREATED)
        .json({ message: 'Updated Successfully' });
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
  async updatePassword(
    req: Request,
    res: Response,
    currentPassword: string,
    password: string,
  ) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this._jwtService.verify(token);
      const userId = decoded.token;
      const checkPassword = this._userRepository.userFindId(userId);
      const matchingPass = bcrypt.compare(
        currentPassword,
        checkPassword['password'],
      );
      if (!matchingPass) {
        return res
          .status(HttpStatus.NON_AUTHORITATIVE_INFORMATION)
          .json({ message: "Current Password doesn't match" });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await this._userRepository.updatePassword(userId, hashedPassword);
      }
      return res
        .status(HttpStatus.CREATED)
        .json({ message: 'Updated Successfully' });
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
