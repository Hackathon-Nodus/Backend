import { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = 'HttpError';
        this.statusCode = statusCode;
    }
}

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (err instanceof HttpError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    console.error(err);

    if (err.name === 'CastError') {
        res.status(400).json({ message: 'Invalid resource identifier.' });
        return;
    }

    res.status(500).json({ message: err.message || 'Internal server error' });
};
