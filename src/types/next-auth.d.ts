import { type DefaultSession, type DefaultUser } from "next-auth";
import { type Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role?: Role;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: Role;
  }
}
