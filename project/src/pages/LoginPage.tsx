import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../hooks/useAuth';
import { usePreferences } from '../hooks/usePreferences';
import { t } from '@/lib/i18n';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
}

const LoginPage: React.FC<LoginPageProps> = () => {
  const { signIn, user, userProfile, getRedirectPath, loading } = useAuth();
  const { preferences } = usePreferences();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: signInError } = await signIn(email, password);

      if (signInError) {
        setError((signInError as any).message || t('auth.login.error', preferences.language));
        setIsLoading(false);
      } else {
        // Force a full page reload to ensure clean state
        // 1. Check for valid deep link redirect
        const storedRedirect = getRedirectPath();
        if (storedRedirect && !storedRedirect.startsWith('/admin') && !storedRedirect.startsWith('/business')) {
          window.location.href = storedRedirect;
          return;
        }

        // 2. Fetch role manually to decide destination
        // We do this manually because useAuth state might not be updated yet
        // and we are about to reload the page anyway.
        if (data?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();

          const role = (profile as any)?.role;

          if (role === 'admin') {
            window.location.href = '/admin';
          } else if (role === 'business_owner') {
            window.location.href = '/business';
          } else {
            window.location.href = '/';
          }
        } else {
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      setError(err.message || t('auth.login.error', preferences.language));
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    // Only handle redirects for already logged-in users who land here
    if (loading) return;

    if (user && !isLoading) {
      // User is already logged in (e.g. from session persistence), redirect them
      const redirectTo = getRedirectPath();
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        return;
      }

      if (userProfile?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userProfile?.role === 'business_owner') {
        navigate('/business', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, userProfile, loading, navigate, getRedirectPath]);


  if (isLoading && !error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary flex items-center justify-between p-4">
        <button onClick={() => navigate('/')} className="p-2 text-primary-foreground hover:bg-primary-foreground/20 rounded-full transition-colors">
          <ArrowLeft className="h-6 w-6" strokeWidth={1.75} />
        </button>
        <Logo className="h-10 w-10" />
        <div className="w-10"></div>
      </div>

      <div className="p-6 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            {t('auth.login.title', preferences.language)}
          </h2>
          <p className="text-muted-foreground">{t('auth.login.subtitle', preferences.language)}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-muted border border-border rounded-2xl">
            <p className="text-foreground text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('auth.login.email', preferences.language)}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg"
              placeholder={t('auth.login.email_placeholder', preferences.language)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('auth.login.password', preferences.language)}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 rounded-lg"
                placeholder={t('auth.login.password_placeholder', preferences.language)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.75} /> : <Eye className="h-5 w-5" strokeWidth={1.75} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>{t('auth.login.submitting', preferences.language)}</span>
              </div>
            ) : (
              t('auth.login.title', preferences.language)
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            {t('auth.login.no_account', preferences.language)}
          </p>
          <button
            onClick={() => navigate('/register')}
            className="w-full border border-border text-foreground py-3 rounded-2xl font-medium hover:bg-muted transition-all duration-150 ease"
          >
            {t('auth.login.create_account', preferences.language)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;