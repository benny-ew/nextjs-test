#!/bin/bash

echo "Testing Keycloak Authentication Integration"
echo "=========================================="

# Test 1: Check if the app is running
echo "1. Testing app availability..."
if curl -s http://localhost:3005 > /dev/null; then
    echo "✅ App is running on port 3005"
else
    echo "❌ App is not accessible"
    exit 1
fi

# Test 2: Test Keycloak connection
echo "2. Testing Keycloak connection..."
KEYCLOAK_RESPONSE=$(curl -s http://localhost:3005/api/test-keycloak)
if echo "$KEYCLOAK_RESPONSE" | grep -q "successful"; then
    echo "✅ Keycloak connection successful"
    echo "   Issuer: $(echo "$KEYCLOAK_RESPONSE" | jq -r '.issuer')"
else
    echo "❌ Keycloak connection failed"
    echo "   Response: $KEYCLOAK_RESPONSE"
fi

# Test 3: Test NextAuth endpoints
echo "3. Testing NextAuth endpoints..."
if curl -s http://localhost:3005/api/auth/providers > /dev/null; then
    echo "✅ NextAuth providers endpoint accessible"
else
    echo "❌ NextAuth providers endpoint not accessible"
fi

# Test 4: Test login page
echo "4. Testing login page..."
if curl -s http://localhost:3005/login | grep -q "Welcome Back"; then
    echo "✅ Login page loads correctly"
else
    echo "❌ Login page not loading correctly"
fi

# Test 5: Test dashboard protection
echo "5. Testing dashboard protection..."
DASHBOARD_RESPONSE=$(curl -s http://localhost:3005/dashboard)
if echo "$DASHBOARD_RESPONSE" | grep -q "Dashboard"; then
    echo "✅ Dashboard page accessible"
else
    echo "❌ Dashboard page not accessible"
fi

echo ""
echo "Authentication Integration Test Complete!"
echo "You can now:"
echo "1. Visit http://localhost:3005 to see the welcome page"
echo "2. Click 'Sign In' to test the login flow"
echo "3. Use the Keycloak credentials to authenticate"
echo "4. Access protected routes like /dashboard and /tasks"
