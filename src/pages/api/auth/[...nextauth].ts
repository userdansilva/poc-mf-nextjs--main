import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import AzureADB2CProvider from "next-auth/providers/azure-ad-b2c";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADB2CProvider({
      tenantId: process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME,
      clientId: process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET as string,
      primaryUserFlow: process.env.NEXT_PUBLIC_AZURE_AD_B2C_PRIMARY_USER_FLOW,
      authorization: { params: { scope: "offline_access openid" } },
    })
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // Allows Azure B2C logout URL
      if (new URL(url).origin === `https://${process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME}.b2clogin.com`) {
        return url;
      }

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl;
    },
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.id_token,
          expiresAt: Date.now()
            + (account.id_token_expires_in as number * 1000),
          refreshToken: account.refresh_token,
        };
      }

      // Para revalidar a cada 1 min use 60 * 4 * 1000 // 4 min
      if ((token.expiresAt as number - Date.now()) > (60 * 1000)) { // 1 min
        return token;
      }

      try {
        const response = await fetch(`https://${process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.NEXT_PUBLIC_AZURE_AD_B2C_PRIMARY_USER_FLOW}/oauth2/v2.0/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID as string,
            client_secret: process.env.AZURE_AD_B2C_CLIENT_SECRET as string,
            refresh_token: token.refreshToken as string,
          }),
        });

        const tokens = await response.json();

        if (tokens.error) {
          throw tokens;
        }

        return {
          ...token,
          accessToken: tokens.id_token,
          expiresAt: Date.now() + (tokens.id_token_expires_in * 1000),
          refreshToken: tokens.refresh_token,
        };
      } catch (error) {
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    // O session abaixo só é necessário caso o main MF precise acessar algum dado
    // do usuário autenticado, que não seria recomendado
    async session({ session, token }) {
      session.accessToken = token.accessToken;

      if (token.error) {
        session.error = token.error;
      }

      return session;
    },
  },
  session: {
    // Tempo máximo que é possível fazer o token refresh
    maxAge: 60 * (process.env.TOKEN_REFRESH_MAX_AGE ? parseInt(process.env.TOKEN_REFRESH_MAX_AGE) : 59), // 59 minutes
  },
}

export default NextAuth(authOptions);

/** types */
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"]
    accessToken: string
    error?: "RefreshAccessTokenError"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string
    error?: "RefreshAccessTokenError"
  }
}
