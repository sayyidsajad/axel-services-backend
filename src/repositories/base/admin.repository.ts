import { Inject } from '@nestjs/common';
import { IAdminRepository } from '../interfaces/admin-repository.interface';
import mongoose, { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/admin/entities/admin-category.entity';
import { Servicer } from 'src/servicer/entities/servicer.entity';
import { BookingDto } from 'src/admin/dto/booking.dto';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { IBanner, IEarningsWithProfit } from './types/admin/admin-types';

export class AdminRepository implements IAdminRepository {
  constructor(
    @Inject('SERVICER_MODEL')
    private _servicerModel: Model<Servicer>,
    @Inject('USER_MODEL')
    private _userModel: Model<User>,
    @Inject('CATEGORY_MODEL')
    private _categoryModel: Model<Category>,
    @Inject('BOOKING_MODEL')
    private _bookingModel: Model<any>,
    @Inject('BANNER_MODEL')
    private _bannerModel: Model<any>,
  ) {}

  async servicerFindId(id: string): Promise<Servicer> {
    return await this._servicerModel.findById({ _id: id });
  }
  async servicerApproval(id: string, approval: boolean): Promise<void> {
    await this._servicerModel.updateOne(
      { _id: id },
      { $set: { isApproved: approval } },
    );
  }
  async altCode(id: string, otp: string): Promise<{ acknowledged: boolean }> {
    return await this._servicerModel.updateOne(
      { _id: id },
      { $set: { altCode: otp } },
    );
  }
  async servicerFindAll(): Promise<Servicer> {
    return await this._servicerModel.find({});
  }
  async usersFindAll(): Promise<User> {
    return await this._userModel.find({});
  }
  async userFindId(id: string): Promise<User> {
    return await this._userModel.findById({ _id: id });
  }
  async blockUpdate(id: string, block: boolean): Promise<void> {
    await this._userModel.updateOne(
      { _id: id },
      { $set: { isBlocked: block } },
    );
  }
  async createCategory(
    categoryName: string,
    description: string,
  ): Promise<void> {
    const newCategory = new this._categoryModel({
      categoryName: categoryName,
      description: description,
    });
    await newCategory.save();
  }
  async categoryFindAll(): Promise<Category> {
    return await this._categoryModel.find({});
  }
  async bookingFindAll(): Promise<BookingDto> {
    return await this._bookingModel.aggregate([
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
  }
  async categoryFind(id: string): Promise<Category> {
    return await this._categoryModel.find({ _id: id });
  }
  async bannerFind(id: string): Promise<Category> {
    return await this._bannerModel.find({ _id: id });
  }
  async categoryListUpdate(id: string, list: boolean): Promise<void> {
    await this._categoryModel.updateOne({ _id: id }, { $set: { list: list } });
  }
  async bannerListUnlist(id: string, list: boolean): Promise<void> {
    await this._bannerModel.updateOne({ _id: id }, { $set: { list: list } });
  }
  async cancelBooking(bookingId: string): Promise<void> {
    await this._bookingModel.updateOne(
      { _id: bookingId },
      { $set: { approvalStatus: 'Cancelled' } },
    );
  }
  async cancelReasonUpdate(
    userId: string,
    textArea: string,
    bookingId: string,
  ): Promise<void> {
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
  }
  async servicerBlock(id: string, block: boolean): Promise<void> {
    await this._servicerModel.updateOne(
      { _id: id },
      { $set: { isBlocked: block } },
    );
  }
  async categoryUpdate(id: string, categoryName: string, description: string) {
    await this._categoryModel.updateOne(
      { _id: id },
      { $set: { categoryName: categoryName, description: description } },
    );
  }
  async bookingStatusCount(status: string): Promise<BookingDto> {
    return await this._bookingModel.find({ approvalStatus: status }).count();
  }
  async currentMonthEarning(): Promise<BookingDto> {
    const result = await this._bookingModel.aggregate([
      {
        $match: {
          approvalStatus: 'Service Completed',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: { $toDate: '$timestamps' } },
            month: { $month: { $toDate: '$timestamps' } },
          },
          totalEarnings: { $sum: '$total' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);
    const monthlyEarningsWithProfit = result.map((entry) => {
      const year = entry._id.year;
      const month = entry._id.month;
      const totalEarnings = entry.totalEarnings;
      const profitValue = Math.round(totalEarnings * 0.05);
      const earningsWithProfit = {
        year,
        month,
        totalEarnings,
        profitValue,
      };
      return earningsWithProfit;
    });
    return monthlyEarningsWithProfit;
  }
  async createBanner(
    bannerName: string,
    description: string,
    image: (UploadApiResponse | UploadApiErrorResponse)[],
  ): Promise<void> {
    const newBanner = new this._bannerModel({
      bannerName: bannerName,
      description: description,
      images: image.map((image) => image.secure_url),
    });
    await newBanner.save();
  }
  async listBanners(): Promise<IBanner[]> {
    return await this._bannerModel.find({});
  }
  async currentYearEarning(): Promise<IEarningsWithProfit[]> {
    const result = await this._bookingModel.aggregate([
      {
        $match: {
          approvalStatus: 'Service Completed',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: { $toDate: '$createdAt' } },
            month: { $month: { $toDate: '$createdAt' } },
          },
          totalEarnings: { $sum: '$total' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);
    const monthlyEarningsWithProfit: IEarningsWithProfit[] = result.map(
      (entry) => {
        const year = entry._id.year;
        const month = entry._id.month;
        const totalEarnings = entry.totalEarnings;
        const profitValue = Math.round(totalEarnings * 0.05);
        const earningsWithProfit = {
          year,
          month,
          totalEarnings,
          profitValue,
        };
        return earningsWithProfit;
      },
    );
    return monthlyEarningsWithProfit;
  }
}
