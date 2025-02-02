import mongoose from 'mongoose';
import connectToDatabase from '@/app/utils/mongodb';

interface IOnixNode {
  path: string;
  count: number;
  uniqueValues?: string[];
  children?: IOnixNode[];
}

interface IOnixAnalysis {
  fileName: string;
  uploadDate: Date;
  format: 'short' | 'reference';
  nodeMap: IOnixNode[];
  totalRecords: number;
}

const onixNodeSchema = new mongoose.Schema({
  path: { type: String, required: true },
  count: { type: Number, required: true },
  children: [{ type: mongoose.Schema.Types.Mixed }]
});

const onixAnalysisSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  format: { type: String, enum: ['short', 'reference'], required: true },
  nodeMap: [onixNodeSchema],
  totalRecords: { type: Number, required: true }
});

// Ensure database connection before creating the model
connectToDatabase();

export const OnixAnalysis = mongoose.models.OnixAnalysis || mongoose.model('OnixAnalysis', onixAnalysisSchema);
export type { IOnixAnalysis, IOnixNode }; 