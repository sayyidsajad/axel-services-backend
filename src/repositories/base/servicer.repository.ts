import { User } from 'src/users/entities/user.entity';
import { Inject } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { IServicerRepository } from '../interfaces/servicer-repostitory.interface';
import { Servicer } from 'src/servicer/entities/servicer.entity';
import { Category } from 'src/admin/entities/admin-category.entity';
import { BookingDto } from 'src/admin/dto/booking.dto';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export class ServicerRepository implements IServicerRepository {
  constructor(
    @Inject('SERVICER_MODEL')
    private _servicerModel: Model<Servicer>,
    @Inject('CATEGORY_MODEL')
    private _categoryModel: Model<any>,
    @Inject('BOOKING_MODEL')
    private _bookingModel: Model<any>,
    @Inject('USER_MODEL')
    private _userModel: Model<any>,
    @Inject('MESSAGING_MODEL')
    private _messagingModel: Model<any>,
  ) {}
  async servicerDashboard(): Promise<Servicer> {
    return await this._servicerModel.aggregate([
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
  }
  async servicerFindEmail(email: string): Promise<Servicer> {
    return await this._servicerModel.findOne({ email: email });
  }
  async userFindEmail(email: string): Promise<User> {
    return await this._userModel.findOne({ email: email });
  }
  async createServicer(
    companyName: string,
    email: string,
    phone: number,
    hashedPassword: string,
  ): Promise<Servicer> {
    const newServicer = new this._servicerModel({
      companyName: companyName,
      email: email,
      phone: phone,
      password: hashedPassword,
    });
    return await newServicer.save();
  }
  async categoryFind(category: string): Promise<Category> {
    return await this._categoryModel.findOne({
      categoryName: category,
    });
  }
  async servicerProceduresUpdate(
    id: string,
    serviceName: string,
    description: string,
    category: string,
    amount: string,
    address: string,
    image: (UploadApiResponse | UploadApiErrorResponse)[],
    images: (UploadApiResponse | UploadApiErrorResponse)[],
  ): Promise<void> {
    await this._servicerModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          serviceName: serviceName,
          description: description,
          category: category,
          amount: amount,
          address: address,
          image: image[0].secure_url,
        },
      },
    );
    if (images) {
      for (const f of images) {
        await this._servicerModel.updateOne(
          { _id: new mongoose.Types.ObjectId(id) },
          { $push: { images: f.secure_url } },
        );
      }
    }
  }
  async servicerDetails(id: string): Promise<Servicer> {
    return await this._servicerModel.find({ _id: id });
  }
  async serviceFindAll(): Promise<Servicer> {
    return await this._servicerModel.find({});
  }
  async approveServicer(): Promise<Servicer> {
    return await this._servicerModel.find({}, { isApproved: false });
  }
  async servicerFindId(id: string): Promise<Servicer> {
    return await this._servicerModel.findById({ _id: id });
  }
  async loadDashboard(id: string): Promise<void> {
    await this._servicerModel.updateOne(
      { _id: id },
      { $set: { isVerified: true } },
    );
  }
  async categoriesList(): Promise<Category> {
    return await this._categoryModel.find({});
  }
  async bookingsList(): Promise<BookingDto> {
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
  async bookingApprovalStatus(id: string, status: string): Promise<void> {
    await this._bookingModel.updateOne(
      { _id: id },
      { $set: { approvalStatus: status } },
    );
  }
  async cancelBooking(
    textArea: string,
    userId: string,
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
  async findConnection(servicerId: string): Promise<any> {
    return await this._messagingModel
      .findOne({
        users: { $in: [servicerId] },
      })
      .populate('messages.sender')
      .populate('messages.receiver');
  }
  async recentChats(servicerId: string, id: string): Promise<any> {
    return await this._messagingModel
      .findOne({
        users: { $all: [servicerId, id] },
      })
      .populate('messages.sender')
      .populate('messages.receiver');
  }
  createRoom(servicerId: string, id: string): Promise<any> {
    const newRoom = new this._messagingModel({
      users: [servicerId, id],
    });
    return newRoom.save();
  }
  async bookingStatusCount(
    servicerId: string,
    status: string,
  ): Promise<BookingDto> {
    return await this._bookingModel
      .find({ service: servicerId, approvalStatus: status })
      .count();
  }
  async salesByYear(
    servicerId: string,
    currentSalesYear: Date,
  ): Promise<BookingDto> {
    return await this._bookingModel.aggregate([
      {
        $match: {
          service: new mongoose.Types.ObjectId(servicerId),
          createdAt: { $gte: currentSalesYear },
          approvalStatus: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%m', date: '$createdAt' } },
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
  bookingFindId(id: string): Promise<BookingDto> {
    return this._bookingModel.findById({ _id: id });
  }
}
