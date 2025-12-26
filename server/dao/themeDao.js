import { openDatabase } from '../database/db.js';

export async function getAllThemes() {
	const db = await openDatabase();
	try {
		const themes = await db.all(
			'SELECT id, name, description, created_at FROM themes ORDER BY name'
		);
		return themes;
	} finally {
		await db.close();
	}
}

export async function getThemeById(id) {
	const db = await openDatabase();
	try {
		const theme = await db.get(
			'SELECT id, name, description, created_at FROM themes WHERE id = ?',
			[id]
		);
		return theme || null;
	} finally {
		await db.close();
	}
}

export async function createTheme({ name, description }) {
	const db = await openDatabase();
	try {
		const result = await db.run(
			'INSERT INTO themes (name, description) VALUES (?, ?)',
			[name, description || null]
		);
		return result.lastID;
	} finally {
		await db.close();
	}
}

export async function updateTheme(id, { name, description }) {
	const db = await openDatabase();
	try {
		const result = await db.run(
			'UPDATE themes SET name = ?, description = ? WHERE id = ?',
			[name, description, id]
		);
		return result.changes > 0;
	} finally {
		await db.close();
	}
}

export async function deleteTheme(id) {
	const db = await openDatabase();
	try {
		const result = await db.run('DELETE FROM themes WHERE id = ?', [id]);
		return result.changes > 0;
	} finally {
		await db.close();
	}
}
