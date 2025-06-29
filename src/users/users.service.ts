import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { PendingUser, PendingUserDocument } from '../schemas/pending-user.schema';
import { Language, LanguageDocument } from '../schemas/language.schema';
import { ForgotUser, ForgotUserDocument } from 'src/schemas/forgot-user.schema';
@Injectable()
export class UsersService {
constructor(
  private mailerService: MailerService,
  @InjectModel(User.name) private userModel: Model<UserDocument>,
  @InjectModel(PendingUser.name) private pendingUserModel: Model<PendingUserDocument>,
  @InjectModel(Language.name) private languageModel: Model<LanguageDocument>,
  @InjectModel(ForgotUser.name) private forgotModel: Model<ForgotUserDocument>,
  private jwtService: JwtService,
) {}
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

async forgotPassword(email: string){
  const user: UserDocument | null = await this.userModel.findOne({email});

  if(!user){
    throw new BadRequestException("user not found")
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const forgotUser = new this.forgotModel({
    email,
    code,
  })
  
  await forgotUser.save()


  await this.mailerService.sendMail({
    to: email,
    subject: 'Your code for reset password',
    text: `Your code is ${code}`
  });

  return { message: 'Code sent to email'};
}

async confirmPassword(email: string, code: string, newPassword: string, confirmPassword: string) {
  if (newPassword !== confirmPassword) {
    throw new BadRequestException('Passwords do not match');
  }

  const forgotUser = await this.forgotModel.findOne({ email });

  if (!forgotUser || forgotUser.code !== code) {
    throw new BadRequestException('Invalid code or email');
  }
if (forgotUser.expiresAt < new Date()) {
  throw new BadRequestException('Code expired');
}

  const user = await this.userModel.findOne({ email });

  if (!user) {
    throw new BadRequestException('User not found');
  }

  user.password = newPassword; 
  await user.save();

  await this.forgotModel.deleteOne({ email });

  return { message: 'Your password has been changed!' };
}


async login(email: string, password: string) {
  const user: UserDocument | null = await this.userModel.findOne({ email });

  if (!user) {
    throw new BadRequestException("User not found");
  }

  if (user.password !== password) {
    throw new BadRequestException("Incorrect password or email");
  }

  if(!user.isVerified){
    throw new BadRequestException("You should verify your account!");
  }

  const payload = { 
    sub: user._id,  // Types.ObjectId
    email: user.email,
    name: user.name,
    nativeLanguage: user.nativeLanguage,
    targetLanguage: user.targetLanguage,
    level: user.level,
    goals: user.goals,
    interests: user.interests,
    role: user.role
  };

  const token = this.jwtService.sign(payload);
  const userId = payload.sub
  console.log(userId)
  return {
    message: "Login successful",
    token,
    userId
  };
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
    interests: user.interests,
        role: user.role
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


async findAll(userId: string) {
  const user = await this.userModel.findById(userId);

  if (user?.role === 'admin') {
    return this.userModel.find().exec();
  } else {
    return null; 
  }
}
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
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
