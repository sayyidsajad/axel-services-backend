import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatRepository } from 'src/repositories/base/chat.repository';
import { ChatDto } from './dto/create-chat.dto';
import { IChatService } from 'src/repositories/impl/chat.service.impl';

@Injectable()
export class ChatService implements IChatService {
  constructor(private _chatRepository: ChatRepository) {}
  async newMessage(data: ChatDto) {
    try {
      await this._chatRepository.newMessage(data);
      const newMessage = await this._chatRepository.findMessage(data.id);
      return newMessage;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
