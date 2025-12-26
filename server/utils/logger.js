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

export const logger = {
	error: (message, meta) => {
		console.error(JSON.stringify(formatLog(LOG_LEVELS.ERROR, message, meta)));
	},

	warn: (message, meta) => {
		console.warn(JSON.stringify(formatLog(LOG_LEVELS.WARN, message, meta)));
	},

	info: (message, meta) => {
		console.log(JSON.stringify(formatLog(LOG_LEVELS.INFO, message, meta)));
	},

	debug: (message, meta) => {
		if (process.env.NODE_ENV !== 'production') {
			console.log(JSON.stringify(formatLog(LOG_LEVELS.DEBUG, message, meta)));
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
