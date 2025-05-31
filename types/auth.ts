import { DefaultSession } from "next-auth"

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'demo';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}
