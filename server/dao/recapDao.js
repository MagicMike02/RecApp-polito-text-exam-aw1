import { openDatabase } from '../database/db.js';

export async function getPublicRecaps() {
	const db = await openDatabase();
	try {
		const recaps = await db.all(
			`SELECT r.id, r.title, r.user_id, r.theme_id, r.visibility,
              r.derived_from_recap_id, r.derived_from_author, r.derived_from_title,
              r.created_at, r.updated_at,
              u.username as author_username, u.name as author_name,
              th.name as theme_name
       FROM recaps r
       JOIN users u ON r.user_id = u.id
       JOIN themes th ON r.theme_id = th.id
       WHERE r.visibility = 'public'
       ORDER BY r.created_at DESC`
		);
		return recaps;
	} finally {
		await db.close();
	}
}

export async function getRecapsByUser(userId) {
	const db = await openDatabase();
	try {
		const recaps = await db.all(
			`SELECT r.id, r.title, r.user_id, r.theme_id, r.visibility,
              r.derived_from_recap_id, r.derived_from_author, r.derived_from_title,
              r.created_at, r.updated_at,
              th.name as theme_name
       FROM recaps r
       JOIN themes th ON r.theme_id = th.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
			[userId]
		);
		return recaps;
	} finally {
		await db.close();
	}
}

export async function getRecapById(id, userId = null) {
	const db = await openDatabase();
	try {
		// Get recap info
		const recap = await db.get(
			`SELECT r.id, r.title, r.user_id, r.theme_id, r.visibility,
              r.derived_from_recap_id, r.derived_from_author, r.derived_from_title,
              r.created_at, r.updated_at,
              u.username as author_username, u.name as author_name,
              th.name as theme_name
       FROM recaps r
       JOIN users u ON r.user_id = u.id
       JOIN themes th ON r.theme_id = th.id
       WHERE r.id = ?`,
			[id]
		);

		if (!recap) return null;

		// Check visibility permissions
		if (recap.visibility === 'private' && recap.user_id !== userId) {
			return null; // User not authorized to view this private recap
		}

		// Get recap pages
		const pages = await db.all(
			`SELECT rp.id, rp.page_number, rp.background_image_id,
              rp.text_field_1, rp.text_field_2, rp.text_field_3,
              bi.url as image_url, bi.text_fields_count, bi.text_positions
       FROM recap_pages rp
       JOIN background_images bi ON rp.background_image_id = bi.id
       WHERE rp.recap_id = ?
       ORDER BY rp.page_number`,
			[id]
		);


		// Map image_url to background_image_url for frontend compatibility
		recap.pages = pages.map(page => ({
			...page,
			background_image_url: page.image_url, // alias for frontend
			text_positions: JSON.parse(page.text_positions)
		}));

		return recap;
	} finally {
		await db.close();
	}
}

export async function createRecap({
	user_id,
	theme_id,
	title,
	visibility,
	derived_from_recap_id,
	derived_from_author,
	derived_from_title
}) {
	const db = await openDatabase();
	try {
		const result = await db.run(
			`INSERT INTO recaps 
       (user_id, theme_id, title, visibility, derived_from_recap_id, 
        derived_from_author, derived_from_title) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[user_id, theme_id, title, visibility,
				derived_from_recap_id || null,
				derived_from_author || null,
				derived_from_title || null]
		);
		return result.lastID;
	} finally {
		await db.close();
	}
}

export async function createRecapPage({
	recap_id,
	page_number,
	background_image_id,
	text_field_1,
	text_field_2,
	text_field_3
}) {
	const db = await openDatabase();
	try {
		const result = await db.run(
			`INSERT INTO recap_pages 
       (recap_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[recap_id, page_number, background_image_id,
				text_field_1 || null, text_field_2 || null, text_field_3 || null]
		);
		return result.lastID;
	} finally {
		await db.close();
	}
}

export async function updateRecap(id, userId, { title, visibility }) {
	const db = await openDatabase();
	try {
		const result = await db.run(
			`UPDATE recaps 
       SET title = ?, visibility = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
			[title, visibility, id, userId]
		);
		return result.changes > 0;
	} finally {
		await db.close();
	}
}

export async function updateRecapPage(id, { background_image_id, text_field_1, text_field_2, text_field_3 }) {
	const db = await openDatabase();
	try {
		const result = await db.run(
			`UPDATE recap_pages 
       SET background_image_id = ?, text_field_1 = ?, text_field_2 = ?, text_field_3 = ?
       WHERE id = ?`,
			[background_image_id, text_field_1 || null, text_field_2 || null, text_field_3 || null, id]
		);
		return result.changes > 0;
	} finally {
		await db.close();
	}
}

export async function deleteRecap(id, userId) {
	const db = await openDatabase();
	try {
		const result = await db.run(
			'DELETE FROM recaps WHERE id = ? AND user_id = ?',
			[id, userId]
		);
		return result.changes > 0;
	} finally {
		await db.close();
	}
}

export async function deleteRecapPage(id) {
	const db = await openDatabase();
	try {
		const result = await db.run('DELETE FROM recap_pages WHERE id = ?', [id]);
		return result.changes > 0;
	} finally {
		await db.close();
	}
}

export async function deleteAllRecapPages(recapId) {
	const db = await openDatabase();
	try {
		const result = await db.run('DELETE FROM recap_pages WHERE recap_id = ?', [recapId]);
		return result.changes;
	} finally {
		await db.close();
	}
}

export async function isRecapOwner(recapId, userId) {
	const db = await openDatabase();
	try {
		const result = await db.get(
			'SELECT COUNT(*) as count FROM recaps WHERE id = ? AND user_id = ?',
			[recapId, userId]
		);
		return result.count > 0;
	} finally {
		await db.close();
	}
}
