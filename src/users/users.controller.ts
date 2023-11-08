/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  Query,
  Patch,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, loggedUserDto } from './dto/create-user.dto';
import { Response } from 'express';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('signup')
  @UsePipes(new ValidationPipe({ transform: true }))
  async userRegister(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    try {
      return this.usersService.userRegister(createUserDto, res);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async userLogin(@Body() user: loggedUserDto, @Res() res: Response) {
    try {
      return this.usersService.userLogin(user, res);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('otpVerification')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendMail(@Res() res: Response, @Query('email') email: string) {
    try {
      return this.usersService.sendMail(res, email);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Patch('home')
  @UsePipes(new ValidationPipe({ transform: true }))
  async loadHome(@Res() res: Response, @Body('email') email: string) {
    try {
      return this.usersService.loadHome(res, email);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('logOut')
  @UsePipes(new ValidationPipe({ transform: true }))
  async logOut(@Res() res: Response) {
    try {
      return this.usersService.logOut(res);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Post('bookNow')
  @UsePipes(new ValidationPipe({ transform: true }))
  async bookNow(
    @Req() req: Request,
    @Res() res: Response,
    @Body('id') id: string,
    @Body('date') date: Date,
    @Body('time') time: string,
    @Body('walletChecked') walletChecked: number,
  ) {
    try {
      return this.usersService.bookNow(req, res, id, date, time, walletChecked);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('bookingsList')
  @UsePipes(new ValidationPipe({ transform: true }))
  async bookingsList(@Res() res: Response) {
    try {
      return this.usersService.bookingsList(res);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Patch('cancelBooked')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancel(
    @Req() req: Request,
    @Res() res: Response,
    @Body('id') id: string,
    @Body('amount') amount: string,
  ) {
    try {
      return this.usersService.cancel(req, res, id, amount);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('servicerList')
  @UsePipes(new ValidationPipe({ transform: true }))
  async servicerList(@Req() req: Request, @Res() res: Response) {
    try {
      return this.usersService.servicerList(req, res);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('userInbox')
  @UsePipes(new ValidationPipe({ transform: true }))
  async userInbox(@Res() res: Response, @Req() req: Request) {
    try {
      return this.usersService.userInbox(res, req);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('clearAll')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancelAll(@Res() res: Response, @Req() req: Request) {
    try {
      return this.usersService.cancelAll(res, req);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('userProfile')
  @UsePipes(new ValidationPipe({ transform: true }))
  async userProfile(@Res() res: Response, @Req() req: Request) {
    try {
      return this.usersService.userProfile(res, req);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Post('verifyPayment')
  @UsePipes(new ValidationPipe({ transform: true }))
  async verifyPayment(@Res() res: Response, @Body() data: any) {
    try {
      return this.usersService.verifyPayment(res, data);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('servicerDetails')
  @UsePipes(new ValidationPipe({ transform: true }))
  async servicerDetails(
    @Req() req: Request,
    @Res() res: Response,
    @Query('id') id: string,
  ) {
    try {
      return this.usersService.servicerDetails(req, res, id);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Post('forgotPassword')
  @UsePipes(new ValidationPipe({ transform: true }))
  async forgotPassword(@Res() res: Response, @Body('email') email: string) {
    try {
      return this.usersService.forgotPassword(res, email);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Post('verifyConfirmPassword')
  @UsePipes(new ValidationPipe({ transform: true }))
  async verifyConfirmPassword(
    @Res() res: Response,
    @Body('newPassword') newPassword: string,
    @Body('newConfirmPassword') newConfirmPassword: string,
    @Query('id') id: string,
  ) {
    try {
      return this.usersService.verifyConfirmPassword(
        res,
        id,
        newPassword,
        newConfirmPassword,
      );
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('getRecentChats')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRecentChats(
    @Query('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      return this.usersService.getRecentChats(id, res, req);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
}
