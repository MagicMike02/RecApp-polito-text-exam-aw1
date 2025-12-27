import { openDatabase } from '../database/db.js';

export async function getPublicRecaps() {
	const db = await openDatabase();
	try {
		const recaps = await db.all(`
            SELECT 
                r.*,
                u.username as author_username, 
                u.name as author_name,
                th.name as theme_name,
                
				--Uso funzioni Json che crea un array JSON delle pagine direttamente in SQL
                json_group_array(
                    json_object(
                        'id', rp.id,
                        'page_number', rp.page_number,
                        'background_image_id', rp.background_image_id,
                        'text_field_1', rp.text_field_1,
                        'text_field_2', rp.text_field_2,
                        'text_field_3', rp.text_field_3,
                        'background_url', bi.url,
                        'text_fields_count', bi.text_fields_count,
                        'text_positions', json(bi.text_positions) -- json() serve per evitare doppio escape
                    )
                ) as pages
            FROM recaps r
            JOIN users u ON r.user_id = u.id
            JOIN themes th ON r.theme_id = th.id
            LEFT JOIN recap_pages rp ON r.id = rp.recap_id
            LEFT JOIN background_images bi ON rp.background_image_id = bi.id
            WHERE r.visibility = 'public'
            GROUP BY r.id
            ORDER BY r.created_at DESC
        `);

		// Parsiamo la stringa JSON restituita da SQLite
		return recaps.map(recap => ({
			...recap,
			// Filtra elementi nulli se LEFT JOIN non trova match
			pages: JSON.parse(recap.pages).filter(p => p.id !== null)
				.sort((a, b) => a.page_number - b.page_number)
		}));

	} finally {
		await db.close();
	}
}
export async function getRecapsByUser(userId) {
	const db = await openDatabase();
	try {
		const recaps = await db.all(`
            SELECT 
                r.*, 
                th.name as theme_name,
                json_group_array(
                    json_object(
                        'id', rp.id,
                        'page_number', rp.page_number,
                        'background_image_url', bi.url, -- Alias pronto per il frontend
                        'text_fields_count', bi.text_fields_count
                    )
                ) as pages
            FROM recaps r
            JOIN themes th ON r.theme_id = th.id
            LEFT JOIN recap_pages rp ON r.id = rp.recap_id
            LEFT JOIN background_images bi ON rp.background_image_id = bi.id
            WHERE r.user_id = ?
            GROUP BY r.id
            ORDER BY r.created_at DESC
        `, [userId]);

		return recaps.map(recap => {
			const parsedPages = JSON.parse(recap.pages)
				.filter(p => p.id !== null)
				.sort((a, b) => a.page_number - b.page_number);

			return {
				...recap,
				pages: parsedPages,
			};
		});

	} finally {
		await db.close();
	}
}

export async function getRecapById(id, userId = null) {
	const db = await openDatabase();
	try {
		const recap = await db.get(`
            SELECT 
                r.*,
                u.username as author_username, 
                u.name as author_name,
                th.name as theme_name,
                /* Costruiamo l'array delle pagine direttamente in SQL */
                json_group_array(
                    json_object(
                        'id', rp.id,
                        'page_number', rp.page_number,
                        'background_image_id', rp.background_image_id,
                        'text_field_1', rp.text_field_1,
                        'text_field_2', rp.text_field_2,
                        'text_field_3', rp.text_field_3,
                        'background_image_url', bi.url, -- Alias fatto direttamente qui
                        'text_fields_count', bi.text_fields_count,
                        'text_positions', json(bi.text_positions) -- 'json()' evita il doppio escape delle stringhe
                    )
                ) as pages
            FROM recaps r
            JOIN users u ON r.user_id = u.id
            JOIN themes th ON r.theme_id = th.id
            LEFT JOIN recap_pages rp ON r.id = rp.recap_id
            LEFT JOIN background_images bi ON rp.background_image_id = bi.id
            WHERE r.id = ?
            GROUP BY r.id
        `, [id]);

		if (!recap) return null;

		if (recap.visibility === 'private' && recap.user_id !== userId) {
			return null;
		}

		const parsedPages = JSON.parse(recap.pages)
			.filter(p => p.id !== null)
			.sort((a, b) => a.page_number - b.page_number);

		return {
			...recap,
			pages: parsedPages
		};

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
