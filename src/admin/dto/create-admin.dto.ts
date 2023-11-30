import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
export class CreateBanner {
  @IsNotEmpty()
  @IsString()
  bannerName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  images: Express.Multer.File[];
}
