export interface IChatRepository {
  newMessage(data: object): Promise<any>;
  findMessage(data: string): Promise<any>;
}
