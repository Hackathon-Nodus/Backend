import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRating {
  user: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface ISolution extends Document {
  problem: Types.ObjectId;
  user: Types.ObjectId;
  code: string;
  language: string;
  explanation?: string;
  likes: Types.ObjectId[];
  ratings: IRating[];
  likeCount: number;
  averageRating: number;
  totalRatings: number;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

const SolutionSchema = new Schema<ISolution>(
  {
    problem: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    user:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    code:        { type: String, required: true },
    language:    { type: String, required: true },
    explanation: { type: String },

    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    ratings: [
      {
        user:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating:  { type: Number, min: 1, max: 5, required: true },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    likeCount:     { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRatings:  { type: Number, default: 0 },
    score:         { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for fast sorted queries
SolutionSchema.index({ problem: 1, score: -1 });
SolutionSchema.index({ problem: 1, likeCount: -1 });
SolutionSchema.index({ problem: 1, averageRating: -1 });
SolutionSchema.index({ problem: 1, createdAt: -1 });

// Auto-calculate all derived fields before saving
SolutionSchema.pre<ISolution>('save', function (next) {
  this.likeCount = this.likes.length;

  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = parseFloat((sum / this.ratings.length).toFixed(1));
    this.totalRatings  = this.ratings.length;
  } else {
    this.averageRating = 0;
    this.totalRatings  = 0;
  }

  // Score with time decay: solutions older than 90 days get minimum 50% weight
  const ageInDays    = (Date.now() - (this.createdAt?.getTime() || Date.now())) / 86400000;
  const decayFactor  = Math.max(0.5, 1 - ageInDays / 90);
  this.score = parseFloat(
    ((this.likeCount * 10 + this.averageRating * 20) * decayFactor).toFixed(2)
  );

  next();
});

const Solution = mongoose.model<ISolution>('Solution', SolutionSchema);
export default Solution;