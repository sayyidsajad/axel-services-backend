import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  data: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  servicerId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['User', 'Servicer'])
  senderType: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['User', 'Servicer'])
  receiverType: string;
}
