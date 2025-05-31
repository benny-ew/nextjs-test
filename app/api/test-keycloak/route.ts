import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Test Keycloak connectivity
    const keycloakUrl = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/.well-known/openid-configuration`;
    
    const response = await fetch(keycloakUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          error: "Keycloak connection failed", 
          status: response.status,
          url: keycloakUrl 
        },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      message: "Keycloak connection successful",
      issuer: data.issuer,
      authorization_endpoint: data.authorization_endpoint,
      token_endpoint: data.token_endpoint,
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Failed to connect to Keycloak", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
