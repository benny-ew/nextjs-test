'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getUserInfoFromSession, getUserRolesFromSession } from '@/lib/authUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, User, ChevronDown } from 'lucide-react';

export function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const { logout } = useAuth();

  if (!session?.accessToken) return null;

  const userInfo = getUserInfoFromSession(session);
  const userRoles = getUserRolesFromSession(session);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white/90"
      >
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="h-3 w-3 text-blue-600" />
        </div>
        <span className="hidden sm:inline text-sm font-medium">
          {userInfo.name || userInfo.username || 'User'}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <Card className="absolute right-0 top-full mt-2 w-64 z-50 shadow-lg border-gray-200 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{userInfo.name || userInfo.username || 'User'}</p>
                  <p className="text-sm text-gray-500">{userInfo.email || 'No email'}</p>
                  {userRoles.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      Roles: {userRoles.join(', ')}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="pt-3">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
