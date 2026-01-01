import express from 'express';
import * as recapDao from '../dao/recapDao.js';
import { isAuthenticated, isOwner } from '../middlewares/auth.js';
import { validateCreateRecap, validateUpdateRecap, validateRecapId } from '../middlewares/validators/index.js';

const router = express.Router();

router.get('/public', async (req, res) => {
	try {
		const recaps = await recapDao.getPublicRecaps();
		res.json(recaps);
	} catch (error) {
		console.error('Error fetching public recaps:', error);
		res.status(500).json({ error: 'Error fetching public recaps' });
	}
});

router.get('/my', isAuthenticated, async (req, res) => {
	try {
		const recaps = await recapDao.getRecapsByUser(req.user.id);
		res.json(recaps);
	} catch (error) {
		console.error('Error fetching user recaps:', error);
		res.status(500).json({ error: 'Error fetching user recaps' });
	}
});

router.get('/:id', validateRecapId, async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user ? req.user.id : null;
		const recap = await recapDao.getRecapById(parseInt(id), userId);

		if (!recap) {
			return res.status(404).json({ error: 'Recap not found' });
		}

		res.json(recap);
	} catch (error) {
		console.error('Error fetching recap:', error);
		res.status(500).json({ error: 'Error fetching recap' });
	}
});

router.post('/', isAuthenticated, validateCreateRecap, async (req, res) => {
	try {
		const { title, theme_id, visibility, pages, derived_from_recap_id } = req.body;

		let derivationInfo = null;
		if (derived_from_recap_id) {
			const originalRecap = await recapDao.getRecapById(derived_from_recap_id);
			if (!originalRecap) {
				return res.status(404).json({ error: 'Original recap not found' });
			}
			if (originalRecap.visibility === 'private') {
				return res.status(403).json({ error: 'Cannot derive from a private recap' });
			}
			derivationInfo = {
				derived_from_recap_id,
				derived_from_author: originalRecap.author_name,
				derived_from_title: originalRecap.title
			};
		}

		const recapId = await recapDao.createRecap({
			user_id: req.user.id,
			theme_id,
			title,
			visibility,
			...derivationInfo
		});

		for (const page of pages) {
			await recapDao.createRecapPage({
				recap_id: recapId,
				page_number: page.page_number,
				background_image_id: page.background_image_id,
				text_field_1: page.text_field_1 || null,
				text_field_2: page.text_field_2 || null,
				text_field_3: page.text_field_3 || null
			});
		}

		const newRecap = await recapDao.getRecapById(recapId);
		res.status(201).json(newRecap);
	} catch (error) {
		console.error('Error creating recap:', error);
		res.status(500).json({ error: 'Error creating recap' });
	}
});

router.put('/:id', isAuthenticated, validateUpdateRecap, async (req, res) => {
	try {
		const { id } = req.params;
		const recap = await recapDao.getRecapById(parseInt(id));

		if (!recap) {
			return res.status(404).json({ error: 'Recap not found' });
		}

		if (recap.user_id !== req.user.id) {
			return res.status(403).json({ error: 'Forbidden: You do not have permission to update this recap' });
		}

		const { title, visibility, pages } = req.body;

		if (title || visibility) {
			await recapDao.updateRecap(parseInt(id), { title, visibility });
		}

		if (pages) {
			await recapDao.deleteRecapPages(parseInt(id));
			for (const page of pages) {
				await recapDao.createRecapPage({
					recap_id: parseInt(id),
					page_number: page.page_number,
					background_image_id: page.background_image_id,
					text_field_1: page.text_field_1 || null,
					text_field_2: page.text_field_2 || null,
					text_field_3: page.text_field_3 || null
				});
			}
		}

		const updatedRecap = await recapDao.getRecapById(parseInt(id));
		res.json(updatedRecap);
	} catch (error) {
		console.error('Error updating recap:', error);
		res.status(500).json({ error: 'Error updating recap' });
	}
});

router.delete('/:id', isAuthenticated, validateRecapId, async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user ? req.user.id : null;
		const recap = await recapDao.getRecapById(parseInt(id), userId);

		if (!recap) {
			return res.status(404).json({ error: 'Recap not found' });
		}

		if (recap.user_id !== req.user.id) {
			return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this recap' });
		}

		const deleted = await recapDao.deleteRecap(parseInt(id), req.user.id);
		if (!deleted) {
			return res.status(500).json({ error: 'Failed to delete recap' });
		}
		res.json({ message: 'Recap deleted successfully' });
	} catch (error) {
		console.error('Error deleting recap:', error);
		res.status(500).json({ error: 'Error deleting recap' });
	}
});

export default router;
