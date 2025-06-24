// languages.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Language, LanguageSchema } from '../schemas/language.schema';
import { LanguagesController } from './languages.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Language.name, schema: LanguageSchema }]),
  ],
  controllers: [LanguagesController],
  exports: [ MongooseModule], 
})
export class LanguagesModule {}
