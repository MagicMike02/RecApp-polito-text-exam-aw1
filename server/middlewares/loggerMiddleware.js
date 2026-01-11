import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, '..', 'log');

// Assicurati che la directory log esista
if (!fs.existsSync(LOG_DIR)) {
	fs.mkdirSync(LOG_DIR, { recursive: true });
}

const getLogFileName = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `recap-${year}-${month}-${day}.log`;
};

const formatLogEntry = (req, res, duration, error = null) => {
	const timestamp = new Date().toISOString();
	const method = req.method;
	const url = req.originalUrl;
	const statusCode = res.statusCode;
	const userAgent = req.get('user-agent') || 'Unknown';
	const ip = req.ip || req.connection.remoteAddress;

	// Informazioni sull'utente autenticato
	const userId = req.user?.id || null;
	const username = req.user?.username || null;

	// Parametri della richiesta (sanitizzati per non loggare password)
	const params = req.params || {};
	const query = req.query || {};
	const body = req.body ? sanitizeBody(req.body) : {};

	return {
		timestamp,
		method,
		url,
		statusCode,
		duration: `${duration}ms`,
		ip,
		userAgent,
		user: userId ? { id: userId, username } : null,
		request: {
			params: Object.keys(params).length > 0 ? params : undefined,
			query: Object.keys(query).length > 0 ? query : undefined,
			body: Object.keys(body).length > 0 ? body : undefined,
		},
		...(error && {
			error: error.message,
			stack: error.stack,
			validationErrors: error.validationErrors || null,
		}),
	};
};

// Helper per rimuovere campi sensibili dai log
const sanitizeBody = (body) => {
	const sanitized = { ...body };
	if (sanitized.password) sanitized.password = '[REDACTED]';
	if (sanitized.oldPassword) sanitized.oldPassword = '[REDACTED]';
	if (sanitized.newPassword) sanitized.newPassword = '[REDACTED]';
	return sanitized;
};

const writeLog = (logEntry) => {
	const fileName = getLogFileName();
	const filePath = path.join(LOG_DIR, fileName);
	const logLine = JSON.stringify(logEntry) + '\n';

	fs.appendFile(filePath, logLine, (err) => {
		if (err) {
			//.error(`[Logger Error] Failed to write log: ${err.message}`);
		}
	});
};

export const loggerMiddleware = (req, res, next) => {
	const startTime = Date.now();

	// Log iniziale della richiesta su console
	const userInfo = req.user ? `User ${req.user.id} (${req.user.username})` : 'Guest';
	//console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${userInfo}`);

	// Log dei parametri se presenti
	if (Object.keys(req.params || {}).length > 0) {
		//console.log(`  Params:`, req.params);
	}
	if (Object.keys(req.query || {}).length > 0) {
		//console.log(`  Query:`, req.query);
	}
	if (Object.keys(req.body || {}).length > 0) {
		const sanitized = sanitizeBody(req.body);
		//	console.log(`  Body:`, sanitized);
	}

	// Intercetta il metodo end originale di res
	const originalEnd = res.end;
	res.end = function (...args) {
		const duration = Date.now() - startTime;
		const logEntry = formatLogEntry(req, res, duration);
		writeLog(logEntry);

		// Log della risposta su console
		const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Rosso per errori, verde per successo
		const resetColor = '\x1b[0m';
		//console.log(`  ${statusColor}Response: ${res.statusCode}${resetColor} (${duration}ms)`);

		// Chiama il metodo originale
		return originalEnd.apply(res, args);
	};

	next();
};

export const errorLoggerMiddleware = (err, req, res, next) => {
	const startTime = Date.now ? Date.now() : new Date().getTime();
	const duration = Date.now() - startTime;

	const errorLogEntry = {
		...formatLogEntry(req, res, duration),
		type: 'ERROR',
		errorMessage: err.message,
		errorStack: err.stack,
		validationErrors: err.validationErrors || null,
		body: req.body || null,
	};

	writeLog(errorLogEntry);
	//console.error('[Error Logger]', errorLogEntry);

	next(err);
};
