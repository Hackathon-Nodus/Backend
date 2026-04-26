export const validateMatchInput = (problem: any, solvers: any[]) => {
  if (!problem) {
    throw new Error("Problem is required");
  }

  if (!solvers || !Array.isArray(solvers)) {
    throw new Error("Solvers must be an array");
  }

  const hasTitle = problem.title || problem.refinedTitle;

  if (!hasTitle) {
    throw new Error("Problem must have a title");
  }

  return true;
};