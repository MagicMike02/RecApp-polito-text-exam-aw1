/**
 * Database Seeding Script
 * Seeds essential data for testing:
 * - 3 Users (with hashed passwords)
 * - 3 Themes
 * - 36 Background Images (12 per theme)
 * - 6 Templates (2 per theme)
 * - 9 Recaps (3 per user, mix public/private, with derivations)
 * 
 * Usage: node seed_db.mjs
 */

import { openDatabase } from '../db.js';
import { hashPassword } from '../../utils/crypto.js';

async function seedDatabase() {
	console.log('🌱 Starting database seeding...\n');

	const db = await openDatabase();

	try {
		// Check if data already exists
		const existingUsers = await db.get('SELECT COUNT(*) as count FROM users');
		if (existingUsers.count > 0) {
			console.log('⚠️  Database already contains data. Skipping seeding.');
			console.log('   To re-seed, delete database.sqlite and run create_tables.mjs first.\n');
			await db.close();
			return;
		}

		// ========================================
		// SEED USERS
		// ========================================
		console.log('👥 Seeding users...');

		const users = [
			{ username: 'alice', password: 'Alice2025!', name: 'Alice Rossi' },
			{ username: 'bob', password: 'Bob@2025', name: 'Bob Verdi' },
			{ username: 'charlie', password: 'Charlie#2025', name: 'Charlie Bianchi' }
		];

		for (const user of users) {
			const { salt, hash } = hashPassword(user.password);
			await db.run(
				`INSERT INTO users (username, password, salt, name) 
         VALUES (?, ?, ?, ?)`,
				[user.username, hash, salt, user.name]
			);
			console.log(`   ✓ Created user: ${user.username} (${user.name})`);
		}

		// ========================================
		// SEED THEMES
		// ========================================
		console.log('\n🎨 Seeding themes...');

		const themes = [
			{
				name: 'Viaggi',
				description: 'I tuoi viaggi e avventure dell\'anno'
			},
			{
				name: 'Musica',
				description: 'I tuoi ascolti e concerti preferiti'
			},
			{
				name: 'Libri',
				description: 'Le tue letture e scoperte letterarie'
			}
		];

		for (const theme of themes) {
			await db.run(
				`INSERT INTO themes (name, description) 
         VALUES (?, ?)`,
				[theme.name, theme.description]
			);
			console.log(`   ✓ Created theme: ${theme.name}`);
		}

		// ========================================
		// SEED BACKGROUND IMAGES
		// ========================================
		console.log('\n🖼️  Seeding background images...');

		// Theme 1: Viaggi (Travel) - IDs will be 1-12
		const travelImages = [
			{ file: '/images/viaggi/travel_1.png', fields: 1, positions: '{"fields":[{"x":0.1,"y":0.1,"w":0.8,"h":0.2}]}' },
			{ file: '/images/viaggi/travel_4.png', fields: 1, positions: '{"fields":[{"x":0.1,"y":0.4,"w":0.8,"h":0.2}]}' },
			{ file: '/images/viaggi/travel_9.png', fields: 1, positions: '{"fields":[{"x":0.5,"y":0.2,"w":0.4,"h":0.3}]}' },
			{ file: '/images/viaggi/travel_10.png', fields: 1, positions: '{"fields":[{"x":0.1,"y":0.4,"w":0.8,"h":0.2}]}' },
			{ file: '/images/viaggi/travel_2.png', fields: 2, positions: '{"fields":[{"x":0.1,"y":0.1,"w":0.8,"h":0.15},{"x":0.1,"y":0.75,"w":0.8,"h":0.15}]}' },
			{ file: '/images/viaggi/travel_5.png', fields: 2, positions: '{"fields":[{"x":0.1,"y":0.2,"w":0.5,"h":0.2},{"x":0.1,"y":0.6,"w":0.5,"h":0.2}]}' },
			{ file: '/images/viaggi/travel_7.png', fields: 2, positions: '{"fields":[{"x":0.1,"y":0.05,"w":0.8,"h":0.15},{"x":0.1,"y":0.8,"w":0.8,"h":0.15}]}' },
			{ file: '/images/viaggi/travel_12.png', fields: 2, positions: '{"fields":[{"x":0.2,"y":0.3,"w":0.6,"h":0.15},{"x":0.2,"y":0.5,"w":0.6,"h":0.15}]}' },
			{ file: '/images/viaggi/travel_3.png', fields: 3, positions: '{"fields":[{"x":0.5,"y":0.1,"w":0.4,"h":0.2},{"x":0.5,"y":0.4,"w":0.4,"h":0.2},{"x":0.5,"y":0.7,"w":0.4,"h":0.2}]}' },
			{ file: '/images/viaggi/travel_6.png', fields: 3, positions: '{"fields":[{"x":0.1,"y":0.1,"w":0.3,"h":0.15},{"x":0.4,"y":0.1,"w":0.3,"h":0.15},{"x":0.7,"y":0.1,"w":0.3,"h":0.15}]}' },
			{ file: '/images/viaggi/travel_8.png', fields: 3, positions: '{"fields":[{"x":0.05,"y":0.7,"w":0.25,"h":0.2},{"x":0.35,"y":0.7,"w":0.25,"h":0.2},{"x":0.65,"y":0.7,"w":0.25,"h":0.2}]}' },
			{ file: '/images/viaggi/travel_11.png', fields: 3, positions: '{"fields":[{"x":0.1,"y":0.1,"w":0.8,"h":0.1},{"x":0.1,"y":0.25,"w":0.8,"h":0.1},{"x":0.1,"y":0.8,"w":0.8,"h":0.1}]}' }
		];

		for (const img of travelImages) {
			await db.run(
				`INSERT INTO background_images (theme_id, url, text_fields_count, text_positions) 
         VALUES (?, ?, ?, ?)`,
				[1, img.file, img.fields, img.positions]
			);
		}
		console.log(`   ✓ Created 12 background images for Viaggi theme`);

		// Theme 2: Musica (Music) - IDs will be 13-24
		const musicImages = [
			{ file: '/images/musica/music_2.png', fields: 1, positions: '{"fields":[{"x":0.1,"y":0.7,"w":0.8,"h":0.2}]}' },
			{ file: '/images/musica/music_4.png', fields: 1, positions: '{"fields":[{"x":0.1,"y":0.4,"w":0.8,"h":0.2}]}' },
			{ file: '/images/musica/music_11.png', fields: 1, positions: '{"fields":[{"x":0.05,"y":0.1,"w":0.5,"h":0.3}]}' },
			{ file: '/images/musica/music_12.png', fields: 1, positions: '{"fields":[{"x":0.2,"y":0.4,"w":0.6,"h":0.2}]}' },
			{ file: '/images/musica/music_1.png', fields: 2, positions: '{"fields":[{"x":0.5,"y":0.2,"w":0.4,"h":0.2},{"x":0.5,"y":0.6,"w":0.4,"h":0.2}]}' },
			{ file: '/images/musica/music_5.png', fields: 2, positions: '{"fields":[{"x":0.1,"y":0.1,"w":0.8,"h":0.15},{"x":0.4,"y":0.4,"w":0.5,"h":0.15}]}' },
			{ file: '/images/musica/music_6.png', fields: 2, positions: '{"fields":[{"x":0.05,"y":0.1,"w":0.4,"h":0.8},{"x":0.55,"y":0.1,"w":0.4,"h":0.8}]}' },
			{ file: '/images/musica/music_8.png', fields: 2, positions: '{"fields":[{"x":0.1,"y":0.7,"w":0.35,"h":0.2},{"x":0.55,"y":0.7,"w":0.35,"h":0.2}]}' },
			{ file: '/images/musica/music_3.png', fields: 3, positions: '{"fields":[{"x":0.1,"y":0.1,"w":0.25,"h":0.2},{"x":0.1,"y":0.4,"w":0.25,"h":0.2},{"x":0.1,"y":0.7,"w":0.25,"h":0.2}]}' },
			{ file: '/images/musica/music_7.png', fields: 3, positions: '{"fields":[{"x":0.1,"y":0.05,"w":0.8,"h":0.1},{"x":0.1,"y":0.15,"w":0.8,"h":0.1},{"x":0.1,"y":0.85,"w":0.8,"h":0.1}]}' },
			{ file: '/images/musica/music_9.png', fields: 3, positions: '{"fields":[{"x":0.4,"y":0.2,"w":0.5,"h":0.15},{"x":0.4,"y":0.45,"w":0.5,"h":0.15},{"x":0.4,"y":0.7,"w":0.5,"h":0.15}]}' },
			{ file: '/images/musica/music_10.png', fields: 3, positions: '{"fields":[{"x":0.05,"y":0.05,"w":0.3,"h":0.2},{"x":0.35,"y":0.05,"w":0.3,"h":0.2},{"x":0.65,"y":0.05,"w":0.3,"h":0.2}]}' }
		];

		for (const img of musicImages) {
			await db.run(
				`INSERT INTO background_images (theme_id, url, text_fields_count, text_positions) 
         VALUES (?, ?, ?, ?)`,
				[2, img.file, img.fields, img.positions]
			);
		}
		console.log(`   ✓ Created 12 background images for Musica theme`);

		// Theme 3: Libri (Books) - IDs will be 25-36
		const booksImages = [
			{ file: '/images/libri/books_1.png', fields: 1, positions: '{"fields":[{"x":0.55,"y":0.2,"w":0.35,"h":0.6}]}' },
			{ file: '/images/libri/books_4.png', fields: 1, positions: '{"fields":[{"x":0.1,"y":0.1,"w":0.4,"h":0.5}]}' },
			{ file: '/images/libri/books_10.png', fields: 1, positions: '{"fields":[{"x":0.1,"y":0.4,"w":0.8,"h":0.2}]}' },
			{ file: '/images/libri/books_12.png', fields: 1, positions: '{"fields":[{"x":0.2,"y":0.2,"w":0.6,"h":0.2}]}' },
			{ file: '/images/libri/books_2.png', fields: 2, positions: '{"fields":[{"x":0.05,"y":0.05,"w":0.4,"h":0.15},{"x":0.55,"y":0.8,"w":0.4,"h":0.15}]}' },
			{ file: '/images/libri/books_5.png', fields: 2, positions: '{"fields":[{"x":0.1,"y":0.2,"w":0.8,"h":0.2},{"x":0.1,"y":0.6,"w":0.8,"h":0.2}]}' },
			{ file: '/images/libri/books_6.png', fields: 2, positions: '{"fields":[{"x":0.5,"y":0.1,"w":0.4,"h":0.3},{"x":0.5,"y":0.5,"w":0.4,"h":0.3}]}' },
			{ file: '/images/libri/books_8.png', fields: 2, positions: '{"fields":[{"x":0.1,"y":0.3,"w":0.8,"h":0.15},{"x":0.1,"y":0.55,"w":0.8,"h":0.15}]}' },
			{ file: '/images/libri/books_3.png', fields: 3, positions: '{"fields":[{"x":0.6,"y":0.1,"w":0.3,"h":0.2},{"x":0.6,"y":0.4,"w":0.3,"h":0.2},{"x":0.6,"y":0.7,"w":0.3,"h":0.2}]}' },
			{ file: '/images/libri/books_7.png', fields: 3, positions: '{"fields":[{"x":0.1,"y":0.1,"w":0.8,"h":0.1},{"x":0.1,"y":0.45,"w":0.8,"h":0.1},{"x":0.1,"y":0.8,"w":0.8,"h":0.1}]}' },
			{ file: '/images/libri/books_9.png', fields: 3, positions: '{"fields":[{"x":0.05,"y":0.75,"w":0.25,"h":0.2},{"x":0.35,"y":0.75,"w":0.25,"h":0.2},{"x":0.65,"y":0.75,"w":0.25,"h":0.2}]}' },
			{ file: '/images/libri/books_11.png', fields: 3, positions: '{"fields":[{"x":0.1,"y":0.05,"w":0.3,"h":0.2},{"x":0.1,"y":0.35,"w":0.3,"h":0.2},{"x":0.1,"y":0.65,"w":0.3,"h":0.2}]}' }
		];

		for (const img of booksImages) {
			await db.run(
				`INSERT INTO background_images (theme_id, url, text_fields_count, text_positions) 
         VALUES (?, ?, ?, ?)`,
				[3, img.file, img.fields, img.positions]
			);
		}
		console.log(`   ✓ Created 12 background images for Libri theme`);

		// ========================================
		// SEED TEMPLATES
		// ========================================
		console.log('\n📄 Seeding templates...');

		// Template 1: Viaggi Estivi (Theme: Viaggi)
		await db.run(
			`INSERT INTO templates (theme_id, name, description) 
       VALUES (?, ?, ?)`,
			[1, 'Viaggi Estivi 2024', 'Template per raccontare le tue avventure estive']
		);
		// Pages for Template 1 (uses images 1, 5, 9 from Viaggi theme)
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[1, 1, 1, 'Le mie Avventure 2024']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[1, 2, 5, '15 Paesi Visitati', '3 Continenti Esplorati']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[1, 3, 9, 'Cibo Locale', 'Nuove Amicizie', 'Ricordi Indimenticabili']
		);

		// Template 2: Road Trip (Theme: Viaggi)
		await db.run(
			`INSERT INTO templates (theme_id, name, description) 
       VALUES (?, ?, ?)`,
			[1, 'Road Trip Adventure', 'Per i tuoi viaggi on the road']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[2, 1, 2, 'On the Road']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[2, 2, 7, '5000 km percorsi', 'Libertà totale']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[2, 3, 10, 'Musica a palla', 'Tramonti mozzafiato', 'Zero programmi']
		);

		// Template 3: Top Songs (Theme: Musica)
		await db.run(
			`INSERT INTO templates (theme_id, name, description) 
       VALUES (?, ?, ?)`,
			[2, 'Le Mie Hit 2024', 'Le canzoni che hanno segnato il tuo anno']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[3, 1, 13, 'La Mia Musica 2024']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[3, 2, 17, '1.234 ore di ascolto', '847 canzoni diverse']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[3, 3, 21, 'Rock 45%', 'Pop 30%', 'Jazz 25%']
		);

		// Template 4: Live Concerts (Theme: Musica)
		await db.run(
			`INSERT INTO templates (theme_id, name, description) 
       VALUES (?, ?, ?)`,
			[2, 'Concerti Live', 'I concerti più belli dell\'anno']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[4, 1, 14, 'Live Music 2024']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[4, 2, 18, '12 Concerti', 'Emozioni Pure']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[4, 3, 22, 'Rock al Forum', 'Jazz Festival', 'Indie sotto le stelle']
		);

		// Template 5: Letture Preferite (Theme: Libri)
		await db.run(
			`INSERT INTO templates (theme_id, name, description) 
       VALUES (?, ?, ?)`,
			[3, 'I Miei Libri 2024', 'Le letture che ti hanno appassionato']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[5, 1, 25, 'Un Anno di Letture']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[5, 2, 29, '24 libri letti', '8.500 pagine']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[5, 3, 33, 'Romanzi', 'Saggi', 'Poesia']
		);

		// Template 6: Book Club (Theme: Libri)
		await db.run(
			`INSERT INTO templates (theme_id, name, description) 
       VALUES (?, ?, ?)`,
			[3, 'Scoperte Letterarie', 'Nuovi autori e generi scoperti']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[6, 1, 26, 'Nuove Scoperte']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[6, 2, 30, '5 nuovi autori', '3 generi diversi']
		);
		await db.run(
			`INSERT INTO template_pages (template_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[6, 3, 34, 'Fantasy', 'Thriller', 'Classici']
		);

		console.log(`   ✓ Created 6 templates (2 per theme)`);
		console.log(`   ✓ Created 18 template pages (3 pages per template)`);

		// ========================================
		// SEED RECAPS
		// ========================================
		console.log('\n📝 Seeding recaps...');

		// Alice's Recaps (3 total: 2 public, 1 private)
		// Recap 1: Alice - Public - from template
		await db.run(
			`INSERT INTO recaps (user_id, theme_id, title, visibility) 
       VALUES (?, ?, ?, ?)`,
			[1, 1, 'Estate in Italia', 'public']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[1, 1, 1, 'La mia Estate Italiana']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[1, 2, 5, 'Da Nord a Sud', '20 Città Visitate']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[1, 3, 9, 'Pizza napoletana', 'Gelato artigianale', 'Pasta al pesto']
		);

		// Recap 2: Alice - Public - from template
		await db.run(
			`INSERT INTO recaps (user_id, theme_id, title, visibility) 
       VALUES (?, ?, ?, ?)`,
			[1, 2, 'Rock Year 2024', 'public']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[2, 1, 13, 'Il mio Anno Rock']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[2, 2, 17, '2.000 ore di rock', '500 band diverse']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[2, 3, 21, 'Classic Rock', 'Alternative', 'Hard Rock']
		);

		// Recap 3: Alice - Private
		await db.run(
			`INSERT INTO recaps (user_id, theme_id, title, visibility) 
       VALUES (?, ?, ?, ?)`,
			[1, 3, 'Letture Personali', 'private']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[3, 1, 25, 'I miei momenti di lettura']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[3, 2, 29, '15 romanzi', '3.200 pagine']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[3, 3, 33, 'Gialli', 'Storici', 'Contemporanei']
		);

		// Bob's Recaps (3 total: 1 public, 1 private, 1 derived from Alice)
		// Recap 4: Bob - Public
		await db.run(
			`INSERT INTO recaps (user_id, theme_id, title, visibility) 
       VALUES (?, ?, ?, ?)`,
			[2, 2, 'Concerti Indimenticabili', 'public']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[4, 1, 14, 'Live 2024']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[4, 2, 18, '8 Concerti Live', 'Pura Magia']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[4, 3, 22, 'Coldplay a Milano', 'Ed Sheeran a Roma', 'Vasco a Bari']
		);

		// Recap 5: Bob - Derived from Alice's "Estate in Italia" (Recap 1)
		await db.run(
			`INSERT INTO recaps (user_id, theme_id, title, visibility, derived_from_recap_id, derived_from_author, derived_from_title) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[2, 1, 'Il mio Tour del Sud', 'public', 1, 'Alice Rossi', 'Estate in Italia']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[5, 1, 2, 'Alla scoperta del Sud']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[5, 2, 6, 'Puglia e Calabria', 'Mare cristallino']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[5, 3, 11, 'Orecchiette', 'Taralli', 'Focaccia barese']
		);

		// Recap 6: Bob - Private
		await db.run(
			`INSERT INTO recaps (user_id, theme_id, title, visibility) 
       VALUES (?, ?, ?, ?)`,
			[2, 3, 'Letture Estive', 'private']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[6, 1, 27, 'Estate di letture']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[6, 2, 31, '10 libri sotto l\'ombrellone', '2.800 pagine']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[6, 3, 35, 'Thriller', 'Fantasy', 'Avventura']
		);

		// Charlie's Recaps (3 total: 2 public, 1 private, 1 derived from Bob)
		// Recap 7: Charlie - Public
		await db.run(
			`INSERT INTO recaps (user_id, theme_id, title, visibility) 
       VALUES (?, ?, ?, ?)`,
			[3, 3, 'Anno di Scoperte Letterarie', 'public']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[7, 1, 26, 'Scoprire Nuovi Mondi']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[7, 2, 30, '30 libri', '10.000 pagine']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[7, 3, 34, 'Sci-fi', 'Distopie', 'Biografie']
		);

		// Recap 8: Charlie - Derived from Bob's "Concerti Indimenticabili" (Recap 4)
		await db.run(
			`INSERT INTO recaps (user_id, theme_id, title, visibility, derived_from_recap_id, derived_from_author, derived_from_title) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[3, 2, 'Festival Musicali 2024', 'public', 4, 'Bob Verdi', 'Concerti Indimenticabili']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[8, 1, 15, 'Summer Festivals']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[8, 2, 19, '5 Festival', 'Musica e Natura']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[8, 3, 23, 'Indie Rock', 'Elettronica', 'World Music']
		);

		// Recap 9: Charlie - Private
		await db.run(
			`INSERT INTO recaps (user_id, theme_id, title, visibility) 
       VALUES (?, ?, ?, ?)`,
			[3, 1, 'Weekend Fuori Porta', 'private']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1) 
       VALUES (?, ?, ?, ?)`,
			[9, 1, 3, 'Piccole Fughe']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2) 
       VALUES (?, ?, ?, ?, ?)`,
			[9, 2, 8, '12 weekend', '8 regioni']
		);
		await db.run(
			`INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3) 
       VALUES (?, ?, ?, ?, ?, ?)`,
			[9, 3, 12, 'Montagna', 'Lago', 'Borghi storici']
		);

		console.log(`   ✓ Created 9 recaps (3 per user)`);
		console.log(`   ✓ Created 27 recap pages (3 pages per recap)`);
		console.log(`   ✓ 2 recaps are derived from other users' recaps`);

		console.log('\n🎉 Seeding completed successfully!\n');
		console.log('📊 Database Summary:');
		console.log('   • 3 users created');
		console.log('   • 3 themes created');
		console.log('   • 36 background images created (12 per theme)');
		console.log('   • 6 templates created (2 per theme)');
		console.log('   • 18 template pages created');
		console.log('   • 9 recaps created (3 per user)');
		console.log('   • 27 recap pages created');
		console.log('   • Mix of public/private visibility');
		console.log('   • 2 derived recaps included\n');

		console.log('👤 Test Users:');
		console.log('   username: alice   | password: Alice2025!');
		console.log('   username: bob     | password: Bob@2025');
		console.log('   username: charlie | password: Charlie#2025\n');

	} catch (error) {
		console.error('❌ Error during seeding:', error.message);
		throw error;
	} finally {
		await db.close();
		console.log('🔒 Database connection closed');
	}
}

// Execute the script
seedDatabase().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
