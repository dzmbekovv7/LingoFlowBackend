// users.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
constructor(
  private mailerService: MailerService,
  @InjectModel(User.name) private userModel: Model<UserDocument>,
  private jwtService: JwtService, 
) {}

  private codes = new Map<string, string>();
  private tempUsers = new Map<string, Omit<CreateUserDto, 'confirmPassword'>>();

  async register(dto: CreateUserDto) {
    const { email, password, confirmPassword, name } = dto;

    const exists = await this.userModel.findOne({ email });
    if (exists) throw new BadRequestException('Email already registered');

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.codes.set(email, code);
    this.tempUsers.set(email, { email, password, name }); 

    await this.mailerService.sendMail({
      to: email,
      subject: 'Your confirmation code',
      text: `Your code is: ${code}`,
    });

    return { message: 'Code sent to email' };
  }

async confirmCode(email: string, code: string) {
  const savedCode = this.codes.get(email);
  const tempUser = this.tempUsers.get(email);

  if (!savedCode || savedCode !== code || !tempUser) {
    throw new BadRequestException('Invalid code or email');
  }
  
  const user = new this.userModel({
    ...tempUser,
    isVerified: true,
  });

  await user.save();

  this.codes.delete(email);
  this.tempUsers.delete(email);

  const payload = { sub: user._id, email: user.email };
  const token = this.jwtService.sign(payload);

  return { message: 'User verified', token };
}


  async findAll() {
    return this.userModel.find().exec();
  }

  async findOne(id: string) {
    return this.userModel.findById(id);
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
