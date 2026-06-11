import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'paid', 'shipped', 'done'])
  status: 'pending' | 'paid' | 'shipped' | 'done';
}