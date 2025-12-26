export const errorHandler = (err, req, res, next) => {
	console.error('Error occurred:', {
		message: err.message,
		stack: err.stack,
		url: req.url,
		method: req.method,
		timestamp: new Date().toISOString()
	});

	if (err.name === 'ValidationError') {
		return res.status(400).json({
			error: 'Validation error',
			details: err.message
		});
	}

	if (err.name === 'UnauthorizedError') {
		return res.status(401).json({
			error: 'Unauthorized'
		});
	}

	res.status(err.status || 500).json({
		error: err.message || 'Internal server error'
	});
};

export const notFoundHandler = (req, res) => {
	res.status(404).json({
		error: 'Endpoint not found',
		path: req.url
	});
};
