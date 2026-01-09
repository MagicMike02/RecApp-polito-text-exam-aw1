import express from 'express';
import passport from 'passport';

const router = express.Router();

router.post('/sessions', (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) {
			return res.status(500).json({ success: false, error: 'internal_server_error', message: 'Internal server error' });
		}
		if (!user) {
			return res.status(401).json({ success: false, error: 'invalid_credentials', message: info.message || 'Invalid credentials' });
		}
		req.login(user, (err) => {
			if (err) {
				return res.status(500).json({ success: false, error: 'login_error', message: 'Login error' });
			}
			return res.json({
				success: true, data: {
					id: user.id,
					username: user.username,
					name: user.name
				}
			});
		});
	})(req, res, next);
});

router.delete('/sessions/current', (req, res) => {
	req.logout((err) => {
		if (err) {
			return res.status(500).json({ success: false, error: 'logout_error', message: 'Logout error' });
		}
		res.json({ success: true, data: { message: 'Logged out successfully' } });
	});
});

router.get('/sessions/current', (req, res) => {
	if (req.isAuthenticated()) {
		return res.json({
			success: true, data: {
				id: req.user.id,
				username: req.user.username,
				name: req.user.name
			}
		});
	}
	res.status(401).json({ success: false, error: 'not_authenticated', message: 'Not authenticated' });
});

export default router;
