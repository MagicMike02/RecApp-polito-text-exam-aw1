import { openDatabase } from '../database/db.js';

export async function getTemplatesByTheme(themeId) {
	const db = await openDatabase();
	try {
		const templates = await db.all(
			`SELECT t.id, t.theme_id, t.name, t.description, t.created_at,
              th.name as theme_name
       FROM templates t
       JOIN themes th ON t.theme_id = th.id
       WHERE t.theme_id = ?
       ORDER BY t.name`,
			[themeId]
		);
		return templates;
	} finally {
		await db.close();
	}
}

export async function getTemplateById(id) {
	const db = await openDatabase();
	try {
		const template = await db.get(
			`SELECT t.id, t.theme_id, t.name, t.description, t.created_at,
              th.name as theme_name
       FROM templates t
       JOIN themes th ON t.theme_id = th.id
       WHERE t.id = ?`,
			[id]
		);

		if (!template) return null;

		const pages = await db.all(
			`SELECT tp.id, tp.page_number, tp.background_image_id,
              tp.text_field_1, tp.text_field_2, tp.text_field_3,
              bi.url as image_url, bi.text_fields_count, bi.text_positions
       FROM template_pages tp
       JOIN background_images bi ON tp.background_image_id = bi.id
       WHERE tp.template_id = ?
       ORDER BY tp.page_number`,
			[id]
		);

		template.pages = pages.map(page => ({
			...page,
			text_positions: JSON.parse(page.text_positions)
		}));

		return template;
	} finally {
		await db.close();
	}
}

export async function getAllTemplates() {
	const db = await openDatabase();
	try {
		const templates = await db.all(
			`SELECT t.id, t.theme_id, t.name, t.description, t.created_at,
              th.name as theme_name
       FROM templates t
       JOIN themes th ON t.theme_id = th.id
       ORDER BY th.name, t.name`
		);
		return templates;
	} finally {
		await db.close();
	}
}

export async function createTemplate({ theme_id, name, description }) {
	const db = await openDatabase();
	try {
		const result = await db.run(
			'INSERT INTO templates (theme_id, name, description) VALUES (?, ?, ?)',
			[theme_id, name, description || null]
		);
		return result.lastID;
	} finally {
		await db.close();
	}
}

export async function createTemplatePage({
	template_id,
	page_number,
	background_image_id,
	text_field_1,
	text_field_2,
	text_field_3
}) {
	const db = await openDatabase();
	try {
		const result = await db.run(
			`INSERT INTO template_pages 
       (template_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[template_id, page_number, background_image_id,
				text_field_1 || null, text_field_2 || null, text_field_3 || null]
		);
		return result.lastID;
	} finally {
		await db.close();
	}
}

export async function updateTemplate(id, { name, description }) {
	const db = await openDatabase();
	try {
		const result = await db.run(
			'UPDATE templates SET name = ?, description = ? WHERE id = ?',
			[name, description, id]
		);
		return result.changes > 0;
	} finally {
		await db.close();
	}
}

export async function deleteTemplate(id) {
	const db = await openDatabase();
	try {
		const result = await db.run('DELETE FROM templates WHERE id = ?', [id]);
		return result.changes > 0;
	} finally {
		await db.close();
	}
}

export async function deleteTemplatePage(id) {
	const db = await openDatabase();
	try {
		const result = await db.run('DELETE FROM template_pages WHERE id = ?', [id]);
		return result.changes > 0;
	} finally {
		await db.close();
	}
}
