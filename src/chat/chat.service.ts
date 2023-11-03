import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Servicer } from 'src/servicer/entities/servicer.entity';

@Injectable()
export class ChatService {
  constructor(
    @Inject('SERVICER_MODEL')
    private servicerModel: Model<Servicer>,
    @Inject('MESSAGING_MODEL')
    private messagingModel: Model<any>,
  ) {}
  async newMessage(id: any, data: any) {
    return await this.messagingModel.updateOne(
      { connectionId: id },
      { message: data },
    );
  }
}
