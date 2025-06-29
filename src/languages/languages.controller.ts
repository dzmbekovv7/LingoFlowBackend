import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Language, LanguageDocument } from '../schemas/language.schema';

@Controller('languages')
export class LanguagesController {
  constructor(
    @InjectModel(Language.name) private languageModel: Model<LanguageDocument>,
  ) {}

@Get('languages')
async getLanguages() {
  return this.languageModel
    .find({ isActive: true })
    .select('name flag -_id')
    .lean();
}


  @Get('levels')
  getLevels() {
    return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  }

  @Get('interests')
  getInterests() {
    return ['Movies', 'Music', 'Food', 'Travel', 'Business', 'Culture'];
  }
}
