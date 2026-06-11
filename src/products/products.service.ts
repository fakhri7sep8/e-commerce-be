import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Ambil semua produk beserta relasi category
   */
  async findAll() {
    // category otomatis ter-load karena eager: true di entity
    return this.productRepository.find();
  }

  /**
   * Cari produk berdasarkan ID
   */
  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }
    return product;
  }

  /**
   * Buat produk baru
   */
  async create(dto: CreateProductDto) {
    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  /**
   * Update produk
   */
  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  /**
   * Hapus produk
   */
  async remove(id: string) {
    const product = await this.findOne(id);
    return this.productRepository.remove(product);
  }
}