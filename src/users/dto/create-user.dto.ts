export class CreateUserDto {
  _id: string;
  name: string;
  email: string;
  phone: number;
  password: string;
  confirmPassword: string;
}
export class loggedUserDto {
  email: string;
  password: string;
}
export class bookingDto {}
