import { Document, Schema, Types, model } from 'mongoose';

export interface ISolution extends Document {
    problemId: Types.ObjectId;
    createdBy: Types.ObjectId;
    content: string;
    link?: string;
    votes: number;
    createdAt: Date;
}

const solutionSchema = new Schema<ISolution>(
    {
        problemId: {
            type: Schema.Types.ObjectId,
            ref: 'Problem',
            required: true,
            index: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            minlength: 10
        },
        link: {
            type: String,
            trim: true
        },
        votes: {
            type: Number,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false
    }
);

solutionSchema.index({ problemId: 1, votes: -1 });
solutionSchema.index({ createdBy: 1, createdAt: -1 });

const Solution = model<ISolution>('Solution', solutionSchema);
export default Solution;
