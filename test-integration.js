#!/usr/bin/env node

/**
 * Integration Test Script for Keycloak Authentication
 * 
 * This script tests the complete authentication flow from the nigella-ui integration
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

async function testKeycloakConnection() {
  console.log('🔍 Testing Keycloak Connection...');
  try {
    const response = await axios.get(`${BASE_URL}/api/test-keycloak`);
    console.log('✅ Keycloak Connection:', response.data.message);
    console.log('📋 Issuer:', response.data.issuer);
    console.log('🔗 Auth Endpoint:', response.data.authorization_endpoint);
    console.log('🎫 Token Endpoint:', response.data.token_endpoint);
    return true;
  } catch (error) {
    console.error('❌ Keycloak Connection Failed:', error.message);
    return false;
  }
}

async function testApplicationRoutes() {
  console.log('\n🌐 Testing Application Routes...');
  const routes = [
    { path: '/', name: 'Landing Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/dashboard', name: 'Dashboard (Protected)' },
    { path: '/tasks', name: 'Tasks Page (Protected)' }
  ];

  for (const route of routes) {
    try {
      const response = await axios.get(`${BASE_URL}${route.path}`, {
        validateStatus: () => true // Accept all status codes
      });
      
      if (response.status === 200) {
        console.log(`✅ ${route.name}: Available`);
      } else if (response.status === 307 || response.status === 302) {
        console.log(`🔄 ${route.name}: Redirecting (Expected for protected routes)`);
      } else {
        console.log(`⚠️  ${route.name}: Status ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ ${route.name}: ${error.message}`);
    }
  }
}

async function testAPIEndpoints() {
  console.log('\n🔧 Testing API Endpoints...');
  const endpoints = [
    { path: '/api/auth/session', name: 'Session Endpoint' },
    { path: '/api/test-keycloak', name: 'Keycloak Test' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint.path}`, {
        validateStatus: () => true
      });
      console.log(`✅ ${endpoint.name}: Status ${response.status}`);
    } catch (error) {
      console.error(`❌ ${endpoint.name}: ${error.message}`);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Integration Tests for Keycloak Authentication\n');
  
  const keycloakOk = await testKeycloakConnection();
  
  if (!keycloakOk) {
    console.log('\n❌ Keycloak connection failed. Please check your environment configuration.');
    return;
  }
  
  await testApplicationRoutes();
  await testAPIEndpoints();
  
  console.log('\n✨ Integration tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Open http://localhost:3005 in your browser');
  console.log('   2. Click "Sign In" to test the authentication flow');
  console.log('   3. Use your Keycloak credentials to log in');
  console.log('   4. Verify that you can access protected routes like /dashboard and /tasks');
  console.log('   5. Test the logout functionality');
}

runTests().catch(console.error);
