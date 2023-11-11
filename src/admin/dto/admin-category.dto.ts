import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CategoryAdminDto {
  @IsOptional()
  userid: string;
  @IsString()
  @IsNotEmpty()
  categoryName: string;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsOptional()
  @IsBoolean()
  list: boolean;
}
