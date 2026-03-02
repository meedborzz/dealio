import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'book' | 'save' | 'review' | 'message';
  onContinueAsGuest?: () => void;
  allowGuest?: boolean;
}

const ACTION_MESSAGES = {
  book: {
    title: 'Sign in to book',
    description: 'Create an account or sign in to complete your booking and manage your appointments.',
  },
  save: {
    title: 'Sign in to save',
    description: 'Create an account or sign in to save your favorite deals and get notified about new offers.',
  },
  review: {
    title: 'Sign in to review',
    description: 'Create an account or sign in to leave a review and help others make informed decisions.',
  },
  message: {
    title: 'Sign in to message',
    description: 'Create an account or sign in to chat with businesses directly.',
  },
};

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  onClose,
  action,
  onContinueAsGuest,
  allowGuest = false,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const { title, description } = ACTION_MESSAGES[action];

  const handleLogin = () => {
    onClose();
    navigate('/login', { state: { returnUrl: window.location.pathname } });
  };

  const handleRegister = () => {
    onClose();
    navigate('/registration', { state: { returnUrl: window.location.pathname } });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
        <Card className="rounded-t-3xl border-0 shadow-2xl max-w-lg mx-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">{title}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-muted-foreground mb-6">
              {description}
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleRegister}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                Create account
              </Button>

              <Button
                onClick={handleLogin}
                variant="outline"
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                Sign in
              </Button>

              {allowGuest && onContinueAsGuest && (
                <Button
                  onClick={() => {
                    onContinueAsGuest();
                    onClose();
                  }}
                  variant="ghost"
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  Continue as guest
                </Button>
              )}
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </Card>
      </div>
    </>
  );
};
