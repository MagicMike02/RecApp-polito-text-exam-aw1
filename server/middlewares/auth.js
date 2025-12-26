export function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.status(401).json({ error: 'Authentication required' });
}

export function isOwner(req, res, next) {
	const resourceUserId = req.params.userId || req.body.user_id;
	const currentUserId = req.user?.id;

	if (!currentUserId) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	if (parseInt(resourceUserId) !== currentUserId) {
		return res.status(403).json({ error: 'Forbidden: You do not own this resource' });
	}

	next();
}

