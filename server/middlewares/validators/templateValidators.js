import { param, validationResult } from 'express-validator';

export const validateTemplateId = [
	param('id')
		.isInt({ min: 1 })
		.withMessage('Template ID must be a positive integer'),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	}
];
