import { User } from 'src/users/entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { Inject } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { CreateServicerDto } from 'src/servicer/dto/create-servicer.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Servicer } from 'src/servicer/entities/servicer.entity';
import { BookingDto } from 'src/admin/dto/booking.dto';

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
  ) {}
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
  async userEmailUpdateOne(email: string): Promise<User> {
    return await this._userModel.updateOne(
      { email: email },
      { $set: { isVerified: true } },
    );
  }
  async servicerList(): Promise<Servicer> {
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
    updateTime: string,
    lastValue: string,
    userId: string,
    id: string,
    reducedAmt: number,
  ): Promise<BookingDto> {
    const insertBooking = new this._bookingModel({
      date: updatedDate,
      time: updateTime,
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
  async cancelBooking(id: string): Promise<BookingDto> {
    return await this._bookingModel.updateOne(
      { _id: id },
      { $set: { approvalStatus: 'Cancelled' } },
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
}
