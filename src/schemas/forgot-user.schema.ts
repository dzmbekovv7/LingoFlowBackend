import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ForgotUserDocument = ForgotUser & Document;

@Schema({ timestamps: true })
export class ForgotUser {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  code: string;

  @Prop({
    required: true,
    default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
  })
  expiresAt: Date;
}

export const ForgotUserSchema = SchemaFactory.createForClass(ForgotUser);
