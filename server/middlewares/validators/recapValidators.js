import { body, param, validationResult } from 'express-validator';
import { CONSTRAINTS } from '../../config.js';

export const validateCreateRecap = [
	body('title')
		.trim()
		.notEmpty()
		.withMessage('Title is required')
		.isLength({ max: 200 })
		.withMessage('Title cannot exceed 200 characters'),

	body('theme_id')
		.isInt({ min: 1 })
		.withMessage('Theme ID must be a positive integer'),

	body('visibility')
		.isIn(['public', 'private'])
		.withMessage('Visibility must be "public" or "private"'),

	body('pages')
		.isArray({ min: CONSTRAINTS.MIN_PAGES })
		.withMessage(`Minimum ${CONSTRAINTS.MIN_PAGES} pages required`),

	body('pages.*.background_image_id')
		.isInt({ min: 1 })
		.withMessage('Background image ID must be a positive integer'),

	body('pages.*.page_number')
		.isInt({ min: 1 })
		.withMessage('Page number must be a positive integer'),

	body('derived_from_recap_id')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Derived from recap ID must be a positive integer'),

	body('pages.*.text_field_1')
		.optional()
		.isString()
		.trim()
		.isLength({ max: 500 })
		.withMessage('Text field 1 cannot exceed 500 characters'),

	body('pages.*.text_field_2')
		.optional()
		.isString()
		.trim()
		.isLength({ max: 500 })
		.withMessage('Text field 2 cannot exceed 500 characters'),

	body('pages.*.text_field_3')
		.optional()
		.isString()
		.trim()
		.isLength({ max: 500 })
		.withMessage('Text field 3 cannot exceed 500 characters'),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	}
];

export const validateUpdateRecap = [
	param('id')
		.isInt({ min: 1 })
		.withMessage('ID must be a positive integer'),

	body('title')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Title cannot be empty')
		.isLength({ max: 200 })
		.withMessage('Title cannot exceed 200 characters'),

	body('visibility')
		.optional()
		.isIn(['public', 'private'])
		.withMessage('Visibility must be "public" or "private"'),

	body('pages')
		.optional()
		.isArray({ min: CONSTRAINTS.MIN_PAGES })
		.withMessage(`Minimum ${CONSTRAINTS.MIN_PAGES} pages required`),

	body('pages.*.page_number')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Page number must be a positive integer'),

	body('pages.*.background_image_id')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Background image ID must be a positive integer'),

	body('pages.*.text_field_1')
		.optional()
		.isString()
		.trim()
		.isLength({ max: 500 })
		.withMessage('Text field 1 cannot exceed 500 characters'),

	body('pages.*.text_field_2')
		.optional()
		.isString()
		.trim()
		.isLength({ max: 500 })
		.withMessage('Text field 2 cannot exceed 500 characters'),

	body('pages.*.text_field_3')
		.optional()
		.isString()
		.trim()
		.isLength({ max: 500 })
		.withMessage('Text field 3 cannot exceed 500 characters'),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	}
];

export const validateRecapId = [
	param('id')
		.isInt({ min: 1 })
		.withMessage('ID must be a positive integer'),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	}
];
