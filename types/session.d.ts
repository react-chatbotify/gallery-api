import "express-session";

declare module "express-session" {
  export interface SessionData {
    userId: string;
    provider: string;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    // eslint-disable-next-line no-undef
    userData: UserData;
  }
}
