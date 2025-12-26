import { openDatabase, getDatabasePath } from '../db.js';

async function createTables() {
	console.log(`🗄️  Initializing database at: ${getDatabasePath()}`);
	const db = await openDatabase();

	const tables = [
		{
			name: 'users',
			sql: `CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                salt TEXT NOT NULL,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
		},
		{
			name: 'themes',
			sql: `CREATE TABLE themes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
		},
		{
			name: 'background_images',
			sql: `CREATE TABLE background_images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                theme_id INTEGER NOT NULL,
                url TEXT NOT NULL,
                text_fields_count INTEGER NOT NULL CHECK (text_fields_count IN (1, 2, 3)),
                text_positions TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
            )`
		},
		{
			name: 'templates',
			sql: `CREATE TABLE templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                theme_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
            )`
		},
		{
			name: 'template_pages',
			sql: `CREATE TABLE template_pages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_id INTEGER NOT NULL,
                page_number INTEGER NOT NULL,
                background_image_id INTEGER NOT NULL,
                text_field_1 TEXT, text_field_2 TEXT, text_field_3 TEXT,
                FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
                FOREIGN KEY (background_image_id) REFERENCES background_images(id) ON DELETE RESTRICT,
                UNIQUE (template_id, page_number)
            )`
		},
		{
			name: 'recaps',
			sql: `CREATE TABLE recaps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                theme_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
                derived_from_recap_id INTEGER,
                derived_from_author TEXT,
                derived_from_title TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE RESTRICT,
                FOREIGN KEY (derived_from_recap_id) REFERENCES recaps(id) ON DELETE SET NULL
            )`
		},
		{
			name: 'recap_pages',
			sql: `CREATE TABLE recap_pages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recap_id INTEGER NOT NULL,
                page_number INTEGER NOT NULL,
                background_image_id INTEGER NOT NULL,
                text_field_1 TEXT, text_field_2 TEXT, text_field_3 TEXT,
                FOREIGN KEY (recap_id) REFERENCES recaps(id) ON DELETE CASCADE,
                FOREIGN KEY (background_image_id) REFERENCES background_images(id) ON DELETE RESTRICT,
                UNIQUE (recap_id, page_number)
            )`
		}
	];

	const indexes = [
		'CREATE INDEX idx_background_images_theme ON background_images(theme_id)',
		'CREATE INDEX idx_recaps_user ON recaps(user_id)',
		'CREATE INDEX idx_recaps_visibility ON recaps(visibility)',
		'CREATE INDEX idx_recap_pages_recap ON recap_pages(recap_id)'
	];

	try {
		await db.run('PRAGMA foreign_keys = ON');

		console.log('⚙️  Cleaning up old tables...');
		// Drop in ordine inverso per evitare errori di Foreign Key
		for (let i = tables.length - 1; i >= 0; i--) {
			await db.run(`DROP TABLE IF EXISTS ${tables[i].name}`);
		}

		console.log('📋 Creating tables...');
		for (const table of tables) {
			await db.run(table.sql);
			console.log(`  ✓ Created: ${table.name}`);
		}

		console.log('📊 Creating indexes...');
		for (const idx of indexes) {
			await db.run(idx);
		}

		console.log('✅ Database schema initialized successfully.\n');

	} catch (error) {
		console.error('❌ Error initializing database:', error);
		throw error;
	} finally {
		await db.close();
	}
}

createTables();