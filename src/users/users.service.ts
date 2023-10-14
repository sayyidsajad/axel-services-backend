/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Inject, Injectable, Res } from '@nestjs/common';
import { CreateUserDto, bookingDto, loggedUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Response } from 'express';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as otpGenerator from 'otp-generator';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
    @Inject('BOOKING_MODEL')
    private bookingModel: Model<bookingDto>,
    private jwtService: JwtService,
    private readonly mailerService: MailerService
  ) { }
  async userRegister(createUserDto: CreateUserDto, @Res() res: Response): Promise<User> {
    try {
      const { name, email, phone, password, confirmPassword } = createUserDto
      const registered = await this.userModel.findOne({ phone: phone })
      if (registered?.['email'] === email) {
        return res.status(400).json({ message: 'Email has been already registered' })
      } else if (registered?.['phone'] === +phone) {
        return res.status(400).json({ message: 'Phone has been already registered' })
      }
      // if (userFind['provider'] === 'GOOGLE') {
      //   const createdUser = new this.userModel({
      //     name: name,
      //     email: email,
      //     phone: phone,
      //   });
      //   return await createdUser.save();
      // }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt)
      const hashedConfirmPassword = await bcrypt.hash(confirmPassword, salt)
      const createdUser = new this.userModel({
        name: name,
        email: email,
        phone: phone,
        password: hashedPassword,
        confirmPassword: hashedConfirmPassword,
      });
      const userDone = await createdUser.save();
      if (userDone) {
        const payload = { token: userDone._id, name: userDone['name'] }
        return res.status(200).json({ access_token: await this.jwtService.sign(payload), message: 'success', email: createdUser['email'] })
      } else {
        return res.status(400).json({ message: 'Token not available' })
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async userLogin(user: loggedUserDto, @Res() res: Response): Promise<User> {
    try {
      const userFind = await this.userModel.findOne({ email: user.email })
      if (!userFind) {
        return res.status(400).json({ message: 'User not found' })
      }
      const userPassword = await bcrypt.compare(user.password, userFind['password'])
      if (!userPassword) {
        return res.status(400).json({ message: 'Password is incorrect' });
      } else if (userFind['isBlocked'] === true) {
        return res.status(400).json({ message: 'User has been blocked by admin' });
      }
      const payload = { token: userFind._id }
      return res.status(200).json({ access_token: await this.jwtService.sign(payload), message: "Success" })
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async sendMail(@Res() res: Response, email: string) {
    try {
      const findId = await this.userModel.findOne({email:email})
      const otp = await otpGenerator.generate(4, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
      this.mailerService.sendMail({
        to: `${email}`,
        from: process.env.DEV_MAIL,
        subject: 'Axel Services Email Verification',
        text: 'Axel Services',
        html: `<h1>Welcome User, Please enter the OTP to move Further! <b>${otp}</b> </h1>`
      })
      const payload = { token: findId._id }
      return res.status(200).json({ message: 'Success', otp: otp,access_token: await this.jwtService.sign(payload)})
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async loadHome(@Res() res: Response) {
    try {
      return res.status(200).json({ message: 'Success' })
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
  async bookNow(@Res() res: Response, id: string) {
    try {
      const insertBooking = new this.bookingModel({
        service: id,
        user: id,
      })
      await insertBooking.save()
      return res.status(200).json({ message: 'Success' })
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
}
