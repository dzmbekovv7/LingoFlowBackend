import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
export type VocabularyDocument = Vocabulary & Document;

@Schema()
export class Vocabulary{
    @Prop({ required: true }) word: string;
  @Prop({ required: true }) translation: string;
  @Prop({ required: true }) languageCode: string; // "en", "fr", и т.д.

@Prop({ required: true }) type: string;         // noun, verb, adjective и т.д.
@Prop({ required: true }) category: string;     // e.g. "Daily Conversation", "Travel", "Food", etc.  @Prop({ default: true }) isDefault: boolean;


  @Prop() userId?: string; 
}

export const VocabularySchema = SchemaFactory.createForClass(Vocabulary)