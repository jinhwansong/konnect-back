import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  id: string;

  @Prop()
  nickname: string;

  @Prop()
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
