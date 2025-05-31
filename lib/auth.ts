/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from "moment";
import NextAuth, { AuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Define authentication options
export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 60 * 60, // 7 hours
    updateAge: 30 * 60, // 30 minutes
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      type: "credentials",
      name: "Keycloak",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { username, password } = credentials as {
            username: string;
            password: string;
          };

          const res = await fetch(
            `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "password",
                client_id: process.env.KEYCLOAK_CLIENT_ID!,
                client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
                scope: "openid email profile",
                username: username,
                password: password,
              }).toString(),
            }
          );

          if (!res.ok) {
            console.error("Keycloak authentication failed:", res.status, res.statusText);
            return null;
          }

          const data = await res.json();
          if (data.access_token) {
            return {
              id: username,
              username: username,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              expiresIn: data.expires_in,
              idToken: data.id_token,
            };
          }
          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      account,
      user,
    }: {
      token: any;
      account?: any;
      user?: any;
    }) {
      if (account?.provider === "credentials" && user) {
        // Store tokens and user info from Keycloak authentication
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          idToken: user.idToken,
          username: user.username,
          expiresIn: moment().add(user.expiresIn, "seconds").valueOf(),
        };
      }

      // Check if token will expire soon (5 minutes before expiry)
      if (
        token.expiresIn &&
        moment().add(5, "minutes").valueOf() > token.expiresIn &&
        token.refreshToken
      ) {
        try {
          console.log("Access token expired, refreshing...");

          // Send request to refresh token
          const res = await fetch(
            `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "refresh_token",
                client_id: process.env.KEYCLOAK_CLIENT_ID!,
                client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
                refresh_token: token.refreshToken,
              }).toString(),
            }
          );

          if (!res.ok) {
            console.error(
              "Failed to refresh token. Response status:",
              res.status
            );
            return {
              isExpired: true,
            };
          }

          const newToken = await res.json();
          console.log("Token refreshed successfully");

          // Update token with new values
          return {
            ...token,
            accessToken: newToken.access_token,
            refreshToken: newToken.refresh_token || token.refreshToken,
            idToken: newToken.id_token || token.idToken,
            expiresIn: moment().add(newToken.expires_in, "seconds").valueOf(),
          };
        } catch (error) {
          console.error("Error refreshing token:", error);
          return {
            isExpired: true,
          };
        }
      }

      // Check if token has expired
      if (token.expiresIn && moment().valueOf() > token.expiresIn) {
        console.warn("Session expired, logging out...");
        return {
          isExpired: true,
        };
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: any }) {
      if (!token || token.isExpired) {
        // If token is empty or expired, session is considered expired
        return {
          ...session,
          accessToken: "",
          refreshToken: "",
          expiresIn: 0,
        };
      }

      session.accessToken = token.accessToken || "";
      session.refreshToken = token.refreshToken || "";
      session.idToken = token.idToken || "";
      session.expiresIn = token.expiresIn || 0;
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Redirect to dashboard after successful login
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`;
      }
      // Allow relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  events: {
    async signOut() {
      console.log("User signed out.");
    },
    async session() {
      // Called whenever a session is checked
    },
  },
};
