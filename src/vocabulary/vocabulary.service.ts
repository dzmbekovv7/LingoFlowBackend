import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWordDto } from 'src/schemas/dto/create-word.dto';
import { Vocabulary, VocabularyDocument } from 'src/schemas/vocabulary.schema';
@Injectable()
export class VocabularyService {
  constructor(
    @InjectModel(Vocabulary.name)
    private vocabModel: Model<VocabularyDocument>,
  ) {}
async getWords(userId: string, languageCode: string): Promise<Vocabulary[]> {
  console.log('Finding words for language:', languageCode);
  const words = await this.vocabModel.find({ languageCode }).exec();
  console.log('Found words:', words);
  return words;
}


  async addUserWord(userId: string, dto: CreateWordDto): Promise<Vocabulary> {
    const word = new this.vocabModel({
      ...dto,
      userId,
      isDefault: false,
    });

    return word.save();
  }
}
