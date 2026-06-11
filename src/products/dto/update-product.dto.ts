import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/**
 * UpdateProductDto = CreateProductDto tapi semua field optional
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}