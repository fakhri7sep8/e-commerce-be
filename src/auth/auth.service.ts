import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register user baru
   * - Hash password dengan bcrypt
   * - Simpan ke database
   * - Return user tanpa password
   */
  async register(dto: RegisterDto) {
    // Cek apakah email sudah terdaftar
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // Simpan user
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    // Return user tanpa password
    const { password, ...result } = user;
    return result;
  }

  /**
   * Login user
   * - Validasi email & password
   * - Buat JWT token
   * - Set cookie 'access_token'
   * - Return user data
   */
  async login(dto: LoginDto, res: Response) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Buat payload JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const expiresIn = (process.env.JWT_EXPIRES_IN || '15m') as string;
    const token = this.jwtService.sign(payload, {
      expiresIn: expiresIn as any,
    });

    // Set cookie httpOnly
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: false, // true di production (HTTPS)
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 menit
    });

    const { password, ...result } = user;
    return result;
  }

  /**
   * Logout - hapus cookie access_token
   */
  logout(res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logout berhasil' };
  }

  /**
   * Get profile user dari token yang sudah divalidasi
   */
  async getProfile(user: { id: string; email: string; role: string }) {
    const userData = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (!userData) {
      throw new UnauthorizedException('User tidak ditemukan');
    }
    const { password, ...result } = userData;
    return result;
  }
}