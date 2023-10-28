import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateServicerDto {
  @IsNotEmpty()
  companyName: string;
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
  @IsNumber()
  @IsNotEmpty()
  phone: number;
  @IsString()
  @IsNotEmpty()
  password: string;
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
export class LoginServicerDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
export class servicerProcedures {
  @IsString()
  @IsNotEmpty()
  serviceName: string;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsNumber()
  @IsNotEmpty()
  amount: number;
  @IsString()
  @IsNotEmpty()
  category: string;
  @IsString()
  @IsNotEmpty()
  file: Express.Multer.File;
}
