import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, hasDatabase } from "@/lib/db";

const hasGitHub = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);

// Auth.js v5. Degrades gracefully: with no GitHub credentials the providers
// list is empty (sign in is unavailable but the app still builds and runs as a
// guest in dev). With a database, sessions persist via the Prisma adapter.
export const authConfig: NextAuthConfig = {
  adapter: hasDatabase() ? PrismaAdapter(prisma) : undefined,
  session: { strategy: hasDatabase() ? "database" : "jwt" },
  trustHost: true,
  providers: hasGitHub
    ? [
        GitHub({
          clientId: process.env.AUTH_GITHUB_ID,
          clientSecret: process.env.AUTH_GITHUB_SECRET,
          authorization: { params: { scope: "read:user user:email" } },
        }),
      ]
    : [],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = (user?.id ?? token?.sub) as string;
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

export const authEnabled = hasGitHub;
