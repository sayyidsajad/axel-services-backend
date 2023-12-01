import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateServicerDto,
  servicerProcedures,
} from './dto/create-servicer.dto';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { loggedUserDto } from 'src/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as otpGenerator from 'otp-generator';
import { MailerService } from '@nestjs-modules/mailer';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { ServicerRepository } from 'src/repositories/base/servicer.repository';
dotenv.config();

@Injectable()
export class ServicerService {
  constructor(
    private _jwtService: JwtService,
    private _servicerRepository: ServicerRepository,
    private readonly _mailerService: MailerService,
    private _cloudinary: CloudinaryService,
    private _configService: ConfigService,
  ) {}
  async servicerRegister(createServicerDto: CreateServicerDto, res: Response) {
    try {
      const { companyName, email, password, phone } = createServicerDto;
      const adminEmail = this._configService.get<string>('ADMIN_EMAIL');
      const createdServicer =
        await this._servicerRepository.servicerFindEmail(email);
      const createdUser = await this._servicerRepository.userFindEmail(email);
      if (adminEmail === email) {
        return res
          .status(HttpStatus.UNPROCESSABLE_ENTITY)
          .json({ message: 'Admin cannot be logged in as a servicer' });
      } else if (createdUser?.['email'] === email) {
        return res
          .status(HttpStatus.CONFLICT)
          .json({ message: 'Email has been already used by an user' });
      } else if (createdUser?.['phone'] === phone) {
        return res
          .status(HttpStatus.CONFLICT)
          .json({ message: 'Phone has been already by a servicer' });
      } else if (createdServicer?.['phone'] === phone) {
        return res
          .status(HttpStatus.CONFLICT)
          .json({ message: 'Phone has been already registered' });
      } else if (
        createdServicer?.['password'] !== createdServicer?.['confirmPassword']
      ) {
        return res
          .status(HttpStatus.NOT_ACCEPTABLE)
          .json({ message: 'Password and Confirm Password do not match' });
      }
      if (!createdServicer) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newServicer = await this._servicerRepository.createServicer(
          companyName,
          email,
          phone,
          hashedPassword,
        );
        const payload = { token: newServicer['_id'] };
        return res.status(HttpStatus.CREATED).json({
          access_token: await this._jwtService.sign(payload),
          message: 'Success',
          id: newServicer['_id'],
        });
      } else {
        return res
          .status(HttpStatus.UNPROCESSABLE_ENTITY)
          .json({ message: 'Email has been already registered' });
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
  async servicerLogin(loggedServicer: loggedUserDto, res: Response) {
    try {
      const { email, password } = loggedServicer;
      const searchEmail =
        await this._servicerRepository.servicerFindEmail(email);
      if (!searchEmail) {
        throw new HttpException(
          "Email hasn't registered",
          HttpStatus.BAD_REQUEST,
        );
      }
      const userPassword = await bcrypt.compare(
        password,
        searchEmail['password'],
      );
      if (!userPassword) {
        return res
          .status(HttpStatus.NOT_ACCEPTABLE)
          .json({ message: 'Incorrect Password' });
      } else if (searchEmail['isApproved'] !== true) {
        throw new HttpException(
          'Your email has not been Approved',
          HttpStatus.BAD_REQUEST,
        );
      }
      const payload = { token: searchEmail['_id'] };
      res.status(HttpStatus.OK).json({
        access_token: await this._jwtService.sign(payload),
        message: 'Successfully Logged In',
        isVerified: searchEmail['isVerified'],
        isApproved: searchEmail['isApproved'],
        altCode: searchEmail['altCode'],
        id: searchEmail['_id'],
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

  async servicerProcedures(
    data: servicerProcedures,
    res: Response,
    files: Array<Express.Multer.File>,
    id: string,
  ) {
    try {
      const { serviceName, description, amount, category, formattedAddress } =
        data;
      if (files) {
        const image = await this._cloudinary.uploadImage(files['img']);
        const images = await this._cloudinary.uploadImage(files['docs']);
        const categoryId =
          await this._servicerRepository.categoryFind(category);
        await this._servicerRepository.servicerProceduresUpdate(
          id,
          serviceName,
          description,
          categoryId['_id'],
          amount,
          formattedAddress,
          image,
          images,
        );
        const payload = { token: id };
        res.status(HttpStatus.ACCEPTED).json({
          access_token: await this._jwtService.sign(payload),
          message: 'Success',
          id: id,
        });
      } else {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Valid Documents Required' });
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
  async servicerDashboard(res: Response) {
    try {
      const servicesFind = await this._servicerRepository.servicerDashboard();
      return res.status(HttpStatus.OK).json({ servicesFind });
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
  async servicerDetails(res: Response, id: string) {
    try {
      const servicesFind = await this._servicerRepository.servicerDetails(id);
      return res.status(HttpStatus.OK).json({ servicesFind });
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
  async servicersApproval(res: Response) {
    try {
      const servicesFind = await this._servicerRepository.serviceFindAll();
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
  async approveServicer(res: Response) {
    try {
      const servicesFind = await this._servicerRepository.approveServicer();
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
  async sendMail(res: Response, id: string) {
    try {
      const findEmail = await this._servicerRepository.servicerFindId(id);
      const otp = await otpGenerator.generate(4, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      this._mailerService.sendMail({
        to: `${findEmail['email']}`,
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
                <p>Hello, ${findEmail['companyName'].toUpperCase()}</p>
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
      return res.status(HttpStatus.OK).json({ message: 'Success', otp: otp });
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
  async loadDashboard(res: Response, id: string) {
    try {
      await this._servicerRepository.loadDashboard(id);
      const payload = { token: id };
      return res.status(HttpStatus.ACCEPTED).json({
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
  async categoriesList(res: Response) {
    try {
      const categories = await this._servicerRepository.categoriesList();
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Success', categories: categories });
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
  async listBookings(req: Request, res: Response) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this._jwtService.verify(token);
      const servicerId = decoded.token;
      const listBookings = await this._servicerRepository.bookingsList(servicerId);
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
  async approveBooking(res: Response, id: string) {
    try {
      const booked = await this._servicerRepository.bookingFindId(id);
      if (booked['approvalStatus'] === 'Pending') {
        await this._servicerRepository.bookingApprovalStatus(id, 'Approved');
      } else {
        await this._servicerRepository.bookingApprovalStatus(id, 'Cancelled');
      }
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
  async cancelBooking(
    res: Response,
    textArea: string,
    bookingId: string,
    userId: string,
    status?: string,
  ) {
    try {
      if (status === 'Pending' || status === 'Service Completed') {
        await this._servicerRepository.bookingApprovalStatus(bookingId, status);
        return res.status(HttpStatus.ACCEPTED).json({ status });
      }
      await this._servicerRepository.bookingApprovalStatus(
        bookingId,
        'Cancelled',
      );
      await this._servicerRepository.cancelBooking(textArea, userId, bookingId);
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
  async getRecentUsers(res: Response, req: Request) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this._jwtService.verify(token);
      const servicerId = decoded.token;
      const findConnection =
        await this._servicerRepository.findConnection(servicerId);
      if (!findConnection) {
        return res.status(HttpStatus.OK).json({
          message: 'No users available.',
        });
      }
      const userSenderTypes = findConnection.messages
        .filter((message) => message.senderType === 'User')
        .map((message) => ({
          name: message.sender.name,
          id: message.sender._id,
        }));
      const uniqueUserSenderTypes = [
        ...new Set(userSenderTypes.map((obj) => JSON.stringify(obj))),
      ].map((str) => JSON.parse(str as string));
      return res.status(HttpStatus.OK).json({
        message: 'Sucess',
        uniqueUserSenderTypes,
        servicerId,
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
  async getRecentChats(id: string, res: Response, req: Request) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this._jwtService.verify(token);
      const servicerId = decoded.token;
      const findConnection = await this._servicerRepository.recentChats(
        servicerId,
        id,
      );
      if (findConnection) {
        return res.status(HttpStatus.OK).json({
          message: findConnection,
          servicerId: servicerId,
          id: findConnection._id,
        });
      } else {
        const newRoom = this._servicerRepository.createRoom(servicerId, id);
        newRoom.then((data: any) => {
          return res
            .status(HttpStatus.ACCEPTED)
            .json({ message: data, servicerId: servicerId, id: data._id });
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
  async dashboardReports(res: Response, req: Request) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this._jwtService.verify(token);
      const servicerId = decoded.token;
      const monthlyEarning =
        await this._servicerRepository.monthlyEarning(servicerId);
      const currentYearEarning =
        await this._servicerRepository.currentYearEarning(servicerId);
      const pending = await this._servicerRepository.bookingStatusCount(
        servicerId,
        'Pending',
      );
      const cancelled = await this._servicerRepository.bookingStatusCount(
        servicerId,
        'Cancelled',
      );
      const serviceCompleted =
        await this._servicerRepository.bookingStatusCount(
          servicerId,
          'Service Completed',
        );
      const currentSalesYear = new Date(new Date().getFullYear(), 0, 1);
      const sales = [];
      const salesByYear = await this._servicerRepository.salesByYear(
        servicerId,
        currentSalesYear,
      );
      for (let i = 1; i <= 12; i++) {
        let result = true;
        for (let j = 0; j < salesByYear['length']; j++) {
          result = false;
          if (salesByYear[j]._id == i) {
            sales.push(salesByYear[j]);
            break;
          } else {
            result = true;
          }
        }
        if (result) sales.push({ _id: i, total: 0, count: 0 });
      }
      const salesData = [];
      for (let i = 0; i < sales.length; i++) {
        salesData.push(sales[i].total);
      }
      return res.status(HttpStatus.OK).json({
        approvalStatus: {
          pending,
          cancelled,
          serviceCompleted,
        },
        salesData: salesData,
        monthlyEarning: monthlyEarning,
        currentYearEarning: currentYearEarning,
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
  async createService(
    req: Request,
    res: Response,
    data: any,
    file: Array<Express.Multer.File>,
  ) {
    try {
      const image = await this._cloudinary.uploadImage(file['image']);
      const { service, description, amount } = data;
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this._jwtService.verify(token);
      const servicerId = decoded.token;
      await this._servicerRepository.createService(
        servicerId,
        service,
        description,
        amount,
        image,
      );
      return res.status(HttpStatus.CREATED).json({ message: 'Created' });
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
  async additionalLists(req: Request, res: Response) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this._jwtService.verify(token);
      const servicerId = decoded.token;
      const additional =
        await this._servicerRepository.additionalServices(servicerId);
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
  async listUnlist(res: Response, id: string) {
    try {
      const additional = await this._servicerRepository.findAdditional(id);
      if (additional['list'] === true) {
        await this._servicerRepository.listUnlist(id, false);
        return res.status(HttpStatus.ACCEPTED).json({ message: 'Unlisted' });
      } else {
        await this._servicerRepository.listUnlist(id, true);
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
  async getMyDetails(res: Response, req: Request) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const decoded = await this._jwtService.verify(token);
      const servicerId = decoded.token;
      const details = await this._servicerRepository.servicerFindId(servicerId);
      return res.status(HttpStatus.ACCEPTED).json({ details });
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
  async updateService(
    res: Response,
    data: any,
    files: Array<Express.Multer.File>,
  ) {
    try {
      const { id, categoryName, description, amount } = data;
      const image = await this._cloudinary.uploadImage(files['image']);
      await this._servicerRepository.updateAdditionalServices(
        id,
        categoryName,
        description,
        amount,
        image,
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
}
