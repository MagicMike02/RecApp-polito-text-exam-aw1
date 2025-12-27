/**
 * Database Seeding Script - COMPLETE & CLEAN
 * * Includes all original data:
 * - 3 Users
 * - 3 Themes
 * - 36 Background Images (Specific coordinates preserved)
 * - 6 Templates
 * - 9 Recaps (with derivation logic)
 */

import { openDatabase, getDatabasePath } from '../db.js';
import { hashPassword } from '../../utils/crypto.js';

// --- HELPER: Insert Data & Return ID ---
async function insertAndGetId(db, table, data) {
	const columns = Object.keys(data);
	const values = Object.values(data);
	const placeholders = values.map(() => '?').join(', ');
	const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
	const result = await db.run(sql, values);
	return result.lastID;
}

async function seedDatabase() {
	console.log(`🌱 Starting Full Database Seeding...`);
	console.log(`📍 DB Path: ${getDatabasePath()}\n`);

	const db = await openDatabase();

	try {
		// Safety Check
		const check = await db.get('SELECT count(*) as c FROM users');
		if (check.c > 0) {
			console.log('⚠️  DB is not empty. Run "node create_tables.mjs" to reset first.');
			return;
		}

		// ==========================================
		// 1. USERS
		// ==========================================
		console.log('👥 Seeding 3 Users...');

		const usersRaw = [
			{ username: 'alice', password: 'Alice2025!', name: 'Alice Rossi' },
			{ username: 'bob', password: 'Bob@2025', name: 'Bob Verdi' },
			{ username: 'charlie', password: 'Charlie#2025', name: 'Charlie Bianchi' }
		];

		// Map to store User IDs: { 'alice': 1, 'bob': 2 ... }
		const userIds = {};

		for (const u of usersRaw) {
			const { salt, hash } = hashPassword(u.password);
			const id = await insertAndGetId(db, 'users', {
				username: u.username,
				password: hash,
				salt: salt,
				name: u.name
			});
			userIds[u.username] = id;
			console.log(`   ✓ Created: ${u.username} (ID: ${id})`);
		}

		// ==========================================
		// 2. THEMES
		// ==========================================
		console.log('\n🎨 Seeding 3 Themes...');

		const themesRaw = [
			{ id: 1, name: 'Viaggi', desc: 'I tuoi viaggi e avventure dell\'anno' },
			{ id: 2, name: 'Musica', desc: 'I tuoi ascolti e concerti preferiti' },
			{ id: 3, name: 'Libri', desc: 'Le tue letture e scoperte letterarie' }
		];

		// Map to store Theme IDs
		const themeIds = {};

		for (const t of themesRaw) {
			const id = await insertAndGetId(db, 'themes', { name: t.name, description: t.desc });
			themeIds[t.name] = id; // Store for reference
			console.log(`   ✓ Created: ${t.name}`);
		}

		// ==========================================
		// 3. BACKGROUND IMAGES (All 36 entries)
		// ==========================================
		console.log('\n🖼️  Seeding 36 Background Images...');

		// NOTE: Layouts are stored as JS Objects here, stringified on insertion.
		const allImages = [
			// --- THEME 1: VIAGGI (1-12) ---
			{ t: 1, f: 'travel_1.png', c: 1, pos: { fields: [{ x: 0.1, y: 0.1, w: 0.8, h: 0.2 }] } },
			{ t: 1, f: 'travel_4.png', c: 1, pos: { fields: [{ x: 0.1, y: 0.4, w: 0.8, h: 0.2 }] } },
			{ t: 1, f: 'travel_9.png', c: 1, pos: { fields: [{ x: 0.5, y: 0.2, w: 0.4, h: 0.3 }] } },
			{ t: 1, f: 'travel_10.png', c: 1, pos: { fields: [{ x: 0.1, y: 0.4, w: 0.8, h: 0.2 }] } },
			{ t: 1, f: 'travel_2.png', c: 2, pos: { fields: [{ x: 0.1, y: 0.1, w: 0.8, h: 0.15 }, { x: 0.1, y: 0.75, w: 0.8, h: 0.15 }] } },
			{ t: 1, f: 'travel_5.png', c: 2, pos: { fields: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.2 }, { x: 0.1, y: 0.6, w: 0.5, h: 0.2 }] } },
			{ t: 1, f: 'travel_7.png', c: 2, pos: { fields: [{ x: 0.1, y: 0.05, w: 0.8, h: 0.15 }, { x: 0.1, y: 0.8, w: 0.8, h: 0.15 }] } },
			{ t: 1, f: 'travel_12.png', c: 2, pos: { fields: [{ x: 0.2, y: 0.3, w: 0.6, h: 0.15 }, { x: 0.2, y: 0.5, w: 0.6, h: 0.15 }] } },
			{ t: 1, f: 'travel_3.png', c: 3, pos: { fields: [{ x: 0.5, y: 0.1, w: 0.4, h: 0.2 }, { x: 0.5, y: 0.4, w: 0.4, h: 0.2 }, { x: 0.5, y: 0.7, w: 0.4, h: 0.2 }] } },
			{ t: 1, f: 'travel_6.png', c: 3, pos: { fields: [{ x: 0.1, y: 0.1, w: 0.3, h: 0.15 }, { x: 0.4, y: 0.1, w: 0.3, h: 0.15 }, { x: 0.7, y: 0.1, w: 0.3, h: 0.15 }] } },
			{ t: 1, f: 'travel_8.png', c: 3, pos: { fields: [{ x: 0.05, y: 0.7, w: 0.25, h: 0.2 }, { x: 0.35, y: 0.7, w: 0.25, h: 0.2 }, { x: 0.65, y: 0.7, w: 0.25, h: 0.2 }] } },
			{ t: 1, f: 'travel_11.png', c: 3, pos: { fields: [{ x: 0.1, y: 0.1, w: 0.8, h: 0.1 }, { x: 0.1, y: 0.25, w: 0.8, h: 0.1 }, { x: 0.1, y: 0.8, w: 0.8, h: 0.1 }] } },

			// --- THEME 2: MUSICA (13-24) ---
			{ t: 2, f: 'music_2.png', c: 1, pos: { fields: [{ x: 0.1, y: 0.7, w: 0.8, h: 0.2 }] } },
			{ t: 2, f: 'music_4.png', c: 1, pos: { fields: [{ x: 0.1, y: 0.4, w: 0.8, h: 0.2 }] } },
			{ t: 2, f: 'music_11.png', c: 1, pos: { fields: [{ x: 0.05, y: 0.1, w: 0.5, h: 0.3 }] } },
			{ t: 2, f: 'music_12.png', c: 1, pos: { fields: [{ x: 0.2, y: 0.4, w: 0.6, h: 0.2 }] } },
			{ t: 2, f: 'music_1.png', c: 2, pos: { fields: [{ x: 0.5, y: 0.2, w: 0.4, h: 0.2 }, { x: 0.5, y: 0.6, w: 0.4, h: 0.2 }] } },
			{ t: 2, f: 'music_5.png', c: 2, pos: { fields: [{ x: 0.1, y: 0.1, w: 0.8, h: 0.15 }, { x: 0.4, y: 0.4, w: 0.5, h: 0.15 }] } },
			{ t: 2, f: 'music_6.png', c: 2, pos: { fields: [{ x: 0.05, y: 0.1, w: 0.4, h: 0.8 }, { x: 0.55, y: 0.1, w: 0.4, h: 0.8 }] } },
			{ t: 2, f: 'music_8.png', c: 2, pos: { fields: [{ x: 0.1, y: 0.7, w: 0.35, h: 0.2 }, { x: 0.55, y: 0.7, w: 0.35, h: 0.2 }] } },
			{ t: 2, f: 'music_3.png', c: 3, pos: { fields: [{ x: 0.65, y: 0.1, w: 0.25, h: 0.2 }, { x: 0.65, y: 0.4, w: 0.25, h: 0.2 }, { x: 0.65, y: 0.7, w: 0.25, h: 0.2 }] } },
			{ t: 2, f: 'music_7.png', c: 3, pos: { fields: [{ x: 0.1, y: 0.05, w: 0.8, h: 0.1 }, { x: 0.1, y: 0.15, w: 0.8, h: 0.1 }, { x: 0.1, y: 0.85, w: 0.8, h: 0.1 }] } },
			{ t: 2, f: 'music_9.png', c: 3, pos: { fields: [{ x: 0.4, y: 0.2, w: 0.5, h: 0.15 }, { x: 0.4, y: 0.45, w: 0.5, h: 0.15 }, { x: 0.4, y: 0.7, w: 0.5, h: 0.15 }] } },
			{ t: 2, f: 'music_10.png', c: 3, pos: { fields: [{ x: 0.05, y: 0.05, w: 0.3, h: 0.2 }, { x: 0.35, y: 0.05, w: 0.3, h: 0.2 }, { x: 0.65, y: 0.05, w: 0.3, h: 0.2 }] } },

			// --- THEME 3: LIBRI (25-36) ---
			{ t: 3, f: 'books_1.png', c: 1, pos: { fields: [{ x: 0.55, y: 0.2, w: 0.35, h: 0.6 }] } },
			{ t: 3, f: 'books_4.png', c: 1, pos: { fields: [{ x: 0.1, y: 0.1, w: 0.4, h: 0.5 }] } },
			{ t: 3, f: 'books_10.png', c: 1, pos: { fields: [{ x: 0.1, y: 0.4, w: 0.8, h: 0.2 }] } },
			{ t: 3, f: 'books_12.png', c: 1, pos: { fields: [{ x: 0.2, y: 0.2, w: 0.6, h: 0.2 }] } },
			{ t: 3, f: 'books_2.png', c: 2, pos: { fields: [{ x: 0.05, y: 0.05, w: 0.4, h: 0.15 }, { x: 0.55, y: 0.8, w: 0.4, h: 0.15 }] } },
			{ t: 3, f: 'books_5.png', c: 2, pos: { fields: [{ x: 0.1, y: 0.2, w: 0.8, h: 0.2 }, { x: 0.1, y: 0.6, w: 0.8, h: 0.2 }] } },
			{ t: 3, f: 'books_6.png', c: 2, pos: { fields: [{ x: 0.5, y: 0.1, w: 0.4, h: 0.3 }, { x: 0.5, y: 0.5, w: 0.4, h: 0.3 }] } },
			{ t: 3, f: 'books_8.png', c: 2, pos: { fields: [{ x: 0.1, y: 0.3, w: 0.8, h: 0.15 }, { x: 0.1, y: 0.55, w: 0.8, h: 0.15 }] } },
			{ t: 3, f: 'books_3.png', c: 3, pos: { fields: [{ x: 0.6, y: 0.1, w: 0.3, h: 0.2 }, { x: 0.6, y: 0.4, w: 0.3, h: 0.2 }, { x: 0.6, y: 0.7, w: 0.3, h: 0.2 }] } },
			{ t: 3, f: 'books_7.png', c: 3, pos: { fields: [{ x: 0.1, y: 0.1, w: 0.8, h: 0.1 }, { x: 0.1, y: 0.45, w: 0.8, h: 0.1 }, { x: 0.1, y: 0.8, w: 0.8, h: 0.1 }] } },
			{ t: 3, f: 'books_9.png', c: 3, pos: { fields: [{ x: 0.05, y: 0.75, w: 0.25, h: 0.2 }, { x: 0.35, y: 0.75, w: 0.25, h: 0.2 }, { x: 0.65, y: 0.75, w: 0.25, h: 0.2 }] } },
			{ t: 3, f: 'books_11.png', c: 3, pos: { fields: [{ x: 0.1, y: 0.05, w: 0.3, h: 0.2 }, { x: 0.1, y: 0.35, w: 0.3, h: 0.2 }, { x: 0.1, y: 0.65, w: 0.3, h: 0.2 }] } }
		];

		let bgCounter = 0;
		for (const img of allImages) {
			const themeName = img.t === 1 ? 'viaggi' : (img.t === 2 ? 'musica' : 'libri');
			await insertAndGetId(db, 'background_images', {
				theme_id: img.t,
				url: `/images/${themeName}/${img.f}`,
				text_fields_count: img.c,
				text_positions: JSON.stringify(img.pos)
			});
			bgCounter++;
		}
		console.log(`   ✓ Inserted ${bgCounter} images correctly`);

		// ==========================================
		// 4. TEMPLATES (All 6 Templates)
		// ==========================================
		console.log('\n📄 Seeding 6 Templates...');

		const templatesRaw = [
			// Theme 1: Viaggi
			{
				t_id: 1, name: 'Viaggi Estivi 2024', desc: 'Template per raccontare le tue avventure estive',
				pages: [{ bg: 1, t: ['Le mie Avventure 2024'] }, { bg: 5, t: ['15 Paesi Visitati', '3 Continenti Esplorati'] }, { bg: 9, t: ['Cibo Locale', 'Nuove Amicizie', 'Ricordi Indimenticabili'] }]
			},
			{
				t_id: 1, name: 'Road Trip Adventure', desc: 'Per i tuoi viaggi on the road',
				pages: [{ bg: 2, t: ['On the Road'] }, { bg: 7, t: ['5000 km percorsi', 'Libertà totale'] }, { bg: 10, t: ['Musica a palla', 'Tramonti mozzafiato', 'Zero programmi'] }]
			},

			// Theme 2: Musica
			{
				t_id: 2, name: 'Le Mie Hit 2024', desc: 'Le canzoni che hanno segnato il tuo anno',
				pages: [{ bg: 13, t: ['La Mia Musica 2024'] }, { bg: 17, t: ['1.234 ore di ascolto', '847 canzoni diverse'] }, { bg: 21, t: ['Rock 45%', 'Pop 30%', 'Jazz 25%'] }]
			},
			{
				t_id: 2, name: 'Concerti Live', desc: 'I concerti più belli dell\'anno',
				pages: [{ bg: 14, t: ['Live Music 2024'] }, { bg: 18, t: ['12 Concerti', 'Emozioni Pure'] }, { bg: 22, t: ['Rock al Forum', 'Jazz Festival', 'Indie sotto le stelle'] }]
			},

			// Theme 3: Libri
			{
				t_id: 3, name: 'I Miei Libri 2024', desc: 'Le letture che ti hanno appassionato',
				pages: [{ bg: 25, t: ['Un Anno di Letture'] }, { bg: 29, t: ['24 libri letti', '8.500 pagine'] }, { bg: 33, t: ['Romanzi', 'Saggi', 'Poesia'] }]
			},
			{
				t_id: 3, name: 'Scoperte Letterarie', desc: 'Nuovi autori e generi scoperti',
				pages: [{ bg: 26, t: ['Nuove Scoperte'] }, { bg: 30, t: ['5 nuovi autori', '3 generi diversi'] }, { bg: 34, t: ['Fantasy', 'Thriller', 'Classici'] }]
			}
		];

		for (const tmpl of templatesRaw) {
			const tmplId = await insertAndGetId(db, 'templates', { theme_id: tmpl.t_id, name: tmpl.name, description: tmpl.desc });
			let pNum = 1;
			for (const p of tmpl.pages) {
				await insertAndGetId(db, 'template_pages', {
					template_id: tmplId, page_number: pNum++, background_image_id: p.bg,
					text_field_1: p.t[0] || null, text_field_2: p.t[1] || null, text_field_3: p.t[2] || null
				});
			}
		}
		console.log(`   ✓ Templates and pages created`);

		// ==========================================
		// 5. RECAPS (All 9 Recaps + Derivations)
		// ==========================================
		console.log('\n📝 Seeding 9 Recaps (including derived ones)...');

		// We use a key-based approach to handle derivations
		// Order matters: Parents first, then Derived.
		const recapsRaw = [
			// --- ALICE ---
			{
				key: 'a1', u: 'alice', t: 1, title: 'Estate in Italia', vis: 'public',
				pages: [{ bg: 1, t: ['La mia Estate Italiana'] }, { bg: 5, t: ['Da Nord a Sud', '20 Città Visitate'] }, { bg: 9, t: ['Pizza napoletana', 'Gelato artigianale', 'Pasta al pesto'] }]
			},
			{
				key: 'a2', u: 'alice', t: 2, title: 'Rock Year 2024', vis: 'public',
				pages: [{ bg: 13, t: ['Il mio Anno Rock'] }, { bg: 17, t: ['2.000 ore di rock', '500 band diverse'] }, { bg: 21, t: ['Classic Rock', 'Alternative', 'Hard Rock'] }]
			},
			{
				key: 'a3', u: 'alice', t: 3, title: 'Letture Personali', vis: 'private',
				pages: [{ bg: 25, t: ['I miei momenti di lettura'] }, { bg: 29, t: ['15 romanzi', '3.200 pagine'] }, { bg: 33, t: ['Gialli', 'Storici', 'Contemporanei'] }]
			},

			// --- BOB ---
			{
				key: 'b1', u: 'bob', t: 2, title: 'Concerti Indimenticabili', vis: 'public',
				pages: [{ bg: 14, t: ['Live 2024'] }, { bg: 18, t: ['8 Concerti Live', 'Pura Magia'] }, { bg: 22, t: ['Coldplay a Milano', 'Ed Sheeran a Roma', 'Vasco a Bari'] }]
			},
			// DERIVED: Bob from Alice (a1)
			{
				key: 'b2', u: 'bob', t: 1, title: 'Il mio Tour del Sud', vis: 'public', derivesFrom: 'a1',
				pages: [{ bg: 2, t: ['Alla scoperta del Sud'] }, { bg: 6, t: ['Puglia e Calabria', 'Mare cristallino'] }, { bg: 11, t: ['Orecchiette', 'Taralli', 'Focaccia barese'] }]
			},
			{
				key: 'b3', u: 'bob', t: 3, title: 'Letture Estive', vis: 'private',
				pages: [{ bg: 27, t: ['Estate di letture'] }, { bg: 31, t: ['10 libri sotto l\'ombrellone', '2.800 pagine'] }, { bg: 35, t: ['Thriller', 'Fantasy', 'Avventura'] }]
			},

			// --- CHARLIE ---
			{
				key: 'c1', u: 'charlie', t: 3, title: 'Anno di Scoperte Letterarie', vis: 'public',
				pages: [{ bg: 26, t: ['Scoprire Nuovi Mondi'] }, { bg: 30, t: ['30 libri', '10.000 pagine'] }, { bg: 34, t: ['Sci-fi', 'Distopie', 'Biografie'] }]
			},
			// DERIVED: Charlie from Bob (b1)
			{
				key: 'c2', u: 'charlie', t: 2, title: 'Festival Musicali 2024', vis: 'public', derivesFrom: 'b1',
				pages: [{ bg: 15, t: ['Summer Festivals'] }, { bg: 19, t: ['5 Festival', 'Musica e Natura'] }, { bg: 23, t: ['Indie Rock', 'Elettronica', 'World Music'] }]
			},
			{
				key: 'c3', u: 'charlie', t: 1, title: 'Weekend Fuori Porta', vis: 'private',
				pages: [{ bg: 3, t: ['Piccole Fughe'] }, { bg: 8, t: ['12 weekend', '8 regioni'] }, { bg: 12, t: ['Montagna', 'Lago', 'Borghi storici'] }]
			}
		];

		// Store generated Recap IDs for derivation lookup
		const recapMap = {}; // { 'a1': 1, 'b1': 4 ... }
		// Store Recap Objects to get parent details (author/title)
		const recapDataMap = {};

		for (const r of recapsRaw) {
			const userId = userIds[r.u];
			const recapPayload = {
				user_id: userId,
				theme_id: r.t,
				title: r.title,
				visibility: r.vis
			};

			// Handle Derivation
			if (r.derivesFrom) {
				const parentId = recapMap[r.derivesFrom];
				const parentRecap = recapDataMap[r.derivesFrom];
				const parentAuthorName = usersRaw.find(u => u.username === parentRecap.u).name;

				if (parentId) {
					recapPayload.derived_from_recap_id = parentId;
					recapPayload.derived_from_author = parentAuthorName;
					recapPayload.derived_from_title = parentRecap.title;
				}
			}

			// Insert Recap
			const rId = await insertAndGetId(db, 'recaps', recapPayload);
			recapMap[r.key] = rId;
			recapDataMap[r.key] = r;

			// Insert Pages
			let pNum = 1;
			for (const p of r.pages) {
				await insertAndGetId(db, 'recap_pages', {
					recap_id: rId,
					page_number: pNum++,
					background_image_id: p.bg,
					text_field_1: p.t[0] || null,
					text_field_2: p.t[1] || null,
					text_field_3: p.t[2] || null
				});
			}
			console.log(`   ✓ Recap: "${r.title}" by ${r.u} ${r.derivesFrom ? '(Derived)' : ''}`);
		}

		console.log('\n🎉 SEEDING COMPLETE! All data restored successfully.');
		console.log('----------------------------------------------------');
		console.log(`Users: 3 | Themes: 3 | Backgrounds: 36`);
		console.log(`Templates: 6 | Recaps: 9 (2 Derived)`);

	} catch (err) {
		console.error('❌ FATAL ERROR:', err);
	} finally {
		await db.close();
		console.log('🔒 Database closed.');
	}
}

seedDatabase().catch(console.error);