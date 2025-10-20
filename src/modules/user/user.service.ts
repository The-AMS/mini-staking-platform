import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  myProfile(id: number) {
    return `This action returns a #${id} user`;
  }

  updateProfile(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  // deleteAccount(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
