import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProblem extends Document {
  user: Types.ObjectId;
  title: string;
  description: string;
  code?: string;
  language?: string;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testCases?: {
    input: string;
    output: string;
  }[];
  solutionCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String },
    language: { type: String },
    tags: [{ type: String }],
    difficulty: { 
      type: String, 
      enum: ['Easy', 'Medium', 'Hard'], 
      default: 'Medium' 
    },
    testCases: [
      {
        input: { type: String },
        output: { type: String },
      },
    ],
    solutionCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for searching problems
ProblemSchema.index({ title: 'text', description: 'text' });
ProblemSchema.index({ tags: 1 });
ProblemSchema.index({ difficulty: 1 });
ProblemSchema.index({ createdAt: -1 });

export default mongoose.model<IProblem>('Problem', ProblemSchema);