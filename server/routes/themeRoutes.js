import express from 'express';
import * as themeDao from '../dao/themeDao.js';
import * as templateDao from '../dao/templateDao.js';
import { validateThemeId, validateId } from '../middlewares/validators/index.js';
import { validateTemplateId } from '../middlewares/validators/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const themes = await themeDao.getAllThemes();
		res.json({ success: true, data: themes });
	} catch (error) {
		console.error('Error fetching themes:', error);
		res.status(500).json({ success: false, error: 'db_fetch_themes_error', message: error.message });
	}
});

router.get('/:id', validateId, async (req, res) => {
	try {
		const { id } = req.params;
		const theme = await themeDao.getThemeById(parseInt(id));

		if (!theme) {
			return res.status(404).json({ success: false, error: 'theme_not_found', message: `No theme with id ${id}` });
		}

		res.json({ success: true, data: theme });
	} catch (error) {
		console.error('Error fetching theme:', error);
		res.status(500).json({ success: false, error: 'db_fetch_theme_error', message: error.message });
	}
});

router.get('/:themeId/templates', validateThemeId, async (req, res) => {
	try {
		const { themeId } = req.params;
		const templates = await templateDao.getTemplatesByTheme(parseInt(themeId));
		res.json({ success: true, data: templates });
	} catch (error) {
		console.error('Error fetching templates:', error);
		res.status(500).json({ success: false, error: 'db_fetch_templates_error', message: error.message });
	}
});

router.get('/templates/:id', validateTemplateId, async (req, res) => {
	try {
		const { id } = req.params;
		const template = await templateDao.getTemplateById(parseInt(id));

		if (!template) {
			return res.status(404).json({ success: false, error: 'template_not_found', message: `No template with id ${id}` });
		}

		res.json({ success: true, data: template });
	} catch (error) {
		console.error('Error fetching template:', error);
		res.status(500).json({ success: false, error: 'db_fetch_template_error', message: error.message });
	}
});

export default router;
