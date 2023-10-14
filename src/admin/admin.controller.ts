/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Post, Body, Res, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Response } from 'express';
import { CategoryAdminDto } from './dto/admin-category.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Post()
  async adminLogin(
    @Body() createAdminDto: CreateAdminDto,
    @Res() res: Response,
  ) {
    try {
      return this.adminService.adminLogin(createAdminDto, res);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Servor Error') {
        return res.status(500).json({ message: message });
      } else if (error.message === 'Successfully logged in') {
        return res.status(400).json({ message: message });
      } else if (error.message === 'Admin password is incorrect') {
        return res.status(400).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Post('approveServicer')
  async approveServicer(@Body() id: string, @Res() res: Response) {
    try {
      return this.adminService.approveServicer(id['id'], res);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Servor Error') {
        return res.status(500).json({ message: message });
      } else if (error.message === 'Successfully logged in') {
        return res.status(400).json({ message: message });
      } else if (error.message === 'Admin password is incorrect') {
        return res.status(400).json({ message: message });
      } else {
        return res.status(201).json({ message: message });
      }
    }
  }
  @Post('cancelApproval')
  async cancelServicer(@Body() id: string, @Res() res: Response) {
    try {
      return this.adminService.cancelApproval(id['id'], res);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Servor Error') {
        return res.status(500).json({ message: message });
      } else if (error.message === 'Successfully logged in') {
        return res.status(400).json({ message: message });
      } else if (error.message === 'Admin password is incorrect') {
        return res.status(400).json({ message: message });
      } else {
        return res.status(201).json({ message: message });
      }
    }
  }
  @Get('userMgt')
  async userMgt(@Body() id: string, @Res() res: Response) {
    try {
      return this.adminService.userMgt(res);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Servor Error') {
        return res.status(500).json({ message: message });
      } else {
        return res.status(200).json({ message: message });
      }
    }
  }
  @Post('blockUnblockUser')
  async blockUser(@Body('id') id: string, @Res() res: Response) {
    try {
      return this.adminService.blockUnblockUser(res, id);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Servor Error') {
        return res.status(500).json({ message: message });
      } else {
        return res.status(200).json({ message: message });
      }
    }
  }
  @Post('addCategory')
  async addCategory(@Body() category: CategoryAdminDto, @Res() res: Response) {
    try {
      return this.adminService.addCategory(res, category);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Servor Error') {
        return res.status(500).json({ message: message });
      } else {
        return res.status(200).json({ message: message });
      }
    }
  }
  @Get('listCategories')
  async listCategory(@Res() res: Response) {
    try {
      return this.adminService.listCategory(res);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Servor Error') {
        return res.status(500).json({ message: message });
      } else {
        return res.status(200).json({ message: message });
      }
    }
  }
  @Get('listBookings')
  async listBookings(@Res() res: Response) {
    try {
      return this.adminService.listBookings(res);
    } catch (error) {
      const { message } = error;
      if (error.message === 'Internal Servor Error') {
        return res.status(500).json({ message: message });
      } else {
        return res.status(200).json({ message: message });
      }
    }
  }
}
