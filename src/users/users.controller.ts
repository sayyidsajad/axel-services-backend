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
} from '@nestjs/common';
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
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Post()
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
  @Get('home')
  async loadHome(@Res() res: Response) {
    try {
      return this.usersService.loadHome(res);
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
  async bookNow(
    @Req() req: Request,
    @Res() res: Response,
    @Body('id') id: string,
  ) {
    try {
      return this.usersService.bookNow(req, res, id);
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
  async cancel(@Res() res: Response, @Body('id') id: string) {
    try {
      return this.usersService.cancel(res, id);
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
  async servicerList(@Res() res: Response) {
    try {
      return this.usersService.servicerList(res);
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
}
