'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { loginFormSchema } from '@/lib/schemas';
import { LogIn, User, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      setIsLoading(true);
      
      const success = await login(data.username, data.password);

      if (!success) {
        setLoginError('Invalid username or password');
        return;
      }
    } catch (error) {
      setLoginError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <LogIn className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome Back
            </CardTitle>
            <p className="text-gray-600">
              Sign in to access your task board
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {loginError && (
                <ErrorMessage message={loginError} />
              )}

              <FormField
                id="username"
                label="Username"
                type="text"
                placeholder="Enter your username"
                registration={register('username')}
                error={errors.username?.message}
                icon={<User className="h-4 w-4" />}
              />

              <div className="relative">
                <FormField
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  registration={register('password')}
                  error={errors.password?.message}
                  icon={<Lock className="h-4 w-4" />}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isLoading}
              >
                {(isSubmitting || isLoading) ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h3>
              <div className="space-y-1 text-xs text-blue-700">
                <div><strong>Username:</strong> demo</div>
                <div><strong>Password:</strong> password123</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
