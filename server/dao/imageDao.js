import { openDatabase } from '../database/db.js';

export async function getImagesByTheme(themeId) {
	const db = await openDatabase();
	try {
		const images = await db.all(
			`SELECT id, theme_id, url, text_fields_count, text_positions, created_at 
       FROM background_images 
       WHERE theme_id = ? 
       ORDER BY text_fields_count, id`,
			[themeId]
		);

		return images.map(img => ({
			...img,
			text_positions: JSON.parse(img.text_positions)
		}));
	} finally {
		await db.close();
	}
}

export async function getImagesByThemeAndFieldCount(themeId, fieldCount) {
	const db = await openDatabase();
	try {
		const images = await db.all(
			`SELECT id, theme_id, url, text_fields_count, text_positions, created_at 
       FROM background_images 
       WHERE theme_id = ? AND text_fields_count = ?
       ORDER BY id`,
			[themeId, fieldCount]
		);

		return images.map(img => ({
			...img,
			text_positions: JSON.parse(img.text_positions)
		}));
	} finally {
		await db.close();
	}
}

export async function getImageById(id) {
	const db = await openDatabase();
	try {
		const image = await db.get(
			`SELECT id, theme_id, url, text_fields_count, text_positions, created_at 
       FROM background_images 
       WHERE id = ?`,
			[id]
		);

		if (!image) return null;

		return {
			...image,
			text_positions: JSON.parse(image.text_positions)
		};
	} finally {
		await db.close();
	}
}

export async function createImage({ theme_id, url, text_fields_count, text_positions }) {
	const db = await openDatabase();
	try {
		const result = await db.run(
			`INSERT INTO background_images (theme_id, url, text_fields_count, text_positions) 
       VALUES (?, ?, ?, ?)`,
			[theme_id, url, text_fields_count, JSON.stringify(text_positions)]
		);
		return result.lastID;
	} finally {
		await db.close();
	}
}

export async function updateImage(id, { url, text_positions }) {
	const db = await openDatabase();
	try {
		const result = await db.run(
			`UPDATE background_images 
       SET url = ?, text_positions = ? 
       WHERE id = ?`,
			[url, JSON.stringify(text_positions), id]
		);
		return result.changes > 0;
	} finally {
		await db.close();
	}
}

export async function deleteImage(id) {
	const db = await openDatabase();
	try {
		const result = await db.run('DELETE FROM background_images WHERE id = ?', [id]);
		return result.changes > 0;
	} finally {
		await db.close();
	}
}

export async function getImageCountsByTheme(themeId) {
	const db = await openDatabase();
	try {
		const counts = await db.all(
			`SELECT text_fields_count, COUNT(*) as count 
       FROM background_images 
       WHERE theme_id = ? 
       GROUP BY text_fields_count`,
			[themeId]
		);

		const result = { total: 0, field_1: 0, field_2: 0, field_3: 0 };
		counts.forEach(row => {
			result[`field_${row.text_fields_count}`] = row.count;
			result.total += row.count;
		});

		return result;
	} finally {
		await db.close();
	}
}
