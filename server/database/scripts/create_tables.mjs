/**
 * Database Schema Initialization Script
 * Creates all required tables for "Il mio anno in..." application
 * 
 * Usage: node create_tables.mjs
 * 
 * This script will:
 * - Drop existing tables (if any)
 * - Create fresh schema with all tables and constraints
 * - NOT insert any data (data seeding is separate)
 */

import { openDatabase, getDatabasePath } from '../db.js';
import { CONSTRAINTS } from '../../config.js';

async function createTables() {
  console.log('🗄️  Initializing database schema...');
  console.log(`📍 Database location: ${getDatabasePath()}`);

  const db = await openDatabase();

  try {
    // Enable Foreign Keys (critical for referential integrity)
    await db.run('PRAGMA foreign_keys = ON');

    console.log('⚙️  Dropping existing tables...');

    // Drop tables in reverse order (to avoid FK constraint violations)
    await db.run('DROP TABLE IF EXISTS recap_pages');
    await db.run('DROP TABLE IF EXISTS template_pages');
    await db.run('DROP TABLE IF EXISTS recaps');
    await db.run('DROP TABLE IF EXISTS templates');
    await db.run('DROP TABLE IF EXISTS background_images');
    await db.run('DROP TABLE IF EXISTS themes');
    await db.run('DROP TABLE IF EXISTS users');

    console.log('✅ Existing tables dropped');
    console.log('📋 Creating new tables...');

    // ========================================
    // TABLE 1: users
    // ========================================
    await db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        salt TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ Created table: users');

    // ========================================
    // TABLE 2: themes
    // ========================================
    await db.run(`
      CREATE TABLE themes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ Created table: themes');

    // ========================================
    // TABLE 3: background_images
    // ========================================
    await db.run(`
      CREATE TABLE background_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        theme_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        text_fields_count INTEGER NOT NULL CHECK (text_fields_count IN (1, 2, 3)),
        text_positions TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ Created table: background_images');

    // ========================================
    // TABLE 4: templates
    // ========================================
    await db.run(`
      CREATE TABLE templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        theme_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ Created table: templates');

    // ========================================
    // TABLE 5: template_pages
    // ========================================
    await db.run(`
      CREATE TABLE template_pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER NOT NULL,
        page_number INTEGER NOT NULL,
        background_image_id INTEGER NOT NULL,
        text_field_1 TEXT,
        text_field_2 TEXT,
        text_field_3 TEXT,
        FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
        FOREIGN KEY (background_image_id) REFERENCES background_images(id) ON DELETE RESTRICT,
        UNIQUE (template_id, page_number)
      )
    `);
    console.log('  ✓ Created table: template_pages');

    // ========================================
    // TABLE 6: recaps
    // ========================================
    await db.run(`
      CREATE TABLE recaps (
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
      )
    `);
    console.log('  ✓ Created table: recaps');

    // ========================================
    // TABLE 7: recap_pages
    // ========================================
    await db.run(`
      CREATE TABLE recap_pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recap_id INTEGER NOT NULL,
        page_number INTEGER NOT NULL,
        background_image_id INTEGER NOT NULL,
        text_field_1 TEXT,
        text_field_2 TEXT,
        text_field_3 TEXT,
        FOREIGN KEY (recap_id) REFERENCES recaps(id) ON DELETE CASCADE,
        FOREIGN KEY (background_image_id) REFERENCES background_images(id) ON DELETE RESTRICT,
        UNIQUE (recap_id, page_number)
      )
    `);
    console.log('  ✓ Created table: recap_pages');

    // ========================================
    // CREATE INDEXES for performance
    // ========================================
    console.log('📊 Creating indexes...');

    await db.run('CREATE INDEX idx_background_images_theme ON background_images(theme_id)');
    await db.run('CREATE INDEX idx_background_images_fields ON background_images(text_fields_count)');
    await db.run('CREATE INDEX idx_templates_theme ON templates(theme_id)');
    await db.run('CREATE INDEX idx_template_pages_template ON template_pages(template_id)');
    await db.run('CREATE INDEX idx_recaps_user ON recaps(user_id)');
    await db.run('CREATE INDEX idx_recaps_theme ON recaps(theme_id)');
    await db.run('CREATE INDEX idx_recaps_visibility ON recaps(visibility)');
    await db.run('CREATE INDEX idx_recap_pages_recap ON recap_pages(recap_id)');

    console.log('  ✓ Created all indexes');

    console.log('\n🎉 Database schema created successfully!');
    console.log('\n📝 Summary:');
    console.log('   • 7 tables created');
    console.log('   • Foreign keys enabled');
    console.log('   • Indexes optimized');
    console.log('   • Ready for data seeding\n');

  } catch (error) {
    console.error('❌ Error creating database schema:', error.message);
    throw error;
  } finally {
    await db.close();
    console.log('🔒 Database connection closed');
  }
}

// Execute the script
createTables().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
