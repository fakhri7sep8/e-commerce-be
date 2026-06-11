import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly cartService: CartService,
  ) {}

  /**
   * Checkout: ambil cart → hitung total → buat order + order items → clear cart
   */
  async create(userId: string) {
    // Ambil semua item cart user
    const cartItems = await this.cartService.getCart(userId);
    if (cartItems.length === 0) {
      throw new NotFoundException('Cart kosong, tidak bisa checkout');
    }

    // Hitung total harga
    let totalPrice = 0;
    const orderItemsData: { productId: string; quantity: number; price: number }[] = [];

    for (const item of cartItems) {
      const product = item.product ?? (await this.productRepository.findOne({ where: { id: item.productId } }));

      if (!product) {
        throw new NotFoundException('Produk tidak ditemukan');
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Stok produk ${product.name} tidak mencukupi`);
      }

      const price = Number(product.price);
      totalPrice += price * item.quantity;

      product.stock -= item.quantity;
      await this.productRepository.save(product);

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price,
      });
    }

    // Buat Order
    const order = this.orderRepository.create({
      userId,
      totalPrice,
      status: 'pending',
    });
    const savedOrder = await this.orderRepository.save(order);

    // Buat OrderItems
    const orderItems = orderItemsData.map((item) =>
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        ...item,
      }),
    );
    await this.orderItemRepository.save(orderItems);

    // Kosongkan cart
    await this.cartService.clearCart(userId);

    // Return order lengkap dengan items
    return this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: { items: { product: true } },
    });
  }

  /**
   * Riwayat order milik user tertentu
   */
  async findMyOrders(userId: string) {
    return this.orderRepository.find({
      where: { userId },
      relations: { items: { product: true } },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Semua order (untuk admin)
   */
  async findAll() {
    return this.orderRepository.find({
      relations: { user: true, items: { product: true } },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update status order (admin only)
   */
  async updateStatus(id: string, status: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }
    order.status = status as any;
    return this.orderRepository.save(order);
  }
}