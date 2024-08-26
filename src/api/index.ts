import fs from "fs";
import path from "path";

import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import swaggerUi from "swagger-ui-express";

import { redisSessionStore } from "./databases/redis";
import { initializeDatabase as initializeSqlDatabase } from "./databases/sql/sql";
import authRoutes from "./routes/authRoutes";
import themeRoutes from "./routes/themeRoutes";
import userRoutes from "./routes/userRoutes";
import { setUpMinioBucket } from "./services/minioService";
import swaggerDocument from "./swagger";

// load env variables
dotenv.config();

// enable express session debugging if not in prod
if (process.env.NODE_ENV !== "production") {
  process.env.DEBUG = "express-session";
}

// initialize database
initializeSqlDatabase();

// setup minio bucket
setUpMinioBucket();

const app = express();

// handle cors
app.use(
  cors({
    origin: process.env.FRONTEND_WEBSITE_URL,
    credentials: true,
  }),
);
app.use(bodyParser.json());

// needed to ensure correct protocol due to nginx proxies
app.set("trust proxy", true);

// handles user session
app.use(
  session({
    store: redisSessionStore,
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      // if developing locally, set to insecure
      secure: process.env.NODE_ENV !== "development",
      // in production, use "lax" as frontend and backend have the same root domain
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "none",
      // if not in production, leave domain as undefined
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.FRONTEND_WEBSITE_DOMAIN
          : undefined,
      // expire after 3 months (milliseconds)
      maxAge: 7776000000,
    },
  }),
);

// handle routes
const API_PREFIX = `/api/${process.env.API_VERSION}`;
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/themes`, themeRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);

// load the swagger docs only if not in production
if (process.env.NODE_ENV !== "production") {
  const tsFilesInDir = fs
    .readdirSync(path.join(__dirname, "./swagger"))
    .filter((file) => path.extname(file) === ".js");
  let result = {};

  const loadSwaggerFiles = async () => {
    for (const file of tsFilesInDir) {
      const filePath = path.join(__dirname, "./swagger", file);
      const fileData = await import(filePath);
      result = { ...result, ...fileData.default };
    }

    (swaggerDocument as any).paths = result;

    app.use(
      "/api-docs",
      (req: any, res: any, next: any) => {
        req.swaggerDoc = swaggerDocument;
        next();
      },
      swaggerUi.serveFiles(swaggerDocument),
      swaggerUi.setup(),
    );

    console.info(`Swagger docs loaded.`);
  };

  loadSwaggerFiles();
} else {
  console.info("Swagger docs are disabled in production.");
}

// start server, default to port 3000 if not specified
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.info(`Server is running on port ${PORT}`);
});
