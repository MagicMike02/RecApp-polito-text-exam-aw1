import express from 'express';
import passport from 'passport';

const router = express.Router();

router.post('/sessions', (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) {
			return res.status(500).json({ error: 'Internal server error' });
		}
		if (!user) {
			return res.status(401).json({ error: info.message || 'Invalid credentials' });
		}
		req.login(user, (err) => {
			if (err) {
				return res.status(500).json({ error: 'Login error' });
			}
			return res.json({
				id: user.id,
				username: user.username,
				name: user.name
			});
		});
	})(req, res, next);
});

router.delete('/sessions/current', (req, res) => {
	req.logout((err) => {
		if (err) {
			return res.status(500).json({ error: 'Logout error' });
		}
		res.json({ message: 'Logged out successfully' });
	});
});

router.get('/sessions/current', (req, res) => {
	if (req.isAuthenticated()) {
		return res.json({
			id: req.user.id,
			username: req.user.username,
			name: req.user.name
		});
	}
	res.status(401).json({ error: 'Not authenticated' });
});

export default router;
