/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Post, Body, Res, Req, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, loggedUserDto } from './dto/create-user.dto';
import { Response } from 'express';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async userRegister(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    try {
      return this.usersService.userRegister(createUserDto, res);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Server Error') {
        return res.status(500).json({ message: message });
      } else if (error.message === 'Token not available') {
        return res.status(400).json({ message: message });
      } else if (error.message === 'Email has been already registered') {
        return res.status(400).json({ message: message });
      } else if (error.message === 'Phone has been already registered') {
        return res.status(400).json({ message: message });
      } else{
        return res.status(200).json({ message: message });
      }
    }
  }
  @Post()
  async userLogin(@Body() user: loggedUserDto, @Res() res: Response) {
    try {
      return this.usersService.userLogin(user, res);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Server Error') {
        return res.status(500).json({ message: message });
      } else if (error.message === 'Password is incorrect') {
        return res.status(400).json({ message: message });
      } else if (error.message === 'User has been blocked by admin') {
        return res.status(400).json({ message: message });
      } else {
        return res.status(200).json({ message: message });
      }
    }
  }
  @Get('otpVerification')
  async sendMail(@Res() res: Response, @Query('email') email: string) {
    try {
      return this.usersService.sendMail(res, email);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Server Error') {
        return res.status(500).json({ message: message });
      } else if (error.message === 'Invalid OTP') {
        return res.status(400).json({ message: message });
      } else {
        return res.status(200).json({ message: message });
      }
    }
  }
  @Get('home')
  async loadHome(@Res() res: Response) {
    try {
      return this.usersService.loadHome(res);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Server Error') {
        return res.status(500).json({ message: message });
      } else {
        return res.status(200).json({ message: message });
      }
    }
  }
  @Post('bookNow')
  async bookNow(@Res() res: Response, @Body('id') id: string) {
    try {
      return this.usersService.bookNow(res, id);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Server Error') {
        return res.status(500).json({ message: message });
      } else {
        return res.status(200).json({ message: message });
      }
    }
  }
}
