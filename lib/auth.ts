import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { formatResidentName } from "@/lib/constants";

/**
 * Auth.js Credentials cannot persist adapter-backed database sessions.
 * JWT carries a sessionVersion; incrementing it (or suspending the user)
 * immediately invalidates every existing session.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: { resident: true },
        });
        if (!user) return null;

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null;
        }

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) {
          const fails = user.failedLoginCount + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: fails,
              lockedUntil:
                fails >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
            },
          });
          return null;
        }

        if (user.status === "SUSPENDED") return null;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginCount: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.resident
            ? formatResidentName(user.resident)
            : user.email,
          role: user.role,
          status: user.status,
          sessionVersion: user.sessionVersion,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.status = user.status;
        token.sessionVersion = user.sessionVersion;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.sub) return session;

      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        include: { resident: true },
      });

      if (
        !dbUser ||
        dbUser.status === "SUSPENDED" ||
        dbUser.sessionVersion !== token.sessionVersion
      ) {
        return {
          ...session,
          user: {
            ...session.user,
            id: "",
            role: "RESIDENT",
            status: "SUSPENDED",
            mustChangePassword: false,
          },
        };
      }

      session.user.id = dbUser.id;
      session.user.email = dbUser.email;
      session.user.role = dbUser.role;
      session.user.status = dbUser.status;
      session.user.mustChangePassword = dbUser.mustChangePassword;
      session.user.name = dbUser.resident
        ? formatResidentName(dbUser.resident)
        : dbUser.email;
      return session;
    },
  },
});
