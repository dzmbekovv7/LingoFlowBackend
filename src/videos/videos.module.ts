import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { UsersModule } from '../users/users.module';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/users/auth.module';
@Module({
  imports: [HttpModule, UsersModule, AuthModule],
  providers: [VideosService],
  controllers: [VideosController],
})
export class VideosModule {}
