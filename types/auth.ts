import { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    expiresIn: number;
  }

  interface User extends DefaultUser {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    expiresIn: number;
    username: string;
  }

  interface JWT {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    expiresIn: number;
    username: string;
  }
}
