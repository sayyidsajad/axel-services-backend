import { PartialType } from '@nestjs/swagger';
import { CreateOpenAiDto } from './create-open-ai.dto';

export class UpdateOpenAiDto extends PartialType(CreateOpenAiDto) {}
