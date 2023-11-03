import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { messagingsProviders } from './chat.providers';
import { servicerProviders } from 'src/servicer/servicer.providers';
import { usersProviders } from 'src/users/users.providers';
import { DatabaseModule } from 'src/config/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    ChatGateway,
    ChatService,
    ...messagingsProviders,
    ...usersProviders,
    ...servicerProviders,
  ],
})
export class ChatModule {}
