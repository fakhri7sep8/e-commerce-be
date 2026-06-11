import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Ambil semua kategori beserta produk di dalamnya
   */
  async findAll() {
    return this.categoryRepository.find({
      relations: { products: true },
    });
  }

  /**
   * Cari kategori berdasarkan ID
   */
  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { products: true },
    });
    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }
    return category;
  }

  /**
   * Buat kategori baru
   */
  async create(dto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Nama kategori sudah ada');
    }
    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  /**
   * Update kategori
   */
  async update(id: string, dto: CreateCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  /**
   * Hapus kategori
   */
  async remove(id: string) {
    const category = await this.findOne(id);
    return this.categoryRepository.remove(category);
  }
}