import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  name: string;

  @Prop()
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  nativeLanguage?: string;

  @Prop({ type: [String], default: [] })
  targetLanguage?: string[];

  @Prop()
  level?: string;

  @Prop()
  goals?: string;

  @Prop({ type: [String], default: [] })
  interests?: string[];
}


export const UserSchema = SchemaFactory.createForClass(User);
