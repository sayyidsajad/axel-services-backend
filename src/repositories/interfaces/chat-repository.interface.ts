import { ChatDto } from 'src/chat/dto/create-chat.dto';
import { ChatMessage } from 'src/chat/entities/chat.entity';

export interface IChatRepository {
  newMessage(data: ChatDto): Promise<any>;
  findMessage(data: string): Promise<ChatMessage>;
}
