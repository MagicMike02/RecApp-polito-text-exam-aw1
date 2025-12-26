import { body, validationResult } from 'express-validator';

export const validateLogin = [
	body('username')
		.trim()
		.notEmpty()
		.withMessage('Username is required'),

	body('password')
		.notEmpty()
		.withMessage('Password is required'),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	}
];
