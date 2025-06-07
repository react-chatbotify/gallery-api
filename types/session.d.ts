import 'express-session';
import { SwaggerOptions } from 'swagger-ui-express';

declare module 'express-session' {
  export interface SessionData {
    userId: string;
    provider: string;
    oAuthState?: string;
    postLoginRedirectUrl: string;
    csrfToken: string;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    swaggerDoc: SwaggerOptions;
    userData: UserData;
  }
}
