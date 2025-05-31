"use client";

import React, { createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { getKeycloakLogoutUrl } from "../authUtils";

interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error("Login error:", result.error);
        return false;
      }

      if (result?.ok) {
        // Check if there's a stored redirect path
        // const redirectPath =
        //   typeof window !== "undefined"
        //     ? sessionStorage.getItem("redirectAfterLogin")
        //     : null;

        // if (redirectPath) {
        //   sessionStorage.removeItem("redirectAfterLogin");
        //   router.push(redirectPath);
        // } else {
          router.push("/dashboard");
        //}
      }

      return result?.ok || false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Get Keycloak logout URL to clear Keycloak session
      //const keycloakLogoutUrl = getKeycloakLogoutUrl(session);

      // First, sign out from NextAuth
      await signOut({ redirect: false });

      // Clear any local session storage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("redirectAfterLogin");
        localStorage.clear();
      }

    // Then redirect to Keycloak logout endpoint which will redirect back to login
    //   if (typeof window !== "undefined" && keycloakLogoutUrl && keycloakLogoutUrl !== "/login") {
    //     window.location.href = keycloakLogoutUrl;
    //   } else {
    //     // Direct redirect to login page
        router.push("/login");
    //}
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback to login page on any error
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        status,
        login,
        logout,
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
