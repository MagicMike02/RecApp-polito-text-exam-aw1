import express from 'express';
import * as recapDao from '../dao/recapDao.js';
import { isAuthenticated, isOwner } from '../middlewares/auth.js';
import { validateCreateRecap, validateUpdateRecap, validateRecapId } from '../middlewares/validators/index.js';

const router = express.Router();

router.get('/public', async (req, res) => {
	try {
		const recaps = await recapDao.getPublicRecaps();
		res.json({ success: true, data: recaps });
	} catch (error) {
		console.error('Error fetching public recaps:', error);
		res.status(500).json({ success: false, error: 'fetch_public_recaps_error', message: 'Error fetching public recaps' });
	}
});

router.get('/my', isAuthenticated, async (req, res) => {
	try {
		const recaps = await recapDao.getRecapsByUser(req.user.id);
		res.json({ success: true, data: recaps });
	} catch (error) {
		console.error('Error fetching user recaps:', error);
		res.status(500).json({ success: false, error: 'fetch_user_recaps_error', message: 'Error fetching user recaps' });
	}
});

router.get('/:id', validateRecapId, async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user ? req.user.id : null;
		const recap = await recapDao.getRecapById(parseInt(id), userId);

		if (!recap) {
			return res.status(404).json({ success: false, error: 'recap_not_found', message: 'Recap not found' });
		}

		res.json({ success: true, data: recap });
	} catch (error) {
		console.error('Error fetching recap:', error);
		res.status(500).json({ success: false, error: 'fetch_recap_error', message: 'Error fetching recap' });
	}
});

router.post('/', isAuthenticated, validateCreateRecap, async (req, res) => {
	try {
		const { title, theme_id, visibility, pages, derived_from_recap_id } = req.body;

		let derivationInfo = null;
		if (derived_from_recap_id) {
			const originalRecap = await recapDao.getRecapById(derived_from_recap_id);
			if (!originalRecap) {
				return res.status(404).json({ success: false, error: 'original_recap_not_found', message: 'Original recap not found' });
			}
			if (originalRecap.visibility === 'private') {
				return res.status(403).json({ success: false, error: 'cannot_derive_private_recap', message: 'Cannot derive from a private recap' });
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
		res.status(201).json({ success: true, data: newRecap });
	} catch (error) {
		console.error('Error creating recap:', error);
		res.status(500).json({ success: false, error: 'create_recap_error', message: 'Error creating recap' });
	}
});

router.put('/:id', isAuthenticated, validateUpdateRecap, async (req, res) => {
	try {
		const { id } = req.params;
		const recap = await recapDao.getRecapById(parseInt(id));

		if (!recap) {
			return res.status(404).json({ success: false, error: 'recap_not_found', message: 'Recap not found' });
		}

		if (recap.user_id !== req.user.id) {
			return res.status(403).json({ success: false, error: 'forbidden_update_recap', message: 'Forbidden: You do not have permission to update this recap' });
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
		res.json({ success: true, data: updatedRecap });
	} catch (error) {
		console.error('Error updating recap:', error);
		res.status(500).json({ success: false, error: 'update_recap_error', message: 'Error updating recap' });
	}
});

router.delete('/:id', isAuthenticated, validateRecapId, async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user ? req.user.id : null;
		const recap = await recapDao.getRecapById(parseInt(id), userId);

		if (!recap) {
			return res.status(404).json({ success: false, error: 'recap_not_found', message: 'Recap not found' });
		}

		if (recap.user_id !== req.user.id) {
			return res.status(403).json({ success: false, error: 'forbidden_delete_recap', message: 'Forbidden: You do not have permission to delete this recap' });
		}

		const deleted = await recapDao.deleteRecap(parseInt(id), req.user.id);
		if (!deleted) {
			return res.status(500).json({ success: false, error: 'delete_recap_failed', message: 'Failed to delete recap' });
		}
		res.json({ success: true, data: { message: 'Recap deleted successfully' } });
	} catch (error) {
		console.error('Error deleting recap:', error);
		res.status(500).json({ success: false, error: 'delete_recap_error', message: 'Error deleting recap' });
	}
});

export default router;
