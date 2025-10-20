import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('profile')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get(':id')
  myProfile(@Param('id') id: string) {
    return this.userService.myProfile(+id);
  }

  @Patch(':id')
  updateProfile(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateProfile(+id, updateUserDto);
  }

  // @Delete(':id')
  // deleteAccount(@Param('id') id: string) {
  //   return this.userService.deleteAccount(+id);
  // }
}
