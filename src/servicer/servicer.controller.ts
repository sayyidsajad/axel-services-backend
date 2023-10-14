/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UseInterceptors,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { ServicerService } from './servicer.service';
import {
  CreateServicerDto,
  LoginServicerDto,
  servicerProcedures,
} from './dto/create-servicer.dto';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('servicer')
export class ServicerController {
  constructor(private readonly servicerService: ServicerService) {}
  @Post('signup')
  async servicerRegister(
    @Body() createServicerDto: CreateServicerDto,
    @Res() res: Response,
  ) {
    try {
      return this.servicerService.servicerRegister(createServicerDto, res);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Servor Error') {
        return res.status(500).json({ message: message });
      } else if (error.message === 'Email has been already registered') {
        return res.status(400).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Post()
  async servicerLogin(
    @Body() loggedServicer: LoginServicerDto,
    @Res() res: Response,
  ) {
    try {
      return this.servicerService.servicerLogin(loggedServicer, res);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Servor Error') {
        return res.status(500).json({ message: message });
      } else if (error.message === 'Email has been already registered') {
        return res.status(400).json({ message: message });
      } else {
        return res.status(200).json({ message: message });
      }
    }
  }
  @Post('servicerProcedures')
  @UseInterceptors(FilesInterceptor('file'))
  async servicerProcedures(
    @Body() servicerProcedures: servicerProcedures,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Query('id') id: number,
    @Body() body: any,
  ) {
    try {
      return this.servicerService.servicerProcedures(
        servicerProcedures,
        res,
        file,
        id,
      );
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Server Error') {
        return res.status(500).json({ message: message });
      } else if (error.message === 'Valid Documents Required') {
        return res.status(400).json({ message: message });
      } else {
        return res.status(200).json({ message: message });
      }
    }
  }
  @Get('servicerList')
  async servicerDashboard(@Res() res: Response) {
    try {
      return this.servicerService.servicerDashboard(res);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Servor Error') {
        return res.status(500).json({ message: message });
      } else if (error.message === 'Email has been already registered') {
        return res.status(400).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('servicerDetails')
  async servicerDetails(@Res() res: Response, @Query('id') id: string) {
    try {
      return this.servicerService.servicerDetails(res, id);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Servor Error') {
        return res.status(500).json({ message: message });
      } else if (error.message === 'Email has been already registered') {
        return res.status(400).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('servicersApproval')
  async servicersApproval(@Res() res: Response) {
    try {
      return this.servicerService.servicersApproval(res);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Servor Error') {
        return res.status(500).json({ message: message });
      } else if (error.message === 'Email has been already registered') {
        return res.status(400).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('servicerOtpVerification')
  async sendMail(@Res() res: Response, @Query('id') id: string) {
    try {
      return this.servicerService.sendMail(res, id);
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
  @Post('servicerDashboard')
  async loadDashboard(@Res() res: Response, @Body('id') id: string) {
    try {
      return this.servicerService.loadDashboard(res, id);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Server Error') {
        return res.status(500).json({ message: message });
      } else {
        return res.status(200).json({ message: message });
      }
    }
  }
  @Get('categoriesList')
  async servicesList(@Res() res: Response) {
    try {
      return this.servicerService.categoriesList(res);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Servor Error') {
        return res.status(500).json({ message: message });
      } else if (error.message === 'Email has been already registered') {
        return res.status(400).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
}
