import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { CreateWordDto } from 'src/schemas/dto/create-word.dto';
@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabService: VocabularyService) {}

  @Get(':userId/:languageCode')
  getVocabulary(
    @Param('userId') userId: string,
    @Param('languageCode') languageCode: string,
  ) {
    return this.vocabService.getWords(userId, languageCode);
  }

  @Post(':userId')
  addWord(
    @Param('userId') userId: string,
    @Body() dto: CreateWordDto,
  ) {
    return this.vocabService.addUserWord(userId, dto);
  }
}
