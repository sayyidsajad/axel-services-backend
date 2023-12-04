import { Response } from 'express';
export interface IOpenAiService {
  createChatCompletion(message: string, res: Response): Promise<any>;
}
