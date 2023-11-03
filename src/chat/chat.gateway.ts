import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly chatService: ChatService) {}
  @SubscribeMessage('connection')
  async handleConnection(client: Socket) {
    if (!client) {
      return;
    }
    const { id } = client.handshake.query;
    client.broadcast.to(id).emit('member-joined', { name: id });
  }
  @SubscribeMessage('disconnect')
  handleDisconnection(client: Socket, roomName: any) {
    client.leave(roomName.name);
  }
  @SubscribeMessage('join')
  handleJoinEvent(client: Socket, roomName: any) {
    client.join(roomName.name);
  }
  @SubscribeMessage('new-message')
  async handleNewMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    await this.chatService.newMessage(data.data, data.id);
    client.to(data.id).emit('new-messge', data.data);
  }
}
