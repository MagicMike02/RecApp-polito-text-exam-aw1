import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { DATABASE } from '../config.js';

export async function openDatabase() {
	const db = await open({
		filename: DATABASE.PATH,
		driver: DATABASE.OPTIONS.verbose ? sqlite3.verbose().Database : sqlite3.Database
	});

	await db.get('PRAGMA foreign_keys = ON');

	return db;
}

export function getDatabasePath() {
	return DATABASE.PATH;
}

export function getDatabaseFilename() {
	return DATABASE.FILENAME;
}