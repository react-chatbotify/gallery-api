import fs from 'fs';
import path from 'path';

import bodyParser from 'body-parser';
import cors from 'cors';
import csrf from 'csurf';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';

import { redisSessionStore } from './databases/redis';
import { initializeDatabase } from './databases/sql/sql';
import authRoutes from './routes/authRoutes';
import themeRoutes from './routes/themeRoutes';
import userRoutes from './routes/userRoutes';
import pluginRoutes from './routes/pluginRoutes';
import projectRoutes from './routes/projectRoutes';
import { setUpMinioBucket } from './services/minioService';
import swaggerDocument from './swagger';
import Logger from './logger';

// load env variables
dotenv.config();

// enable express session debugging if not in prod
if (process.env.NODE_ENV !== 'production') {
	process.env.DEBUG = 'express-session';
}

// initialize database
initializeDatabase();

// setup minio bucket
setUpMinioBucket();

const app = express();

const allowedOrigins = process.env.FRONTEND_WEBSITE_URLS?.split(',').map(origin => origin.trim()) || [];

// handle cors with a dynamic origin function
app.use(cors({
	origin: (origin, callback) => {
	  // allow requests with no origin (like mobile apps, curl requests)
	  if (!origin) return callback(null, true);
  
	  if (allowedOrigins?.indexOf(origin) !== -1) {
		// if the origin is found in the allowedOrigins array, allow it
		return callback(null, true);
	  } else {
		// if the origin is not found in the allowedOrigins array, block it
		Logger.info(`Allowed origins: ${allowedOrigins}`);
		return callback(new Error(`Not allowed by CORS: ${origin}`));
	  }
	},
	credentials: true,
}));
app.use(bodyParser.json());

// needed to ensure correct protocol due to nginx proxies
app.set('trust proxy', true);

// handles user session
app.use(
	session({
		store: redisSessionStore,
		secret: process.env.SESSION_SECRET as string,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			// if developing locally, set to insecure
			secure: process.env.NODE_ENV !== 'development',
			// in production, use "lax" as frontend and backend have the same root domain
			sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
			// if not in production, leave domain as undefined
			domain:
				process.env.NODE_ENV === 'production'
					? process.env.COOKIE_DOMAIN
					: undefined,
			// expire after 3 months (milliseconds)
			maxAge: 1000 * 60 * 60 * 60 * 24 * 30 * 3,
		},
	}),
);

// Initialize CSRF protection. This should be after session middleware and bodyParser.
// We are using session storage for the CSRF secret ({ cookie: false }).
// CSRF protection is enabled globally for all state-changing requests (POST, PUT, DELETE, PATCH).
// GET requests are not typically checked for CSRF tokens.
// The frontend must include the CSRF token in requests.
// Common ways to send the token:
//  - In a custom HTTP header (e.g., X-CSRF-Token)
//  - In the request body (e.g., as a field named _csrf)
// The csurf middleware automatically looks for the token in these places.
const csrfProtection = csrf({ cookie: false });
app.use(csrfProtection);

// Generic error handler for CSRF token validation errors.
// This must be placed after app.use(csrfProtection) and before other error handlers or routes.
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	if (err.code === 'EBADCSRFTOKEN') {
		Logger.error('CSRF token validation failed:', err);
		res.status(403).json({ error: 'Invalid CSRF token. Please refresh and try again.' });
	} else {
		next(err);
	}
});

// handle routes
const API_PREFIX = `/api/${process.env.API_VERSION}`;
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/themes`, themeRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/plugins`, pluginRoutes);
app.use(`${API_PREFIX}/projects`, projectRoutes);

// load the swagger docs only if not in production
if (process.env.NODE_ENV !== 'production') {
	// grab all swagger path files, excluding components
	const tsFilesInDir = fs
		.readdirSync(path.join(__dirname, './swagger'))
		.filter((file) => path.extname(file) === '.js' && file !== 'components.js');

	let result = {};

	const loadSwaggerFiles = async () => {
		for (const file of tsFilesInDir) {
			const filePath = path.join(__dirname, './swagger', file);
			const fileData = await import(filePath);
			result = { ...result, ...fileData.default };
		}

		// load components.js separately and merge into the swagger document
		const componentsPath = path.join(__dirname, './swagger', 'components.js');
		const componentsData = await import(componentsPath);

		(swaggerDocument as any).paths = result;
		(swaggerDocument as any).components = componentsData.default.components;

		app.use(
			'/api-docs',
			(req: any, res: any, next: any) => {
				req.swaggerDoc = swaggerDocument;
				next();
			},
			swaggerUi.serveFiles(swaggerDocument, {
				swaggerOptions: { defaultModelsExpandDepth: -1 },
			}),
			swaggerUi.setup(),
		);

		Logger.info(`Swagger docs loaded.`);
	};

	loadSwaggerFiles();
} else {
	Logger.info('Swagger docs are disabled in production.');
}

// start server, default to port 3000 if not specified
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	Logger.info(`Server is running on port ${PORT}`);
});
