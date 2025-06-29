// users.controller.ts
import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from '../schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.usersService.register(dto);
  }
  @Post('forgotPassword')
  forgotPassword(@Body() body: { email: string}){
    return this.usersService.forgotPassword(body.email)
  }
@Post('confirmPassword')
confirmPassword(@Body() body: {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return this.usersService.confirmPassword(
    body.email,
    body.code,
    body.newPassword,
    body.confirmPassword
  );
}


@Patch('profile/:id')
updateProfile(@Param('id') id: string, @Body() dto: UpdateUserDto) {
  return this.usersService.submitProfileDetails(id, dto);
}
@Get('profile/:id')
async getProfile(@Param('id') id: string) {
  const user = await this.userModel.findById(id).lean();
  if (!user){
    console.log('not found')
  }
  return user;
}

  @Post('login')
  login(@Body() body: {email:string,password:string}){
    return this.usersService.login(body.email, body.password)
  }

  @Post('confirm')
  confirm(@Body() body: { email: string; code: string }) {
    return this.usersService.confirmCode(body.email, body.code);
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
