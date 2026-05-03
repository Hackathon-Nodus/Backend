import Solution, { ISolution } from '../models/Solution';
import { Types } from 'mongoose';
import User from '../models/User';

interface SubmitSolutionInput {
    problemId: string;
    createdBy: string;
    content: string;
    link?: string;
}

export const submitSolution = async (
    payload: SubmitSolutionInput
): Promise<ISolution> => {
    const author = await User.findById(payload.createdBy).select('_id');
    if (!author) {
        throw new Error('Authenticated user does not exist');
    }

    const created = await Solution.create({
        problemId: new Types.ObjectId(payload.problemId),
        createdBy: new Types.ObjectId(payload.createdBy),
        content: payload.content.trim(),
        link: payload.link?.trim() || undefined
    });

    return created;
};

export const getSolutionsByProblem = async (
    problemId: string
): Promise<ISolution[]> => {
    return Solution.find({ problemId: new Types.ObjectId(problemId) })
        .populate('createdBy', 'name displayName avatarUrl skills repScore rating')
        .sort({ votes: -1, createdAt: -1 });
};
