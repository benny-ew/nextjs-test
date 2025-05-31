# Keycloak Authentication Integration

This project has been integrated with Keycloak authentication using NextAuth.js. The implementation follows the nigella-ui authentication pattern.

## Features Implemented

### 1. Authentication Flow
- **Keycloak Integration**: Uses NextAuth.js with Keycloak provider
- **JWT Token Management**: Automatic token refresh and validation
- **Session Management**: Persistent sessions with automatic logout on token expiry
- **Role-based Access**: Extracts user roles from JWT tokens

### 2. Components and Utils
- **AuthContext**: React context for authentication state management
- **AuthGuard**: Component to protect routes and redirect unauthenticated users
- **UserProfile**: Displays user information and logout functionality
- **authUtils**: Utility functions for JWT token parsing and user info extraction

### 3. API Integration
- **restClient**: Axios client with automatic token injection
- **Token Refresh**: Automatic refresh of expired tokens
- **Error Handling**: Proper handling of 401 errors and token expiry

## Environment Configuration

The following environment variables need to be configured in `.env.local`:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3002

# Keycloak Configuration (Server-side)
KEYCLOAK_BASE_URL=https://your-keycloak-server.com
KEYCLOAK_REALM=your-realm-name
KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_JWT_ALGORITHMS=RS256

# Public Keycloak Configuration (Client-side)
NEXT_PUBLIC_KEYCLOAK_BASE_URL=https://your-keycloak-server.com
NEXT_PUBLIC_KEYCLOAK_REALM=your-realm-name
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=your-client-id

# API Configuration
NEXT_PUBLIC_API_URL=http://your-api-server.com
```

## Usage

### Authentication Flow

1. **Login**: Users authenticate via the `/login` page using username/password
2. **Token Management**: JWT tokens are automatically managed by NextAuth.js
3. **Route Protection**: Protected routes use the `AuthGuard` component
4. **Logout**: Proper logout with Keycloak session termination

### Protected Routes

```tsx
import { AuthGuard } from '@/components/AuthGuard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      {/* Your protected content */}
    </AuthGuard>
  );
}
```

### Using Authentication Context

```tsx
import { useAuth } from '@/lib/auth/AuthContext';

export default function MyComponent() {
  const { session, login, logout, isAuthenticated, isLoading } = useAuth();
  
  // Your component logic
}
```

### Getting User Information

```tsx
import { useSession } from 'next-auth/react';
import { getUserInfoFromSession, getUserRolesFromSession } from '@/lib/authUtils';

export default function UserComponent() {
  const { data: session } = useSession();
  
  const userInfo = getUserInfoFromSession(session);
  const userRoles = getUserRolesFromSession(session);
  
  return (
    <div>
      <p>Username: {userInfo.username}</p>
      <p>Email: {userInfo.email}</p>
      <p>Roles: {userRoles.join(', ')}</p>
    </div>
  );
}
```

### API Calls with Authentication

```tsx
import restClient from '@/lib/restClient';

// Automatic token injection
const response = await restClient.get('/protected-endpoint');
```

## File Structure

```
lib/
├── auth/
│   └── AuthContext.tsx          # Authentication context
├── auth.ts                      # NextAuth configuration
├── authUtils.ts                 # JWT token utilities
└── restClient.ts                # Axios client with auth

components/
├── auth/
│   └── NextAuthProvider.tsx     # NextAuth provider wrapper
├── AuthGuard.tsx                # Route protection component
└── UserProfile.tsx              # User profile dropdown

app/
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts         # NextAuth API routes
│   └── test-keycloak/
│       └── route.ts             # Keycloak connection test
├── login/
│   └── page.tsx                 # Login page
└── dashboard/
    └── page.tsx                 # Protected dashboard
```

## Testing

### Test Keycloak Connection
Visit: `http://localhost:3002/api/test-keycloak`

### Test Authentication Flow
1. Visit the application root: `http://localhost:3002`
2. Click "Sign In" to go to login page
3. Use demo credentials or your Keycloak user
4. Verify redirection to dashboard

## Troubleshooting

### Common Issues

1. **401 Errors**: Check Keycloak server URL and credentials
2. **Token Refresh Failed**: Verify client secret and refresh token configuration
3. **CORS Issues**: Ensure Keycloak CORS settings allow your domain
4. **Session Not Persisting**: Check NEXTAUTH_SECRET and NEXTAUTH_URL

### Debug Mode

Enable debug logging by adding to your environment:
```bash
NEXTAUTH_DEBUG=true
```

## Production Considerations

1. **Environment Variables**: Ensure all production URLs are correctly set
2. **SSL/TLS**: Use HTTPS for all Keycloak and application URLs
3. **Session Security**: Use strong NEXTAUTH_SECRET in production
4. **Token Expiry**: Configure appropriate token lifetimes in Keycloak
5. **CORS**: Configure Keycloak CORS settings for your production domain

## Migration from Previous Auth

If migrating from the previous credentials-based auth:

1. Update environment variables to include Keycloak configuration
2. Replace credentials with Keycloak username/password
3. Update API calls to use the new `restClient`
4. Test all protected routes with the new authentication flow

## Dependencies Added

- `axios`: HTTP client for API calls
- `moment`: Date manipulation for token expiry
- `jwt-decode`: JWT token decoding

The authentication integration is now complete and ready for use with your Keycloak server!
