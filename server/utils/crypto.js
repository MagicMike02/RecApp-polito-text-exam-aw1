/**
 * Cryptographic utilities for password management
 * Uses Node.js crypto module with PBKDF2 algorithm
 */

import crypto from 'crypto';
import { AUTH } from '../config.js';

/**
 * Hash a password with salt using PBKDF2
 * @param {string} password - Plain text password
 * @returns {Object} Object containing salt and hash
 * @returns {string} return.salt - Generated salt (hex)
 * @returns {string} return.hash - Password hash (hex)
 */
export function hashPassword(password) {
	const salt = crypto.randomBytes(AUTH.HASH.SALT_LENGTH).toString('hex');
	const hash = crypto.pbkdf2Sync(
		password,
		salt,
		AUTH.HASH.ITERATIONS,
		AUTH.HASH.KEY_LENGTH,
		AUTH.HASH.DIGEST
	).toString('hex');

	return { salt, hash };
}

/**
 * Verify a password against stored hash and salt
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Stored password hash
 * @param {string} salt - Stored salt
 * @returns {boolean} True if password matches, false otherwise
 */
export function verifyPassword(password, hash, salt) {
	const hashToVerify = crypto.pbkdf2Sync(
		password,
		salt,
		AUTH.HASH.ITERATIONS,
		AUTH.HASH.KEY_LENGTH,
		AUTH.HASH.DIGEST
	).toString('hex');

	return hash === hashToVerify;
}

/**
 * Generate a random token (useful for sessions, reset tokens, etc.)
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} Random token in hex format
 */
export function generateToken(length = 32) {
	return crypto.randomBytes(length).toString('hex');
}
