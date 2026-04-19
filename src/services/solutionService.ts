import { ISolution, Solution } from '../models/Solution';
import { Types } from 'mongoose';

interface SubmitSolutionInput {
    problemId: string;
    content: string;
    link?: string;
}

export const submitSolution = async (
    payload: SubmitSolutionInput
): Promise<ISolution> => {
    const created = await Solution.create({
        problemId: new Types.ObjectId(payload.problemId),
        content: payload.content.trim(),
        link: payload.link?.trim() || undefined
    });

    return created;
};

export const getSolutionsByProblem = async (
    problemId: string
): Promise<ISolution[]> => {
    return Solution.find({ problemId: new Types.ObjectId(problemId) }).sort({ votes: -1 });
};
