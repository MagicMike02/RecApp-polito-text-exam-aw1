import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// DATABASE CONFIGURATION
// ========================================
export const DATABASE = {
	// Database file path (stored in database/ subdirectory)
	PATH: path.join(__dirname, 'database', 'database.sqlite'),

	// Database filename (for reference)
	FILENAME: 'database.sqlite',

	// Connection options
	OPTIONS: {
		verbose: true, // Set to true for SQL query logging during development
	}
};

// ========================================
// SERVER CONFIGURATION
// ========================================
export const SERVER = {
	// Server port
	PORT: process.env.PORT || 3001,

	// API base path
	API_PREFIX: '/api',

	// CORS settings
	CORS: {
		origin: 'http://localhost:5173', // Vite default dev server
		credentials: true,
	}
};

// ========================================
// SESSION CONFIGURATION
// ========================================
export const SESSION = {
	// Session secret key
	SECRET: process.env.SESSION_SECRET || 'il-mio-anno-secret-key-2025',

	// Session name
	NAME: 'sessionId',

	// Cookie settings
	COOKIE: {
		httpOnly: true,
		secure: false, // Set to true with HTTPS
		maxAge: 1000 * 60 * 60 * 24, // 24 hours
		sameSite: 'lax', //used for CSRF protection
	},

	// Session options
	OPTIONS: {
		resave: false,
		saveUninitialized: false,
	}
};

// ========================================
// AUTHENTICATION CONFIGURATION
// ========================================
export const AUTH = {
	// Password hashing settings
	HASH: {
		ITERATIONS: 100000,
		KEY_LENGTH: 64,
		DIGEST: 'sha512',
		SALT_LENGTH: 16,
	}
};

// ========================================
// APPLICATION CONSTRAINTS
// ========================================
export const CONSTRAINTS = {
	// Recap constraints
	RECAP: {
		MIN_PAGES: 3,
		MIN_TEXT_FIELDS_FILLED: 1,
	},

	// Image constraints
	IMAGE: {
		TEXT_FIELDS_OPTIONS: [1, 2, 3],
		MIN_IMAGES_PER_THEME: 12,
		IMAGES_PER_FIELD_COUNT: 4, // 4 images with 1 field, 4 with 2, 4 with 3
	},

	// Theme constraints
	THEME: {
		MIN_THEMES: 2,
		MIN_TEMPLATES_PER_THEME: 2,
	},

	// User constraints
	USER: {
		MIN_USERS: 3,
		MIN_RECAPS_PER_USER: 3,
	}
};

// ========================================
// VISIBILITY OPTIONS
// ========================================
export const VISIBILITY = {
	PUBLIC: 'public',
	PRIVATE: 'private',
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get absolute path from project root
 * @param {string} relativePath - Path relative to server directory
 * @returns {string} Absolute path
 */
export function getPath(relativePath) {
	return path.join(__dirname, relativePath);
}

/**
 * Check if running in development mode
 * @returns {boolean}
 */
export function isDevelopment() {
	return process.env.NODE_ENV !== 'production';
}

/**
 * Check if running in production mode
 * @returns {boolean}
 */
export function isProduction() {
	return process.env.NODE_ENV === 'production';
}

// Export default configuration object
export default {
	DATABASE,
	SERVER,
	SESSION,
	AUTH,
	CONSTRAINTS,
	VISIBILITY,
	getPath,
	isDevelopment,
	isProduction,
};
