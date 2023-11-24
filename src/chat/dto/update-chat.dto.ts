import { PartialType } from '@nestjs/mapped-types';
import { ChatDto } from './create-chat.dto';

export class UpdateChatDto extends PartialType(ChatDto) {}
