import { Request, Response } from "express";
import { refineProblem } from "../services/ai/refineService";
import { matchSolver } from "../services/ai/matchService";

export const refineProblemController = async (req: Request, res: Response) => {
  try {
    const { rawTitle, rawDescription, category } = req.body;

    const result = await refineProblem(rawTitle, rawDescription, category);

    res.json({ success: true, data: result });
  } catch (error:any) {
    console.error('REFINE ERROR: ',error);
    res.status(500).json({
       error: "Refinement failed" });
  }
};

export const matchProblemController = async (req: Request, res: Response) => {
  try {
    const { problem, solvers } = req.body;

    const result = await matchSolver(problem, solvers);

    res.json({ success: true, data: result });
  } catch (error:any) {
    console.error('MATCH ERROR: ',error);
    res.status(500).json({
       error: "Matching failed" });
  }
};