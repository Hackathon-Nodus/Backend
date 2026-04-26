import { NextFunction, Request, Response } from 'express';

const isNonEmptyString = (value: unknown): value is string => {
	return typeof value === 'string' && value.trim().length > 0;
};

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
	const { name, email, password } = req.body;

	if (!isNonEmptyString(name)) {
		res.status(400).json({ message: 'name is required' });
		return;
	}

	if (!isNonEmptyString(email)) {
		res.status(400).json({ message: 'email is required' });
		return;
	}

	if (!isNonEmptyString(password) || password.trim().length < 6) {
		res.status(400).json({ message: 'password must be at least 6 characters' });
		return;
	}

	next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
	const { email, password } = req.body;

	if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
		res.status(400).json({ message: 'email and password are required' });
		return;
	}

	next();
};
