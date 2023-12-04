import { ChatDto } from 'src/chat/dto/create-chat.dto';
export interface IChatService {
  newMessage(data: ChatDto): Promise<any>;
}
