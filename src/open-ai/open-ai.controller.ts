import { Controller, Post, Body, Res } from '@nestjs/common';
import { OpenAiService } from './open-ai.service';
import { Response } from 'express';

@Controller('open-ai')
export class OpenAiController {
  constructor(private _openAiService: OpenAiService) {}

  @Post('/chat')
  async chat(
    @Body('message') message: string,
    @Res() res: Response,
  ): Promise<any> {
    const reply = await this._openAiService.createChatCompletion(message, res);
    return { reply };
  }
}
