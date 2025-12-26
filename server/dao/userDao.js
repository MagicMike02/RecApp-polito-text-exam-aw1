import { openDatabase } from '../database/db.js';

export async function getUserById(id) {
	const db = await openDatabase();
	try {
		const user = await db.get(
			'SELECT id, username, name, created_at FROM users WHERE id = ?',
			[id]
		);
		return user || null;
	} finally {
		await db.close();
	}
}

export async function getUserByUsername(username) {
	const db = await openDatabase();
	try {
		const user = await db.get(
			'SELECT id, username, name, password, salt, created_at FROM users WHERE username = ?',
			[username]
		);
		return user || null;
	} finally {
		await db.close();
	}
}

export async function getAllUsers() {
	const db = await openDatabase();
	try {
		const users = await db.all(
			'SELECT id, username, name, created_at FROM users ORDER BY username'
		);
		return users;
	} finally {
		await db.close();
	}
}

export async function createUser({ username, password, salt, name }) {
	const db = await openDatabase();
	try {
		const result = await db.run(
			'INSERT INTO users (username, password, salt, name) VALUES (?, ?, ?, ?)',
			[username, password, salt, name]
		);
		return result.lastID;
	} finally {
		await db.close();
	}
}

export async function updateUser(id, { name }) {
	const db = await openDatabase();
	try {
		const result = await db.run(
			'UPDATE users SET name = ? WHERE id = ?',
			[name, id]
		);
		return result.changes > 0;
	} finally {
		await db.close();
	}
}

export async function deleteUser(id) {
	const db = await openDatabase();
	try {
		const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
		return result.changes > 0;
	} finally {
		await db.close();
	}
}

export async function usernameExists(username) {
	const db = await openDatabase();
	try {
		const result = await db.get(
			'SELECT COUNT(*) as count FROM users WHERE username = ?',
			[username]
		);
		return result.count > 0;
	} finally {
		await db.close();
	}
}
