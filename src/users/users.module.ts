import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from '../schemas/users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PendingUser, PendingUserSchema } from '../schemas/pending-user.schema';
import { Language, LanguageSchema } from '../schemas/language.schema'; // <- импорт

@Module({
  imports: [
MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
  { name: PendingUser.name, schema: PendingUserSchema },
        { name: Language.name, schema: LanguageSchema },    // <- добавь сюда
]),
    JwtModule.register({
      secret: 'secret', 
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}