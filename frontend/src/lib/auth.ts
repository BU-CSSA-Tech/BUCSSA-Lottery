import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from 'jsonwebtoken';

const ADMIN_EMAILS: string[] = ['bucssatech@gmail.com'];
const DISPLAY_EMAILS: string[] = [
  'jijicandlehouse@gmail.com',
  'notm477h3w@gmail.com',
  'zzzzky999@gmail.com',
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

function resolveRoles(email: string): { isAdmin: boolean; isDisplay: boolean } {
  const isCodePlayer = email.startsWith('player:');
  if (isCodePlayer) {
    return { isAdmin: false, isDisplay: false };
  }
  return {
    isAdmin: ADMIN_EMAILS.includes(email),
    isDisplay: DISPLAY_EMAILS.includes(email),
  };
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "player-code",
      name: "Player Code",
      credentials: {
        code: { label: "Code", type: "text" },
        playerId: { label: "Player ID", type: "text" },
      },
      async authorize(credentials) {
        const code = credentials?.code?.trim();
        const playerId = credentials?.playerId?.trim();

        if (!code || !playerId) {
          return null;
        }

        const res = await fetch(`${API_BASE}/api/auth/verify-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, playerId }),
        });

        if (!res.ok) {
          return null;
        }

        const data = await res.json();

        return {
          id: data.playerId,
          email: data.internalEmail,
          name: data.displayName,
        };
      },
    }),
    CredentialsProvider({
      id: "staff-credentials",
      name: "Staff Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const adminPassword = process.env.STAFF_ADMIN_PASSWORD;
        const displayPassword = process.env.STAFF_DISPLAY_PASSWORD;

        const isAdmin = ADMIN_EMAILS.includes(email);
        const isDisplay = DISPLAY_EMAILS.includes(email);

        if (isAdmin && adminPassword && password === adminPassword) {
          return { id: email, email, name: email };
        }

        if (isDisplay && displayPassword && password === displayPassword) {
          return { id: email, email, name: email };
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  // No DB adapter: use JWT session + hardcoded role whitelist.
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        try {
          token.id = token.sub || user.id || "";

          const email = user.email || "";
          const { isAdmin, isDisplay } = resolveRoles(email);
          token.isAdmin = isAdmin;
          token.isDisplay = isDisplay;
          token.name = user.name ?? token.name;

          const accessToken = jwt.sign(
            { email: user.email, isAdmin, isDisplay, id: token.id },
            process.env.JWT_SECRET!,
            { expiresIn: '30d', issuer: 'lottery-frontend', audience: 'lottery-backend' }
          );
          token.accessToken = accessToken;
        } catch {
          token.isAdmin = false;
          token.isDisplay = false;
          token.accessToken = null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      // 将用户ID添加到jwt令牌中
      if (token && session.user) {
        session.user.id = String(token.sub || token.id || "");
        session.user.isAdmin = Boolean(token.isAdmin);
        session.user.isDisplay = Boolean(token.isDisplay);
        session.user.accessToken = String(token.accessToken) || null;
        if (token.name) {
          session.user.name = String(token.name);
        }
      }

      return session;
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/play`;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/play", // 新用户默认重定向到 /play
  },
  debug: true,
};
