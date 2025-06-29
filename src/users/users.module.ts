// users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from '../schemas/users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PendingUser, PendingUserSchema } from '../schemas/pending-user.schema';
import { Language, LanguageSchema } from '../schemas/language.schema';
import { ForgotUser, ForgotUserSchema } from 'src/schemas/forgot-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PendingUser.name, schema: PendingUserSchema },
      { name: Language.name, schema: LanguageSchema },
      { name: ForgotUser.name, schema: ForgotUserSchema }
    ]),
    JwtModule.register({
      secret: 'secret', 
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [
    MongooseModule,  // <--- Export MongooseModule here!
    UsersService     // optionally export UsersService if VideosModule needs it
  ],
})
export class UsersModule {}
