import mongoose, { Schema, Document, Model } from 'mongoose';
import { PrepKit } from '@/types/kit';

export interface IKitDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  company: string;
  kit: PrepKit;
  createdAt: Date;
  updatedAt: Date;
}

const KitSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    kit: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const Kit: Model<IKitDocument> = mongoose.models.Kit || mongoose.model<IKitDocument>('Kit', KitSchema);
