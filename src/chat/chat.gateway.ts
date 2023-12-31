import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import * as dotenv from 'dotenv';
import { ChatDto } from './dto/create-chat.dto';
dotenv.config();

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  constructor(private _chatService: ChatService) {}
  @SubscribeMessage('connection')
  async handleConnection(client: Socket) {
    if (!client) {
      return;
    }
  }
  @SubscribeMessage('disconnect')
  handleDisconnection(client: Socket, roomName: any) {
    client.leave(roomName.name);
  }
  @SubscribeMessage('join')
  async handleJoinEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomName: any,
  ) {
    client.join(roomName.Roomid);
    client.broadcast.to(roomName.Roomid).emit('member-joined');
  }
  @SubscribeMessage('new-message')
  async handleNewMessage(@MessageBody() data: ChatDto): Promise<void> {
    const newMessage = await this._chatService.newMessage(data);
    this.server.to(data.id).emit('new-message', newMessage);
  }
}
