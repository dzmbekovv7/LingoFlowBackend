import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vocabulary, VocabularyDocument, VocabularySchema } from 'src/schemas/vocabulary.schema';
import { VocabularyService } from './vocabulary.service';
import { VocabularyController } from './vocabulary.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vocabulary.name, schema: VocabularySchema }]),
  ],
  providers: [VocabularyService],
  controllers: [VocabularyController],
})
export class VocabularyModule {}
