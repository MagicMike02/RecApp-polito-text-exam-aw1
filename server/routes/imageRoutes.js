import express from 'express';
import * as imageDao from '../dao/imageDao.js';
import { validateThemeId } from '../middlewares/validators/index.js';

const router = express.Router();

router.get('/:themeId', validateThemeId, async (req, res) => {
	try {
		const { themeId } = req.params;
		const images = await imageDao.getImagesByTheme(parseInt(themeId));
		res.json(images);
	} catch (error) {
		console.error('Error fetching images:', error);
		res.status(500).json({ error: 'Error fetching images' });
	}
});

router.get('/details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const image = await imageDao.getImageById(parseInt(id));

		if (!image) {
			return res.status(404).json({ error: 'Image not found' });
		}

		res.json(image);
	} catch (error) {
		console.error('Error fetching image details:', error);
		res.status(500).json({ error: 'Error fetching image details' });
	}
});

export default router;
