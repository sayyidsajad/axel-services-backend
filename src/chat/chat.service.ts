import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    @Inject('MESSAGING_MODEL')
    private messagingModel: Model<any>,
  ) {}
  async newMessage(data: any) {
    try {
      await this.messagingModel.updateOne(
        { _id: data.id },
        {
          $push: {
            messages: {
              text: data.data,
              sender: data.userId,
              time: new Date(),
              receiver: data.servicerId,
              senderType: data.senderType,
              receiverType: data.receiverType,
            },
          },
        },
      );
      const newMessage = await this.messagingModel
        .findOne({ _id: data.id })
        .populate('messages.sender')
        .populate('messages.receiver');
      return newMessage;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
