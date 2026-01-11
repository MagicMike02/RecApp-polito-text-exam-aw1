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
			return res.status(404).json({ success: false, error: 'template_not_found', message: `No template with id ${id}` });
		}
		res.json({ success: true, data: template });
	} catch (error) {
		//console.error('Error fetching template:', error);
		res.status(500).json({ success: false, error: 'db_fetch_template_error', message: error.message });
	}
});

export default router;
