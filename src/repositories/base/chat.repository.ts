import { IChatRepository } from '../interfaces/chat-repository.interface';
import { Model } from 'mongoose';
import { Inject } from '@nestjs/common';
import { ChatDto } from 'src/chat/dto/create-chat.dto';

export class ChatRepository implements IChatRepository {
  constructor(
    @Inject('MESSAGING_MODEL')
    private _messagingModel: Model<any>,
  ) {}
  async newMessage(data: ChatDto): Promise<any> {
    await this._messagingModel.updateOne(
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
  }
  async findMessage(id: string): Promise<any> {
    return await this._messagingModel
      .findOne({ _id: id })
      .populate('messages.sender')
      .populate('messages.receiver');
  }
}
