import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../common';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string };
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /orders - checkout (customer)
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: RequestWithUser) {
    return this.ordersService.create(req.user.id);
  }

  // GET /orders/my - riwayat order user yang login
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMyOrders(@Req() req: RequestWithUser) {
    return this.ordersService.findMyOrders(req.user.id);
  }

  // GET /orders - semua order (admin only)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.ordersService.findAll();
  }

  // PATCH /orders/:id/status - update status order (admin only)
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto.status);
  }
}