import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { SERVER, SESSION } from './config.js';
import { getUserByUsername, getUserById } from './dao/userDao.js';
import { verifyPassword } from './utils/crypto.js';
import { logger, requestLogger } from './utils/logger.js';
import { loggerMiddleware, errorLoggerMiddleware } from './middlewares/loggerMiddleware.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import themeRoutes from './routes/themeRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import recapRoutes from './routes/recapRoutes.js';

const app = express();

app.use(loggerMiddleware);

app.use(requestLogger);
app.use(express.json());
app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true
}));

app.use(session({
	secret: SESSION.SECRET,
	resave: SESSION.OPTIONS.resave,
	saveUninitialized: SESSION.OPTIONS.saveUninitialized,
	cookie: {
		httpOnly: SESSION.COOKIE.httpOnly,
		secure: SESSION.COOKIE.secure,
		maxAge: SESSION.COOKIE.maxAge
	}
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
	try {
		const user = await getUserByUsername(username);
		if (!user) {
			return done(null, false, { message: 'Username non trovato' });
		}

		const isValid = verifyPassword(password, user.password, user.salt);
		if (!isValid) {
			return done(null, false, { message: 'Password errata' });
		}

		return done(null, user);
	} catch (err) {
		return done(err);
	}
}));

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await getUserById(id);
		done(null, user);
	} catch (err) {
		done(err, null);
	}
});

app.use('/api', authRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/background-images', imageRoutes);
app.use('/api/recaps', recapRoutes);

app.get('/api/test', (req, res) => {
	res.json({ message: 'Server funzionante!' });
});

app.use(errorLoggerMiddleware); 
app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
	app.listen(SERVER.PORT, () => {
		logger.info(`Server running on http://localhost:${SERVER.PORT}`);
	});
}

export default app;