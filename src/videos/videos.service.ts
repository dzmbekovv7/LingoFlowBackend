import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/users.schema';
import { Model } from 'mongoose';

export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
        width: number;
        height: number;
      };
    };
  };
}

interface YouTubeSearchResponse {
  items: YouTubeVideo[];
}

@Injectable()
export class VideosService {
  private readonly YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';
  private readonly apiKey = process.env.YOUTUBE_API_KEY;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly httpService: HttpService,
 
  ) {}

  async fetchVideosByLanguages(languages: string[], maxResults = 15): Promise<YouTubeVideo[]> {
    const allVideos: YouTubeVideo[] = [];

    for (const lang of languages) {
      const query = `Learn ${lang}`;
      const params = {
        key: this.apiKey,
        q: query,
        part: 'snippet',
        type: 'video',
        maxResults,
      };

      const response = await this.httpService
        .get<YouTubeSearchResponse>(this.YOUTUBE_API_URL, { params })
        .toPromise();

      if (response?.data?.items) {
        allVideos.push(...response.data.items);
      }
    }

    // Deduplicate by videoId
    const uniqueVideos = Array.from(
      new Map(allVideos.map((item) => [item.id.videoId, item])).values(),
    );

    return uniqueVideos;
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

async getUserVideos(userId: string): Promise<Record<string, YouTubeVideo[]>> {
  const user = await this.findById(userId);
  if (!user) throw new BadRequestException('User not found');

  const targetLanguages = user.targetLanguage || [];
  if (targetLanguages.length === 0) return {};

  const videosByLanguage: Record<string, YouTubeVideo[]> = {};

  for (const lang of targetLanguages) {
    const videos = await this.fetchVideosByLanguages([lang]);
    videosByLanguage[lang] = videos;
  }

  return videosByLanguage;
}

}
