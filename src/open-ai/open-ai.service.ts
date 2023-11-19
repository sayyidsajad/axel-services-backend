import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private readonly openai: OpenAI;
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  async createChatCompletion(message: string, res: Response): Promise<any> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: message },
        ],
      });
      const reply = completion['choices'][0].message.content;
      return res.status(HttpStatus.ACCEPTED).json({ reply });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Internal Server Error',
        });
      }
    }
  }
}
