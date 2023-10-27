import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Patch,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Response } from 'express';
import { CategoryAdminDto } from './dto/admin-category.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminLogin(
    @Body() createAdminDto: CreateAdminDto,
    @Res() res: Response,
  ) {
    try {
      return this.adminService.adminLogin(createAdminDto, res);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Post('approveServicer')
  @UsePipes(new ValidationPipe({ transform: true }))
  async approveServicer(@Body() id: string, @Res() res: Response) {
    try {
      return this.adminService.approveServicer(id['id'], res);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Post('cancelApproval')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancelServicer(@Body() id: string, @Res() res: Response) {
    try {
      return this.adminService.cancelApproval(id['id'], res);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('userMgt')
  @UsePipes(new ValidationPipe({ transform: true }))
  async userMgt(@Res() res: Response) {
    try {
      return this.adminService.userMgt(res);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Post('blockUnblockUser')
  @UsePipes(new ValidationPipe({ transform: true }))
  async blockUser(@Body('id') id: string, @Res() res: Response) {
    try {
      return this.adminService.blockUnblockUser(res, id);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Post('addCategory')
  @UsePipes(new ValidationPipe({ transform: true }))
  async addCategory(@Body() category: CategoryAdminDto, @Res() res: Response) {
    try {
      return this.adminService.addCategory(res, category);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('listCategories')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listCategory(@Res() res: Response) {
    try {
      return this.adminService.listCategory(res);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('listBookings')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listBookings(@Res() res: Response) {
    try {
      return this.adminService.listBookings(res);
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
      return this.adminService.logOut(res);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Patch('listUnlist')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listUnlist(@Res() res: Response, @Body('id') id: string) {
    try {
      return this.adminService.listUnlist(res, id);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('servicersApproval')
  @UsePipes(new ValidationPipe({ transform: true }))
  async servicersApproval(@Res() res: Response) {
    try {
      return this.adminService.servicersApproval(res);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Post('cancelBooking')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancelBooking(
    @Res() res: Response,
    @Body('textArea') textArea: string,
    @Body('bookingId') bookingId: string,
    @Body('userId') userId: string,
  ) {
    try {
      return this.adminService.cancelBooking(res, textArea, bookingId, userId);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Get('listServices')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listServices(@Res() res: Response) {
    try {
      return this.adminService.listServices(res);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Post('blockServicer')
  @UsePipes(new ValidationPipe({ transform: true }))
  async blockServicer(@Res() res: Response, @Body('id') id: string) {
    try {
      return this.adminService.blockServicer(res, id);
    } catch (error) {
      const { message } = error;
      if (res.status(500)) {
        return res.status(500).json({ message: message });
      } else {
        return res.status(400).json({ message: message });
      }
    }
  }
  @Patch('updateCategory')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCategory(
    @Res() res: Response,
    @Body('id') id: string,
    @Body('categoryName') categoryName: string,
    @Body('description') description: string,
  ) {
    try {
      return this.adminService.updateCategory(
        res,
        id,
        categoryName,
        description,
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
}
