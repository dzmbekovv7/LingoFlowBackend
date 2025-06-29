import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LanguageDocument = Language & Document;

@Schema()
export class Language {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false }) // or `required: true` if needed
  flag: string; // usually a URL or image path
}

export const LanguageSchema = SchemaFactory.createForClass(Language);
