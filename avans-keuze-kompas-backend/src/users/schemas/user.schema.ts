import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at' } })
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  is_admin: boolean;

  @Prop({ default: false })
  is_student: boolean;

  @Prop()
  group: string;

  @Prop({
    type: {
      first_name: String,
      last_name: String,
      avatar_url: String,
    },
  })
  profile: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
