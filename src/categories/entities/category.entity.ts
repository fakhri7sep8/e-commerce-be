import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relasi: satu kategori punya banyak produk
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}