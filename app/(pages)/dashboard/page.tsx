'use client';

import { useSession } from 'next-auth/react';
import { AuthGuard } from '@/components/AuthGuard';
import { UserProfile } from '@/components/UserProfile';
import { getUserInfoFromSession, getUserRolesFromSession } from '@/lib/authUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, Key } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();
  
  const userInfo = getUserInfoFromSession(session);
  const userRoles = getUserRolesFromSession(session);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back!</p>
              </div>
              <UserProfile />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Username:</strong> {userInfo.username || 'N/A'}
                </div>
                <div>
                  <strong>Name:</strong> {userInfo.name || 'N/A'}
                </div>
                <div>
                  <strong>Email:</strong> {userInfo.email || 'N/A'}
                </div>
              </CardContent>
            </Card>

            {/* Roles Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  User Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userRoles.length > 0 ? (
                  <ul className="space-y-1">
                    {userRoles.map((role, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {role}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No roles assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Session Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Session Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Status:</strong> {session ? 'Authenticated' : 'Not authenticated'}
                </div>
                <div>
                  <strong>Token:</strong> {session?.accessToken ? 'Valid' : 'Invalid'}
                </div>
                {session?.expiresIn && (
                  <div>
                    <strong>Expires:</strong> {new Date(session.expiresIn).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/tasks">
                  View Tasks
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/tasks/create">
                  Create New Task
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/api/test-keycloak">
                  Test Keycloak Connection
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
