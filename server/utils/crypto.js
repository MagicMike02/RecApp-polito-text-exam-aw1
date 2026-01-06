import crypto from 'crypto';
import { AUTH } from '../config.js';

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