import { Inject } from '@nestjs/common';
import { IAdminRepository } from '../interfaces/admin-repository.interface';
import mongoose, { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/admin/entities/admin-category.entity';
import { Servicer } from 'src/servicer/entities/servicer.entity';
import { BookingDto } from 'src/admin/dto/booking.dto';

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
  async altCode(id: string, otp: string): Promise<any> {
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
  async categoryListUpdate(id: string, list: boolean): Promise<void> {
    await this._categoryModel.updateOne({ _id: id }, { $set: { list: list } });
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
}
