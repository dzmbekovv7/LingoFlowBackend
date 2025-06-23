// users.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { PendingUser, PendingUserDocument } from './schemas/pending-user.schema';
import { Language, LanguageDocument } from './schemas/language.schema';

@Injectable()
export class UsersService {
constructor(
  private mailerService: MailerService,
  @InjectModel(User.name) private userModel: Model<UserDocument>,
  @InjectModel(PendingUser.name) private pendingUserModel: Model<PendingUserDocument>,
  @InjectModel(Language.name) private languageModel: Model<LanguageDocument>,

  private jwtService: JwtService,
) {}

  private codes = new Map<string, string>();
  private tempUsers = new Map<string, Omit<CreateUserDto, 'confirmPassword'>>();

 async register(dto: CreateUserDto) {
  const { email, password, confirmPassword, name } = dto;

  const exists = await this.userModel.findOne({ email });
  const pendingExists = await this.pendingUserModel.findOne({ email });

  if (exists || pendingExists) {
    throw new BadRequestException('Email already registered or awaiting confirmation');
  }

  if (password !== confirmPassword) {
    throw new BadRequestException('Passwords do not match');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const pendingUser = new this.pendingUserModel({
    email,
    password,
    name,
    code,
  });

  await pendingUser.save();

  await this.mailerService.sendMail({
    to: email,
    subject: 'Your confirmation code',
    text: `Your code is: ${code}`,
  });

  return { message: 'Code sent to email' };
}

async login(email: string, password: string){
  const user = await this.userModel.findOne({email})

  if(!user){
    throw new BadRequestException("User not found")
  }

  if (user.password != password){
    throw new BadRequestException("Incorrect password or email")
  }

  const payload = { 
    sub: user._id,
     email: user.email,
      name:user.name, 
    nativeLanguage: user.nativeLanguage,
    targetLanguage: user.targetLanguage,
    level: user.level,
    goals: user.goals,
    interests: user.interests}
  const token = this.jwtService.sign(payload)

  return { message: "Login successful", token};
}

async confirmCode(email: string, code: string) {
  const pendingUser = await this.pendingUserModel.findOne({ email });

  if (!pendingUser || pendingUser.code !== code) {
    throw new BadRequestException('Invalid code or email');
  }

  const user = new this.userModel({
    email: pendingUser.email,
    password: pendingUser.password,
    name: pendingUser.name,
    isVerified: true,
  });

  await user.save();
  await this.pendingUserModel.deleteOne({ email });

  const payload = {
    sub: user._id,
    email: user.email,
    name: user.name, 
    nativeLanguage: user.nativeLanguage,
    targetLanguage: user.targetLanguage,
    level: user.level,
    goals: user.goals,
    interests: user.interests
  };
  const token = this.jwtService.sign(payload);

  return { message: 'User verified', token };
}

async submitProfileDetails(userId: string, dto: UpdateUserDto) {
  const user = await this.userModel.findById(userId);
  if (!user) throw new BadRequestException('User not found');

  const activeLanguages = await this.languageModel.find({ isActive: true }).lean();
  const validLanguageNames = activeLanguages.map(lang => lang.name);

  if (dto.nativeLanguage && !validLanguageNames.includes(dto.nativeLanguage)) {
    throw new BadRequestException(`Invalid native language: ${dto.nativeLanguage}`);
  }

  if (dto.targetLanguage) {
    for (const lang of dto.targetLanguage) {
      if (!validLanguageNames.includes(lang)) {
        throw new BadRequestException(`Invalid target language: ${lang}`);
      }
    }
  }

  user.nativeLanguage = dto.nativeLanguage;
  user.targetLanguage = dto.targetLanguage;
  user.level = dto.level;
  user.goals = dto.goals;
  user.interests = dto.interests;

  await user.save();

  return { message: 'Profile updated successfully', user };
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
