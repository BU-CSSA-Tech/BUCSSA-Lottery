import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import jwt from 'jsonwebtoken';

const ADMIN_EMAILS: string[] = ['bucssatech@gmail.com'];
const DISPLAY_EMAILS: string[] = ['jijicandlehouse@gmail.com', 'notm477h3w@gmail.com'];

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    })
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
          // Use token.sub instead of user.id
          token.id = token.sub || user.id || "";

          const email = user.email || "";
          const isAdmin = email ? ADMIN_EMAILS.includes(email) : false;
          const isDisplay = email ? DISPLAY_EMAILS.includes(email) : false;
          token.isAdmin = isAdmin;
          token.isDisplay = isDisplay;

          const accessToken = jwt.sign({ email: user.email, isAdmin: isAdmin, isDisplay: isDisplay, id: token.id }, process.env.JWT_SECRET!, { expiresIn: '30d', issuer: 'lottery-frontend', audience: 'lottery-backend' });
          token.accessToken = accessToken;

        } catch (error) {
          // Don't fail the whole authentication - set defaults
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
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
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