import { ObjectId } from 'mongoose';

export class Chat {
  name: string;
  text: string;
}
export interface ChatMessage {
  text: string;
  sender: ObjectId;
  receiver: ObjectId;
  senderType: 'User' | 'Servicer';
  receiverType: 'User' | 'Servicer';
  time: Date;
  _id: ObjectId;
}
