import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { DATABASE } from '../config.js';

export async function openDatabase() {
	const db = await open({
		filename: DATABASE.PATH,
		driver: DATABASE.OPTIONS.verbose ? sqlite3.verbose().Database : sqlite3.Database
	});

	// Ensure foreign key constraints are enabled
	await db.exec('PRAGMA foreign_keys = ON;');
	console.log('PRAGMA foreign_keys set to ON'); // Debugging log

	return db;
}

export function getDatabasePath() {
	return DATABASE.PATH;
}

export function getDatabaseFilename() {
	return DATABASE.FILENAME;
}