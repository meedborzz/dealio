import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Building2, Check, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePreferences } from '../hooks/usePreferences';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { categories as importedCategories, cities } from '../data/mockData';
import Logo from '../components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FEATURES } from '../config/features';
import { getDefaultCity, isLaunchModeActive } from '../config/launchMode';
import { getAvailableCategories } from '../config/servicePresets';
import { getAvailableCities } from '../config/location';
import { getGuestBookingTokens, clearGuestBookings } from '../lib/guestBookings';
import { getGuestSessionId, clearGuestSession } from '../lib/guestSession';

interface RegistrationPageProps {
}

type UserType = 'client' | 'business';
type BusinessStep = 'info' | 'verification';

interface BusinessFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  category: string;
}

const RegistrationPage: React.FC<RegistrationPageProps> = () => {
  const { signUp, refreshProfile } = useAuth();
  const { updatePreferences } = usePreferences();
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [currentStep, setCurrentStep] = useState<BusinessStep>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showBusinessPassword, setShowBusinessPassword] = useState(false);
  const [showBusinessConfirmPassword, setShowBusinessConfirmPassword] = useState(false);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'business') {
      setUserType('business');
    } else if (typeParam === 'personal' || typeParam === 'client') {
      setUserType('client');
    }
  }, [searchParams]);

  // Client registration data
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Business registration data
  const [businessData, setBusinessData] = useState<BusinessFormData>({
    name: '',
    description: '',
    address: '',
    city: getDefaultCity(),
    phone: '',
    email: '',
    website: '',
    category: '',
  });

  const [businessPassword, setBusinessPassword] = useState('');
  const [businessConfirmPassword, setBusinessConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const availableCategories = getAvailableCategories();
  const categories = availableCategories.map(cat => {
    const originalCat = importedCategories.find(c => c.id === cat.id);
    return {
      id: cat.id,
      name: cat.name,
      icon: originalCat?.icon || ''
    };
  });

  const navigate = useNavigate();

  const handleReferralReward = async (newUserId: string, referrerId: string) => {
    if (!FEATURES.WALLET) return;

    try {
      await supabase.rpc('add_wallet_transaction', {
        p_user_id: newUserId,
        p_transaction_type: 'referral',
        p_amount: 20,
        p_description: 'Bonus de parrainage - Bienvenue!'
      });

      await supabase.rpc('add_wallet_transaction', {
        p_user_id: referrerId,
        p_transaction_type: 'referral',
        p_amount: 20,
        p_description: 'Bonus de parrainage - Merci d\'avoir invité un ami!'
      });
    } catch (error) {
      console.error('Error processing referral reward:', error);
    }
  };

  const handleClientRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clientData.password !== clientData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await signUp(clientData.email, clientData.password, clientData.name);
      if (error) throw error;

      // Ensure user profile is created with 'client' role
      if (data.user) {
        // Check if user was referred
        let referredBy = null;
        if (referralCode.trim()) {
          const { data: referrer } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('referral_code', referralCode.trim().toUpperCase())
            .single();

          if (referrer) {
            referredBy = referrer.id;
          }
        }

        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            full_name: clientData.name,
            role: 'client',
            referral_code: 'DEAL' + data.user.id.substring(0, 6).toUpperCase(),
            referred_by: referredBy
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('Client profile creation error:', profileError);
          throw new Error(`Erreur lors de la création du profil client: ${profileError.message}`);
        }

        if (FEATURES.WALLET) {
          setTimeout(async () => {
            await supabase.rpc('add_wallet_transaction', {
              p_user_id: data.user.id,
              p_transaction_type: 'welcome',
              p_amount: 20,
              p_description: 'Bonus de bienvenue - Merci de rejoindre Dealio!'
            });

            if (referredBy) {
              await handleReferralReward(data.user.id, referredBy);
            }
          }, 2000);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        await refreshProfile();

        const guestSessionId = getGuestSessionId();
        const bookingTokens = getGuestBookingTokens();

        if (guestSessionId || bookingTokens.length > 0) {
          try {
            const { data: transferCount, error: transferError } = await supabase.rpc(
              'transfer_guest_bookings_to_user',
              {
                p_user_id: data.user.id,
                p_guest_session_id: guestSessionId,
                p_booking_tokens: bookingTokens.length > 0 ? bookingTokens : null
              }
            );

            if (!transferError && transferCount > 0) {
              clearGuestBookings();
              clearGuestSession();

              setSuccessMessage(`Bienvenue! ${transferCount} réservation${transferCount > 1 ? 's ont été liées' : ' a été liée'} à votre compte.`);

              updatePreferences({ setupCompleted: true, userType: 'personal' });

              setTimeout(() => {
                navigate('/bookings');
              }, 2000);
              return;
            }
          } catch (err) {
            console.error('Error transferring bookings:', err);
          }
        }
      }

      updatePreferences({ setupCompleted: true, userType: 'personal' });
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessRegistration = async () => {
    if (businessPassword !== businessConfirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // First try to sign up
      let authData, authError;
      const signUpResult = await signUp(
        businessData.email,
        businessPassword,
        businessData.name
      );

      authData = signUpResult.data;
      authError = signUpResult.error;

      // Handle specific errors
      if (authError) {
        if (authError.message.includes('over_email_send_rate_limit')) {
          throw new Error('Trop de tentatives d\'inscription. Veuillez attendre quelques minutes avant de réessayer.');
        } else if (authError.message.includes('email_address_invalid')) {
          throw new Error('Adresse email invalide. Veuillez vérifier le format de votre email.');
        } else if (authError.message.includes('User already registered')) {
          throw new Error('Un compte existe déjà avec cet email. Veuillez vous connecter ou utiliser un autre email.');
        } else {
          throw authError;
        }
      }

      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get current session to ensure we have a user
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || authData?.user;

      if (currentUser) {
        console.log('Creating business for user:', currentUser.id);

        // Insert into user_profiles table with 'business_owner' role
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: currentUser.id,
            full_name: businessData.name,
            phone: businessData.phone,
            role: 'business_owner'
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('User profile creation error:', profileError);
          throw new Error(`Erreur lors de la création du profil utilisateur: ${profileError.message}`);
        }

        const { error: businessError } = await supabase
          .from('businesses')
          .insert({
            name: businessData.name,
            description: businessData.description,
            address: businessData.address,
            city: businessData.city,
            phone: businessData.phone,
            email: businessData.email,
            website: businessData.website,
            category: businessData.category,
            owner_id: currentUser.id,
            rating: 0,
            review_count: 0,
            commission_rate: 0.15,
            total_commission_owed: 0,
            total_validated_bookings: 0,
            status: 'pending'
          });

        if (businessError) {
          console.error('Business creation error:', businessError);
          if (businessError.message.includes('row-level security policy')) {
            throw new Error('Erreur de permissions. Veuillez vous reconnecter et réessayer.');
          }
          throw new Error(`Erreur lors de la création de l'établissement: ${businessError.message}`);
        }

        await refreshProfile();

        const guestSessionId = getGuestSessionId();
        const bookingTokens = getGuestBookingTokens();

        if (guestSessionId || bookingTokens.length > 0) {
          try {
            const { data: transferCount, error: transferError } = await supabase.rpc(
              'transfer_guest_bookings_to_user',
              {
                p_user_id: currentUser.id,
                p_guest_session_id: guestSessionId,
                p_booking_tokens: bookingTokens.length > 0 ? bookingTokens : null
              }
            );

            if (!transferError && transferCount > 0) {
              clearGuestBookings();
              clearGuestSession();

              setSuccessMessage(`Bienvenue! ${transferCount} réservation${transferCount > 1 ? 's ont été liées' : ' a été liée'} à votre compte.`);

              updatePreferences({ setupCompleted: true, userType: 'business' });

              setTimeout(() => {
                navigate('/bookings');
              }, 2000);
              return;
            }
          } catch (err) {
            console.error('Error transferring bookings:', err);
          }
        }
      } else {
        throw new Error('Session utilisateur non trouvée. Veuillez réessayer.');
      }

      updatePreferences({ setupCompleted: true, userType: 'business' });
      navigate('/business/intro');
    } catch (error: any) {
      console.error('Business registration error:', error);
      setError(error.message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserTypeSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-foreground">Bienvenue sur Dealio</h2>
        <p className="text-muted-foreground font-medium">Choisissez votre univers pour continuer</p>
      </div>

      <div className="flex flex-col space-y-4">
        {/* Client Option - Minimalist & Mobile Optimized */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setUserType('client')}
          className="w-full flex items-center p-6 rounded-2xl border-2 border-border/40 bg-card hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
        >
          <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mr-5 shrink-0 group-hover:scale-105 transition-transform">
            <User className="h-7 w-7 text-background" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-0.5">Je suis un Client</h3>
            <p className="text-sm text-muted-foreground font-medium">
              Trouvez et réservez les meilleures offres.
            </p>
          </div>
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
            className="text-muted-foreground/30"
          >
            <Check className="h-6 w-6" strokeWidth={3} />
          </motion.div>
        </motion.button>

        {/* Business Option - Minimalist & Mobile Optimized */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setUserType('business')}
          className="w-full flex items-center p-6 rounded-2xl border-2 border-border/40 bg-card hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mr-5 shrink-0 group-hover:scale-105 transition-transform">
            <Building2 className="h-7 w-7 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-0.5">Je suis un Pro</h3>
            <p className="text-sm text-muted-foreground font-medium">
              Gérez votre activité et vos réservations.
            </p>
          </div>
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
            className="text-muted-foreground/30"
          >
            <Check className="h-6 w-6" strokeWidth={3} />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );

  const renderClientRegistration = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Inscription Client</h2>
        <p className="text-muted-foreground">Créez votre compte pour commencer</p>
      </div>

      <form onSubmit={handleClientRegistration} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nom complet *
          </label>
          <Input
            type="text"
            value={clientData.name}
            onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Votre nom complet"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email *
          </label>
          <Input
            type="email"
            value={clientData.email}
            onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
            required
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Mot de passe *
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={clientData.password}
              onChange={(e) => setClientData(prev => ({ ...prev, password: e.target.value }))}
              required
              placeholder="Minimum 6 caractères"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Confirmer le mot de passe *
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={clientData.confirmPassword}
              onChange={(e) => setClientData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
              placeholder="Confirmez votre mot de passe"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {FEATURES.REFERRAL && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Code de parrainage (optionnel)
            </label>
            <Input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="DEALXXXXXX"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-6"
        >
          {isLoading ? 'Création du compte...' : 'Créer mon compte'}
        </Button>
      </form>
    </div>
  );

  const renderBusinessInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Informations de votre établissement</h2>
        <p className="text-muted-foreground">Inscription gratuite - Commission uniquement sur les ventes validées</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nom de l'établissement *
          </label>
          <Input
            type="text"
            value={businessData.name}
            onChange={(e) => setBusinessData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Salon de beauté Chic & Style"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Catégorie *
          </label>
          <select
            value={businessData.category}
            onChange={(e) => setBusinessData(prev => ({ ...prev, category: e.target.value }))}
            required
            className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="">Sélectionnez une catégorie</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Ville *
          </label>
          <select
            value={businessData.city}
            onChange={(e) => setBusinessData(prev => ({ ...prev, city: e.target.value }))}
            required
            disabled={isLaunchModeActive()}
            className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="">Sélectionnez une ville</option>
            {(isLaunchModeActive() ? getAvailableCities() : cities).map(city => {
              const cityName = typeof city === 'string' ? city : city;
              return <option key={cityName} value={cityName}>{cityName}</option>;
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Téléphone *
          </label>
          <Input
            type="tel"
            value={businessData.phone}
            onChange={(e) => setBusinessData(prev => ({ ...prev, phone: e.target.value }))}
            required
            placeholder="+212 5XX XXX XXX"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            Adresse complète *
          </label>
          <Input
            type="text"
            value={businessData.address}
            onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value }))}
            required
            placeholder="123 Rue Mohammed V, Quartier"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email professionnel *
          </label>
          <Input
            type="email"
            value={businessData.email}
            onChange={(e) => setBusinessData(prev => ({ ...prev, email: e.target.value }))}
            required
            placeholder="contact@monsalon.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Site web (optionnel)
          </label>
          <Input
            type="url"
            value={businessData.website}
            onChange={(e) => setBusinessData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://www.monsalon.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            Description de votre établissement
          </label>
          <Textarea
            value={businessData.description}
            onChange={(e) => setBusinessData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            placeholder="Décrivez votre salon, vos spécialités, votre ambiance..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Mot de passe *
          </label>
          <div className="relative">
            <Input
              type={showBusinessPassword ? "text" : "password"}
              value={businessPassword}
              onChange={(e) => setBusinessPassword(e.target.value)}
              required
              placeholder="Minimum 6 caractères"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowBusinessPassword(!showBusinessPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showBusinessPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Confirmer le mot de passe *
          </label>
          <div className="relative">
            <Input
              type={showBusinessConfirmPassword ? "text" : "password"}
              value={businessConfirmPassword}
              onChange={(e) => setBusinessConfirmPassword(e.target.value)}
              required
              placeholder="Confirmez votre mot de passe"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowBusinessConfirmPassword(!showBusinessConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showBusinessConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={() => setUserType(null)}
          variant="outline"
          className="flex-1"
        >
          Retour
        </Button>
        <Button
          onClick={() => setCurrentStep('verification')}
          disabled={!businessData.name || !businessData.email || !businessData.phone || !businessData.address || !businessData.city || !businessData.category || !businessPassword || !businessConfirmPassword}
          className="flex-1"
        >
          Continuer
        </Button>
      </div>
    </div>
  );

  const renderBusinessVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Finalisation de votre inscription</h2>
        <p className="text-muted-foreground">Vérifiez vos informations avant de créer votre compte</p>
      </div>

      {/* Summary */}
      <div className="bg-accent rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Récapitulatif</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Établissement:</span>
            <p className="text-foreground">{businessData.name}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Catégorie:</span>
            <p className="text-foreground">
              {categories.find(c => c.id === businessData.category)?.icon} {categories.find(c => c.id === businessData.category)?.name}
            </p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Localisation:</span>
            <p className="text-foreground">{businessData.city}</p>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-accent border border-border rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 h-4 w-4 text-primary focus:ring-primary border-input rounded"
          />
          <label htmlFor="terms" className="text-sm text-foreground">
            J'accepte les <a href="#" className="text-primary hover:underline">conditions d'utilisation</a> et
            la <a href="#" className="text-primary hover:underline">politique de confidentialité</a> de Dealio.
            Je comprends que Dealio prélève une commission uniquement sur les réservations validées.
          </label>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={() => setCurrentStep('info')}
          variant="outline"
          className="flex-1"
        >
          Modifier
        </Button>
        <Button
          onClick={handleBusinessRegistration}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Création du compte...' : 'Créer mon compte business'}
        </Button>
      </div>
    </div>
  );

  const renderBusinessSteps = () => {
    const steps = [
      { id: 'info', name: 'Informations', icon: Building2 },
      { id: 'verification', name: 'Vérification', icon: Check }
    ];

    return (
      <div className="space-y-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : isCompleted
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-border bg-background text-muted-foreground'
                  }`}>
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <span className={`ml-2 text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-border'
                    }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        {currentStep === 'info' && renderBusinessInfo()}
        {currentStep === 'verification' && renderBusinessVerification()}
      </div>
    );
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center">
      {/* Premium Purple Header */}
      <div className="w-full bg-primary pt-safe pb-8 px-6 flex flex-col items-center relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-2xl" />

        <div className="w-full max-w-[440px] flex items-center justify-between relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (userType === 'business' && currentStep === 'verification') {
                setCurrentStep('info');
              } else if (userType) {
                setUserType(null);
              } else {
                navigate('/');
              }
            }}
            className="p-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 rounded-full transition-all"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2} />
          </motion.button>

          <Logo className="h-10 w-auto" />

          <div className="w-10"></div>
        </div>
      </div>

      <div className="w-full max-w-[440px] px-6 py-12 space-y-8 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={userType ? (userType === 'business' ? currentStep : 'client-reg') : 'selection'}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {/* Messages */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl">
                <p className="text-destructive text-sm font-semibold text-center">{error}</p>
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                <p className="text-green-600 dark:text-green-400 text-sm font-semibold text-center">{successMessage}</p>
              </div>
            )}

            {/* Content Body */}
            <div className={!userType ? "px-1" : "bg-card rounded-[2.5rem] shadow-xl border border-border/40 p-8 sm:p-10"}>
              {!userType && renderUserTypeSelection()}
              {userType === 'client' && renderClientRegistration()}
              {userType === 'business' && renderBusinessSteps()}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        {!userType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center pt-4"
          >
            <p className="text-muted-foreground font-medium text-sm">
              Vous avez déjà un compte ?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-foreground hover:text-primary font-bold underline underline-offset-8 decoration-primary/30 transition-all hover:decoration-primary"
              >
                Se connecter
              </button>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RegistrationPage;