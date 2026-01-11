export function isAuthenticated(req, res, next) {
	// console.log('[AUTH] isAuthenticated check - req.isAuthenticated():', req.isAuthenticated(), 'req.user:', req.user);
	if (req.isAuthenticated()) {
		return next();
	}
	res.status(401).json({ success: false, error: 'auth_required', message: 'Authentication required' });
}

export function isOwner(req, res, next) {
	const resourceUserId = req.params.userId || req.body.user_id;
	const currentUserId = req.user?.id;

	if (!currentUserId) {
		return res.status(401).json({ success: false, error: 'auth_required', message: 'Authentication required' });
	}

	if (parseInt(resourceUserId) !== currentUserId) {
		return res.status(403).json({ success: false, error: 'forbidden_not_owner', message: 'You do not own this resource' });
	}

	next();
}

