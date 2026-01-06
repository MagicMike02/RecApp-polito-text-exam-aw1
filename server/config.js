import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DATABASE CONFIGURATION
export const DATABASE = {
	PATH: path.join(__dirname, 'database', 'database.sqlite'),

	FILENAME: 'database.sqlite',

	OPTIONS: {
		verbose: true,
	}
};

// SERVER CONFIGURATION
export const SERVER = {
	PORT: process.env.PORT || 3001,

	API_PREFIX: '/api',

	CORS: {
		origin: 'http://localhost:5173',
		credentials: true,
	}
};

// SESSION CONFIGURATION
export const SESSION = {
	SECRET: process.env.SESSION_SECRET || 'il-mio-anno-secret-key-2025',

	NAME: 'sessionId',

	COOKIE: {
		httpOnly: true,
		secure: false, // false per sviluppo in locale http
		maxAge: 1000 * 60 * 60 * 24, // 24 hours
	},

	OPTIONS: {
		resave: false,
		saveUninitialized: false,
	}
};

// AUTHENTICATION CONFIGURATION
export const AUTH = {
	HASH: {
		ITERATIONS: 100000,
		KEY_LENGTH: 64,
		DIGEST: 'sha512',
		SALT_LENGTH: 16,
	}
};

// APPLICATION CONSTRAINTS
export const CONSTRAINTS = {
	RECAP: {
		MIN_PAGES: 3,
		MIN_TEXT_FIELDS_FILLED: 1,
	},

	IMAGE: {
		TEXT_FIELDS_OPTIONS: [1, 2, 3],
		MIN_IMAGES_PER_THEME: 12,
		IMAGES_PER_FIELD_COUNT: 4,
	},

	THEME: {
		MIN_THEMES: 2,
		MIN_TEMPLATES_PER_THEME: 2,
	},

	USER: {
		MIN_USERS: 3,
		MIN_RECAPS_PER_USER: 3,
	}
};

export const VISIBILITY = {
	PUBLIC: 'public',
	PRIVATE: 'private',
};

// UTILITY FUNCTIONS
export function getPath(relativePath) {
	return path.join(__dirname, relativePath);
}

export function isDevelopment() {
	return process.env.NODE_ENV !== 'production';
}

export function isProduction() {
	return process.env.NODE_ENV === 'production';
}

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
