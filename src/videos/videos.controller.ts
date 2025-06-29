import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';  // <-- import AuthGuard
import { VideosService } from './videos.service';
import { UsersService } from '../users/users.service';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string };
}

@Controller('videos')
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))  // <-- protect route with JWT guard
  async getUserVideos(@Req() req: RequestWithUser) {
    const userId = req.user.id;  // now guaranteed by guard
    return this.videosService.getUserVideos(userId);
  }
}
