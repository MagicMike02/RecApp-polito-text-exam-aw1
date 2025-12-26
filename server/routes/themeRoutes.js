import express from 'express';
import * as themeDao from '../dao/themeDao.js';
import * as templateDao from '../dao/templateDao.js';
import { validateThemeId, validateId } from '../middlewares/validators/index.js';
import { validateTemplateId } from '../middlewares/validators/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const themes = await themeDao.getAllThemes();
		res.json(themes);
	} catch (error) {
		console.error('Error fetching themes:', error);
		res.status(500).json({ error: 'Error fetching themes' });
	}
});

router.get('/:id', validateId, async (req, res) => {
	try {
		const { id } = req.params;
		const theme = await themeDao.getThemeById(parseInt(id));

		if (!theme) {
			return res.status(404).json({ error: 'Theme not found' });
		}

		res.json(theme);
	} catch (error) {
		console.error('Error fetching theme:', error);
		res.status(500).json({ error: 'Error fetching theme' });
	}
});

router.get('/:themeId/templates', validateThemeId, async (req, res) => {
	try {
		const { themeId } = req.params;
		const templates = await templateDao.getTemplatesByTheme(parseInt(themeId));
		res.json(templates);
	} catch (error) {
		console.error('Error fetching templates:', error);
		res.status(500).json({ error: 'Error fetching templates' });
	}
});

router.get('/templates/:id', validateTemplateId, async (req, res) => {
	try {
		const { id } = req.params;
		const template = await templateDao.getTemplateById(parseInt(id));

		if (!template) {
			return res.status(404).json({ error: 'Template not found' });
		}

		res.json(template);
	} catch (error) {
		console.error('Error fetching template:', error);
		res.status(500).json({ error: 'Error fetching template' });
	}
});

export default router;
