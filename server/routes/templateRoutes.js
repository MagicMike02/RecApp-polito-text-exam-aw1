import express from 'express';
import * as templateDao from '../dao/templateDao.js';
import { validateTemplateId } from '../middlewares/validators/index.js';

const router = express.Router();

// GET /api/templates/:id
router.get('/:id', validateTemplateId, async (req, res) => {
	try {
		const { id } = req.params;
		const template = await templateDao.getTemplateById(parseInt(id));
		if (!template) {
			return res.status(404).json({ error: 'Template not found', details: `No template with id ${id}` });
		}
		res.json(template);
	} catch (error) {
		console.error('Error fetching template:', error);
		res.status(500).json({ error: 'Database error while fetching template', details: error.message });
	}
});

export default router;
