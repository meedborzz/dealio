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
import { motion } from 'framer-motion';

interface LoginPageProps {
}

const LoginPage: React.FC<LoginPageProps> = () => {
  const { signIn, user, userProfile, getRedirectPath, loading } = useAuth();
  const { preferences, updatePreferences } = usePreferences();
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
        // Successful login: Mark setup as completed for this device
        updatePreferences({ setupCompleted: true });

        // 1. Check for valid deep link redirect
        const storedRedirect = getRedirectPath();
        if (storedRedirect && !storedRedirect.startsWith('/admin') && !storedRedirect.startsWith('/business')) {
          window.location.href = storedRedirect;
          return;
        }

        // 2. Fetch role manually to decide destination
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
    <div className="min-h-dvh bg-background flex flex-col items-center">
      {/* Premium Purple Header (Unified with Registration) */}
      <div className="w-full bg-primary pt-safe pb-8 px-6 flex flex-col items-center relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-2xl" />

        <div className="w-full max-w-[440px] flex items-center justify-between relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="p-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 rounded-full transition-all"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2} />
          </motion.button>

          <Logo className="h-10 w-auto" />

          <div className="w-10"></div>
        </div>
      </div>

      <div className="w-full max-w-[440px] px-6 py-12 space-y-8 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              {t('auth.login.title', preferences.language)}
            </h2>
            <p className="text-muted-foreground font-medium">{t('auth.login.subtitle', preferences.language)}</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl">
              <p className="text-destructive text-sm font-semibold text-center">{error}</p>
            </div>
          )}

          <div className="bg-card rounded-[2.5rem] shadow-xl border border-border/40 p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-foreground/70 ml-1">
                  {t('auth.login.email', preferences.language)}
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-base"
                  placeholder={t('auth.login.email_placeholder', preferences.language)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-foreground/70 ml-1">
                  {t('auth.login.password', preferences.language)}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-5 py-3.5 pr-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-base"
                    placeholder={t('auth.login.password_placeholder', preferences.language)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={2} /> : <Eye className="h-5 w-5" strokeWidth={2} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-7 rounded-2xl text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>{t('auth.login.submitting', preferences.language)}</span>
                  </div>
                ) : (
                  t('auth.login.title', preferences.language)
                )}
              </Button>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-6"
        >
          <p className="text-muted-foreground font-medium text-sm mb-6">
            {t('auth.login.no_account', preferences.language)}
          </p>
          <button
            onClick={() => navigate('/register')}
            className="w-full py-4 border-2 border-border/50 text-foreground rounded-2xl font-bold bg-muted/30 hover:bg-muted/60 transition-all active:scale-[0.99]"
          >
            {t('auth.login.create_account', preferences.language)}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;