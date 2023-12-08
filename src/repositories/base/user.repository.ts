import { User } from 'src/users/entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { Inject } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { CreateServicerDto } from 'src/servicer/dto/create-servicer.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Servicer } from 'src/servicer/entities/servicer.entity';
import { BookingDto } from 'src/admin/dto/booking.dto';
import { IBanner } from './types/admin/admin-types';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as moment from 'moment-timezone';

export class UserRepository implements IUserRepository {
  constructor(
    @Inject('USER_MODEL')
    private _userModel: Model<User>,
    @Inject('SERVICER_MODEL')
    private _servicerModel: Model<CreateServicerDto>,
    @Inject('BOOKING_MODEL')
    private _bookingModel: Model<any>,
    @Inject('MESSAGING_MODEL')
    private _messagingModel: Model<any>,
    @Inject('ENQUIRY_MODEL')
    private _enquiryModel: Model<any>,
    @Inject('REVIEW_MODEL')
    private _reviewModel: Model<any>,
    @Inject('BANNER_MODEL')
    private _bannerModel: Model<any>,
    @Inject('ADDITIONAL_SERVICES_MODEL')
    private _additionalServices: Model<any>,
    @Inject('CATEGORY_MODEL')
    private _categoryModel: Model<any>,
  ) {}
  async findAllUsers(): Promise<any[]> {
    const users = await this._userModel.aggregate([
      {
        $project: {
          _id: 0,
          email: 1,
        },
      },
    ]);
    return users.map((user) => user.email);
  }
  async servicerEmailFindOne(email: string): Promise<User> {
    return await this._servicerModel.findOne({ email });
  }
  async userPhoneFindOne(phone: number): Promise<User> {
    return await this._userModel.findOne({ phone });
  }
  async createUser(user: CreateUserDto): Promise<User> {
    const { name, email, phone, password } = user;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const createdUser = new this._userModel({
      name: name,
      email: email,
      phone: phone,
      password: hashedPassword,
    });
    return await createdUser.save();
  }
  async userEmailFindOne(email: string): Promise<User> {
    return await this._userModel.findOne({ email });
  }
  async userEmailUpdateOne(id: string): Promise<User> {
    return await this._userModel.updateOne(
      { _id: id },
      { $set: { isVerified: true } },
    );
  }
  async servicerList(skip: number, limit: number, filters: any): Promise<any> {
    const query: any = {};
    if (filters.category) {
      query.$match = { 'categoryInfo.categoryName': filters.category };
    }
    if (filters.company) {
      if (query.$match) {
        query.$match['serviceName'] = filters.company;
      } else {
        query.$match = { serviceName: filters.company };
      }
    }
    const price = +filters.price;
    const serviceList = await this._servicerModel.aggregate([
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
      ...(filters.category || filters.company ? [query] : []),
      {
        $sort: {
          amount: price || 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    let count = await this._servicerModel.countDocuments();
    if (filters.category) count = serviceList.length;

    const totalPage = Math.ceil(count / limit);
    return { totalPage, serviceList };
  }
  async lastBookingFindOne(): Promise<BookingDto> {
    return await this._bookingModel.findOne({}).sort({ createdAt: -1 });
  }
  async servicerFindOneId(id: string): Promise<Servicer> {
    return await this._servicerModel.findOne({ _id: id });
  }
  async userWalletChecked(
    userId: string,
    walletChecked: number,
  ): Promise<User> {
    return await this._userModel.updateOne(
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
  async createBooking(
    updatedDate: string,
    time: string,
    lastValue: string,
    userId: string,
    id: string,
    reducedAmt: number,
  ): Promise<BookingDto> {
    const insertBooking = new this._bookingModel({
      date: updatedDate,
      time: time,
      bookingId: lastValue,
      user: userId,
      service: id,
      paymentStatus: 'Pending',
      total: reducedAmt,
    });
    return insertBooking.save();
  }
  async listBookings(): Promise<BookingDto> {
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
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
  }
  async cancelBooking(id: string, textArea: string): Promise<BookingDto> {
    return await this._bookingModel.updateOne(
      { _id: id },
      { $set: { approvalStatus: 'Cancelled', cancelReason: textArea } },
    );
  }
  async bookingFindId(id: string): Promise<BookingDto> {
    return await this._bookingModel.findById({ _id: id });
  }
  async cancelBookingUpdateOne(
    userId: string,
    total: number,
  ): Promise<BookingDto> {
    return await this._userModel.updateOne(
      { _id: userId },
      {
        $inc: { wallet: total },
        $push: {
          walletHistory: {
            date: new Date(),
            amount: total,
            description: 'Added to wallet on cancellation of service.',
          },
        },
      },
    );
  }
  async userInbox(userId: string): Promise<any> {
    return await this._userModel.aggregate([
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
  }
  async cancelAll(userId: string): Promise<User> {
    return this._userModel.updateOne({ _id: userId }, { $set: { inbox: [] } });
  }
  async paymentSuccess(_id: string) {
    await this._bookingModel.updateOne(
      { _id: _id },
      { $set: { paymentStatus: 'Success' } },
    );
  }
  async paymentFailed(_id: string): Promise<void> {
    await this._bookingModel.updateOne(
      { _id: _id },
      { $set: { paymentStatus: 'Failed' } },
    );
  }
  async userFindId(userId: string): Promise<User> {
    return await this._userModel.findOne({ _id: userId });
  }
  async verifyConfirmPassword(
    id: string,
    hashedPassword: string,
  ): Promise<void> {
    await this._userModel.updateOne(
      { _id: id },
      { $set: { password: hashedPassword } },
    );
  }
  async findConnection(userId: string, id: string): Promise<any> {
    return await this._messagingModel
      .findOne({
        users: { $all: [userId, id] },
      })
      .populate('messages.sender')
      .populate('messages.receiver');
  }
  async createRoom(userId: string, id: string): Promise<any> {
    const newRoom = new this._messagingModel({
      users: [userId, id],
    });
    return newRoom.save();
  }
  async userEnquiry(
    firstName: string,
    lastName: string,
    email: string,
    message: string,
  ): Promise<void> {
    const enquiry = new this._enquiryModel({
      firstName: firstName,
      lastName: lastName,
      email: email,
      message: message,
    });
    await enquiry.save();
  }
  async review(
    servicerId: string,
    userId: string,
    message: string,
  ): Promise<void> {
    const review = new this._reviewModel({
      servicer: new mongoose.Types.ObjectId(servicerId),
      user: new mongoose.Types.ObjectId(userId),
      review: message,
    });
    await review.save();
  }
  async reviewsList(servicerId: string): Promise<any> {
    return await this._reviewModel
      .find({ servicer: new mongoose.Types.ObjectId(servicerId) })
      .populate('user');
  }
  async listBanners(): Promise<IBanner[]> {
    return await this._bannerModel.find({}, { images: 1, _id: 0 });
  }
  async additionalServices(id: string): Promise<any> {
    return await this._additionalServices.find({ servicerId: id });
  }
  async profilePicture(
    id: string,
    image: (UploadApiResponse | UploadApiErrorResponse)[],
  ): Promise<void> {
    await this._userModel.updateOne(
      { _id: id },
      { $set: { image: image[0].secure_url } },
    );
  }
  async filterDates(id: string): Promise<any> {
    const filteredBookings = await this._bookingModel
      .find({ service: id })
      .select('createdAt')
      .populate('service');
    const dates = filteredBookings.map((booking) => booking.createdAt);
    return dates;
  }
  async filterTimes(id: string, date: any): Promise<any> {
    const selectedDate = new Date(date);
    const inputDate = moment(selectedDate);
    const formattedDate =
      inputDate.format('ddd MMM DD YYYY HH:mm:ss [GMT]Z') +
      ' (India Standard Time)';
    const filteredBookings = await this._bookingModel
      .find({
        service: id,
        date: formattedDate,
      })
      .select('time')
      .populate('service');
    return filteredBookings.map((item) => item.time);
  }
  async categoriesList(): Promise<any> {
    const result = await this._categoryModel.aggregate([
      {
        $project: {
          _id: 0,
          categoryName: 1,
        },
      },
    ]);
    return result.map((item) => item.categoryName);
  }
  async findSearched(
    search?: string,
    categ?: string,
    date?: string,
  ): Promise<any> {
    const regex = new RegExp(search, 'i');
    const data = await this._servicerModel.aggregate([
      {
        $match: {
          address: { $regex: regex },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      {
        $match: {
          'category.categoryName': categ,
        },
      },
    ]);
    return data;
  }
  async editProfile(
    userId: string,
    name: string,
    phone: number,
  ): Promise<void> {
    await this._userModel.updateOne(
      { _id: userId },
      { $set: { name: name, phone: phone } },
    );
  }
  async updatePassword(id: string, password: string): Promise<void> {
    await this._userModel.updateOne({ _id: id }, { $set: { password } });
  }

  async viewDetails(id: string): Promise<any> {
    return await this._bookingModel.findById({ _id: id }).populate('service');
  }
  async clearOne(userId: string, inboxId: string): Promise<any> {
    const result = await this._userModel.updateOne(
      { _id: userId },
      { $pull: { inbox: { _id: new mongoose.Types.ObjectId(inboxId) } } },
    );

    console.log('Updated User:', result);
  }
}
