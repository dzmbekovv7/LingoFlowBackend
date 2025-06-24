import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PendingUserDocument = PendingUser & Document;

@Schema({ timestamps: true })
export class PendingUser {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  code: string;
}

export const PendingUserSchema = SchemaFactory.createForClass(PendingUser);
