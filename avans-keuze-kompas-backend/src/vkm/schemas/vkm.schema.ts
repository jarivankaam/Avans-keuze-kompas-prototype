import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Vkm extends Document {
  @Prop({ type: Number })
  declare id: number;

  @Prop()
  name: string;

  @Prop()
  shortdescription: string;

  @Prop()
  description: string;

  @Prop()
  content: string;

  @Prop()
  studycredit: number;

  @Prop()
  location: string;

  @Prop()
  contact_id: number;

  @Prop()
  level: string;

  @Prop()
  learningoutcomes?: string;
}

export const VkmSchema = SchemaFactory.createForClass(Vkm);
