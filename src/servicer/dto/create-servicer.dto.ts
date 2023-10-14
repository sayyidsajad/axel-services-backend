export class CreateServicerDto {
  companyName: string;
  email: string;
  phone: number;
  password: string;
  confirmPassword: string;
  address: object;
}
export class LoginServicerDto {
  email: string;
  password: string;
}
export class servicerProcedures {
  serviceName: string;
  description: string;
  amount: number;
  category: string;
  files: Express.Multer.File;
}
