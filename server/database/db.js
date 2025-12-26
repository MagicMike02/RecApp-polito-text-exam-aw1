/**
 * Database connection module for SQLite
 * Provides database instance with Foreign Keys enabled
 * 
 * Uses centralized configuration from config.js
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { DATABASE } from '../config.js';

/**
 * Opens a connection to the SQLite database
 * Foreign Keys are enabled for referential integrity
 * @returns {Promise<Database>} Database instance
 */
export async function openDatabase() {
	const db = await open({
		filename: DATABASE.PATH,
		driver: DATABASE.OPTIONS.verbose ? sqlite3.verbose().Database : sqlite3.Database
	});

	// Enable Foreign Keys (CRITICAL for referential integrity)
	// SQLite disables them by default for backward compatibility
	await db.get('PRAGMA foreign_keys = ON');

	return db;
}

/**
 * Get database file path
 * @returns {string} Absolute path to database file
 */
export function getDatabasePath() {
	return DATABASE.PATH;
}

/**
 * Get database filename
 * @returns {string} Database filename
 */
export function getDatabaseFilename() {
	return DATABASE.FILENAME;
}