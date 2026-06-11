import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
  ) {}

  /**
   * Ambil semua item di cart milik user tertentu
   */
  async getCart(userId: string) {
    return this.cartRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Tambah item ke cart
   * Jika produk sudah ada di cart → update quantity
   */
  async addItem(userId: string, dto: AddToCartDto) {
    // Cek apakah produk sudah ada di cart user ini
    const existing = await this.cartRepository.findOne({
      where: { userId, productId: dto.productId },
    });

    if (existing) {
      // Update quantity (tambah)
      existing.quantity += dto.quantity;
      return this.cartRepository.save(existing);
    }

    // Buat item baru
    const item = this.cartRepository.create({
      userId,
      productId: dto.productId,
      quantity: dto.quantity,
    });
    return this.cartRepository.save(item);
  }

  /**
   * Update quantity item di cart
   */
  async updateItem(userId: string, itemId: string, quantity: number) {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, userId },
    });
    if (!item) {
      throw new NotFoundException('Item cart tidak ditemukan');
    }
    item.quantity = quantity;
    return this.cartRepository.save(item);
  }

  /**
   * Hapus item dari cart
   */
  async removeItem(userId: string, itemId: string) {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, userId },
    });
    if (!item) {
      throw new NotFoundException('Item cart tidak ditemukan');
    }
    return this.cartRepository.remove(item);
  }

  /**
   * Kosongkan cart user (dipanggil setelah checkout)
   */
  async clearCart(userId: string) {
    const items = await this.cartRepository.find({ where: { userId } });
    return this.cartRepository.remove(items);
  }
}