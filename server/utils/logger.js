import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.join(__dirname, '..', 'log');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);

const LOG_LEVELS = {
	ERROR: 'ERROR',
	WARN: 'WARN',
	INFO: 'INFO',
	DEBUG: 'DEBUG'
};

const formatLog = (level, message, meta = {}) => {
	return {
		timestamp: new Date().toISOString(),
		level,
		message,
		...meta
	};
};

const writeToFile = (logEntry) => {
	try {
		fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf-8');
	} catch (error) { }
};

export const logger = {
	error: (message, meta) => {
		const logEntry = formatLog(LOG_LEVELS.ERROR, message, meta);
		// console.error(JSON.stringify(logEntry));
		writeToFile(logEntry);
	},

	warn: (message, meta) => {
		const logEntry = formatLog(LOG_LEVELS.WARN, message, meta);
		// console.warn(JSON.stringify(logEntry));
		writeToFile(logEntry);
	},

	info: (message, meta) => {
		const logEntry = formatLog(LOG_LEVELS.INFO, message, meta);
		// console.log(JSON.stringify(logEntry));
		writeToFile(logEntry);
	},

	debug: (message, meta) => {
		if (process.env.NODE_ENV !== 'production') {
			const logEntry = formatLog(LOG_LEVELS.DEBUG, message, meta);
			// console.log(JSON.stringify(logEntry));
			writeToFile(logEntry);
		}
	}
};

export const requestLogger = (req, res, next) => {
	const start = Date.now();

	res.on('finish', () => {
		const duration = Date.now() - start;
		logger.info('HTTP Request', {
			method: req.method,
			url: req.url,
			status: res.statusCode,
			duration: `${duration}ms`,
			userAgent: req.get('user-agent')
		});
	});

	next();
};
