import { type NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@prisma/client";

import prisma from "./prisma";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: requiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requiredEnv("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
        const role = (user as { role?: Role | null }).role;
        if (role) {
          session.user.role = role;
        }
      }
      return session;
    },
  },
};

