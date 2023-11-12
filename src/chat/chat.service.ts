import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatRepository } from 'src/repositories/base/chat.repository';

@Injectable()
export class ChatService {
  constructor(private _chatRepository: ChatRepository) {}
  async newMessage(data: any) {
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
