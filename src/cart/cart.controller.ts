import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../common';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string };
}

@Controller('cart')
@UseGuards(JwtAuthGuard) // semua endpoint cart butuh login
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // GET /cart - lihat isi cart user yang login
  @Get()
  async getCart(@Req() req: RequestWithUser) {
    return this.cartService.getCart(req.user.id);
  }

  // POST /cart - tambah item ke cart
  @Post()
  async addItem(@Req() req: RequestWithUser, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(req.user.id, dto);
  }

  // PATCH /cart/:id - update quantity item
  @Patch(':id')
  async updateItem(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateItem(req.user.id, id, quantity);
  }

  // DELETE /cart/:id - hapus item dari cart
  @Delete(':id')
  async removeItem(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.id, id);
  }
}