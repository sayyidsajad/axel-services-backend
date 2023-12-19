import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAdminDto, CreateBanner } from './dto/create-admin.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as otpGenerator from 'otp-generator';
import { CategoryAdminDto } from './dto/admin-category.dto';
import * as dotenv from 'dotenv';
import { AdminRepository } from 'src/repositories/base/admin.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { IAdminService } from 'src/repositories/impl/admin.service.impl';
dotenv.config();

@Injectable()
export class AdminService implements IAdminService {
  constructor(
    private _configService: ConfigService,
    private _jwtService: JwtService,
    private _adminRepository: AdminRepository,
    private _cloudinary: CloudinaryService,
    private readonly _mailerService: MailerService,
  ) {}
  async adminLogin(createAdminDto: CreateAdminDto, res: Response) {
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
  async approveServicer(id: string, res: Response) {
    try {
      const findApproved = await this._adminRepository.servicerFindId(id);
      if (findApproved['isApproved'] === true) {
        await this._adminRepository.servicerApproval(id, false);
        return res
          .status(HttpStatus.ACCEPTED)
          .json({ message: 'Not Approved' });
      }
      await this._adminRepository.servicerApproval(id, true);
      const servicerEmail = await this._adminRepository.servicerFindId(id);
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
        const altCode = await this._adminRepository.altCode(id, otp);
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
  async servicersApproval(res: Response) {
    try {
      const servicesFind = await this._adminRepository.servicerFindAll();
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
  async cancelApproval(id: string, res: Response) {
    try {
      const servicesApproved = await this._adminRepository.servicerApproval(
        id,
        false,
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
  async userMgt(res: Response) {
    try {
      const users = await this._adminRepository.usersFindAll();
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
  async blockUnblockUser(res: Response, id: string) {
    try {
      const findBlock = await this._adminRepository.userFindId(id);
      if (findBlock['isBlocked'] === true) {
        await this._adminRepository.blockUpdate(id, false);
        return res.status(HttpStatus.ACCEPTED).json({ message: 'Unblocked' });
      }
      await this._adminRepository.blockUpdate(id, true);
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
      await this._adminRepository.createCategory(categoryName, description);
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
  async listCategory(res: Response) {
    try {
      const listCategories = await this._adminRepository.categoryFindAll();
      return res.status(HttpStatus.OK).json({ categories: listCategories });
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
  async listBookings(res: Response) {
    try {
      const listBookings = await this._adminRepository.bookingFindAll();
      return res.status(HttpStatus.OK).json({ bookings: listBookings });
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
      const listCheck = await this._adminRepository.categoryFind(id);
      if (listCheck[0]['list'] === true) {
        await this._adminRepository.categoryListUpdate(id, false);
        return res.status(HttpStatus.ACCEPTED).json({ message: 'Unlisted' });
      } else {
        await this._adminRepository.categoryListUpdate(id, true);
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
  async bannerListUnlist(res: Response, id: string) {
    try {
      const listCheck = await this._adminRepository.bannerFind(id);
      if (listCheck[0]['list'] === true) {
        await this._adminRepository.bannerListUnlist(id, false);
        return res.status(HttpStatus.ACCEPTED).json({ message: 'Unlisted' });
      } else {
        await this._adminRepository.bannerListUnlist(id, true);
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
    res: Response,
    textArea: string,
    bookingId: string,
    userId: string,
  ) {
    try {
      await this._adminRepository.cancelBooking(bookingId);
      await this._adminRepository.cancelReasonUpdate(
        userId,
        textArea,
        bookingId,
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
  async listServices(res: Response) {
    try {
      const listServices = await this._adminRepository.servicerFindAll();
      return res.status(HttpStatus.OK).json({ services: listServices });
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
  async blockServicer(res: Response, id: string) {
    try {
      const findServicer = await this._adminRepository.servicerFindId(id);
      if (findServicer['isBlocked']) {
        await this._adminRepository.servicerBlock(id, false);
        return res.status(HttpStatus.ACCEPTED).json({ message: 'Unblocked' });
      } else {
        await this._adminRepository.servicerBlock(id, true);
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
    res: Response,
    id: string,
    categoryName: string,
    description: string,
  ) {
    try {
      await this._adminRepository.categoryUpdate(id, categoryName, description);
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
      const currentMonthEarnings =
        await this._adminRepository.currentMonthEarning();
      const currentYearEarning =
        await this._adminRepository.currentYearEarning();
      const pending = await this._adminRepository.bookingStatusCount('Pending');
      const cancelled =
        await this._adminRepository.bookingStatusCount('Cancelled');
      const serviceCompleted =
        await this._adminRepository.bookingStatusCount('Service Completed');
      return res.status(HttpStatus.OK).json({
        approvalStatus: { pending, cancelled, serviceCompleted },
        currentMonthEarnings: currentMonthEarnings,
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
  async createBanner(
    res: Response,
    banner: CreateBanner,
    images: Array<Express.Multer.File>,
  ) {
    try {
      const { bannerName, description } = banner;
      const image = await this._cloudinary.uploadImage(images['images']);
      await this._adminRepository.createBanner(bannerName, description, image);
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
  async listBanners(res: Response) {
    try {
      const banners = await this._adminRepository.listBanners();
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
}
