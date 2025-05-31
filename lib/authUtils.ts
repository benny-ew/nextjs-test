import { jwtDecode } from "jwt-decode";
import { Session } from "next-auth";

interface DecodedToken {
  resource_access?: {
    "monita-public-app"?: {
      roles?: string[];
    };
  };
  preferred_username?: string;
  name?: string;
  email?: string;
  [key: string]: unknown; // Allow other properties
}

/**
 * Extracts roles from the resource access in the JWT access token.
 * @param session - The NextAuth session object containing the accessToken.
 * @returns An array of roles or an empty array if not found or on error.
 */
export function getUserRolesFromSession(session: Session | null): string[] {
  if (!session?.accessToken) {
    console.warn("No access token found in session.");
    return [];
  }

  try {
    // Decode the JWT token
    const decodedToken = jwtDecode<DecodedToken>(session.accessToken);

    // Access the roles using bracket notation for the key with hyphens
    const roles = decodedToken?.resource_access?.["monita-public-app"]?.roles;

    // Check if roles exist and is an array
    if (Array.isArray(roles)) {
      return roles;
    } else {
      console.warn(
        "Roles not found or not in expected format in token:",
        decodedToken
      );
      return [];
    }
  } catch (error) {
    console.error("Error decoding token or accessing roles:", error);
    return []; // Return empty array on error
  }
}

/**
 * Extracts the user information (username, name, email) from the JWT access token.
 * @param session - The NextAuth session object containing the accessToken.
 * @returns An object containing user information or null values if not found or on error.
 */
export function getUserInfoFromSession(session: Session | null): {
  username: string | null;
  name: string | null;
  email: string | null;
} {
  if (!session?.accessToken) {
    console.warn("No access token found in session.");
    return {
      username: null,
      name: null,
      email: null,
    };
  }

  try {
    const decodedToken = jwtDecode<DecodedToken>(session.accessToken);
    return {
      username: decodedToken?.preferred_username ?? null,
      name: decodedToken?.name ?? null,
      email: decodedToken?.email ?? null,
    };
  } catch (error) {
    console.error("Error decoding token or accessing user info:", error);
    return {
      username: null,
      name: null,
      email: null,
    };
  }
}

/**
 * Constructs the Keycloak logout URL
 * @param session - The NextAuth session containing the accessToken
 * @returns The URL to redirect to for Keycloak logout
 */
export function getKeycloakLogoutUrl(session: Session | null): string {
  if (!session?.accessToken) {
    return "/login";
  }

  const keycloakBaseUrl = process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL || process.env.KEYCLOAK_BASE_URL;
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || process.env.KEYCLOAK_REALM;
  
  if (!keycloakBaseUrl || !realm) {
    console.warn("Keycloak configuration missing for logout URL");
    return "/login";
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const redirectUri = encodeURIComponent(`${baseUrl}/login`);
  
  return `${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/logout?redirect_uri=${redirectUri}`;
}

/**
 * Changes the user's password using Keycloak API
 * @param currentPassword - The user's current password
 * @param newPassword - The new password to set
 * @param session - The current session containing auth tokens
 * @returns Object with success status and error message if applicable
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
  session: Session | null
): Promise<{ success: boolean; message: string }> {
  if (!session?.accessToken) {
    return {
      success: false,
      message: "You must be logged in to change your password",
    };
  }

  try {
    const userInfo = getUserInfoFromSession(session);

    if (!userInfo.username) {
      return {
        success: false,
        message: "Could not determine username from the current session",
      };
    }

    // This endpoint allows a user to change their own password
    const response = await fetch(
      `${process.env.IDENTITY_SERVER}/realms/${process.env.REALM}/account/credentials/password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword: newPassword,
        }),
      }
    );

    if (response.ok) {
      return { success: true, message: "Password changed successfully" };
    } else {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        message:
          errorData?.errorMessage ||
          `Failed to change password: ${response.status} ${response.statusText}`,
      };
    }
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
