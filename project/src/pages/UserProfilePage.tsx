import React, { useState, useEffect } from 'react';
import { User, LogOut, Edit3, Phone, Mail, Calendar, Settings, Bell, Share2, Loader2, Trash2, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import ThemeToggle from '../components/ThemeToggle';
import PushNotificationPrompt from '../components/PushNotificationPrompt';
import SkeletonLoader from '../components/SkeletonLoader';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { FEATURES } from '../config/features';
import { getGuestBookings, clearGuestBookings } from '../lib/guestBookings';
import { clearGuestSession } from '../lib/guestSession';

const UserProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  useTheme(); // keep context subscription; theme applied globally
  const { isSupported: pushSupported, isSubscribed: pushSubscribed, subscribeToPushNotifications } = usePushNotifications();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    date_of_birth: ''
  });
  const [saving, setSaving] = useState(false);
  const showPushPrompt = pushSupported && !pushSubscribed;
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    location_enabled: JSON.parse(localStorage.getItem('preferences_location_enabled') || 'true'),
    reminder_enabled: JSON.parse(localStorage.getItem('preferences_reminder_enabled') || 'true'),
    marketing_notifications: JSON.parse(localStorage.getItem('preferences_marketing_notifications') || 'false')
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const navigate = useNavigate();

  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    if (user) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData && !profileData.referral_code && FEATURES.REFERRAL) {
        const referralCode = generateReferralCode();
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ referral_code: referralCode })
          .eq('id', user.id);

        if (!updateError) {
          profileData.referral_code = referralCode;
        }
      }

      setProfile(profileData);
      setEditForm({
        full_name: profileData?.full_name || '',
        phone: profileData?.phone || '',
        date_of_birth: profileData?.date_of_birth || ''
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: editForm.full_name || null,
          phone: editForm.phone || null,
          date_of_birth: editForm.date_of_birth || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, ...editForm }));
      showToastMessage('Profil mis a jour!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToastMessage('Erreur lors de la mise a jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (key: string, checked: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: checked }));
    localStorage.setItem(`preferences_${key}`, JSON.stringify(checked));
  };

  const handleShareReferralCode = async () => {
    if (!profile?.referral_code) {
      showToastMessage('Code de parrainage en cours de generation...', 'warning');
      return;
    }

    const referralMessage = `Rejoins-moi sur Dealio ! Utilise mon code: ${profile.referral_code}\n\nhttps://www.dealio.website`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoins Dealio',
          text: referralMessage
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          await copyToClipboard(referralMessage);
        }
      }
    } else {
      await copyToClipboard(referralMessage);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToastMessage('Code de parrainage copie dans le presse-papier!', 'success');
    } catch (error) {
      console.error('Clipboard access failed:', error);
      showToastMessage('Impossible de partager. Copiez manuellement le code: ' + profile?.referral_code, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleClearGuestData = () => {
    clearGuestBookings();
    clearGuestSession();
    setShowClearDialog(false);
    showToastMessage('Donnees invitees supprimees', 'success');
    window.location.reload();
  };

  if (!user) {
    const guestBookings = getGuestBookings();

    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-card border-b border-border px-4 py-4">
          <div className="safe-area-top" />
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground">Mon Profil</h1>
            <p className="text-muted-foreground text-sm mt-1">Mode invite</p>
          </div>
        </div>

        <div className="p-4 max-w-md mx-auto space-y-4">
          <Card className="border-border bg-muted/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-foreground mb-1">Mode invite</h2>
                  <p className="text-sm text-muted-foreground">
                    Vos reservations sont stockees localement sur cet appareil
                  </p>
                </div>
              </div>

              <div className="p-4 bg-background rounded-lg border border-border mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Reservations enregistrees</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{guestBookings.length}</p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full"
                  size="lg"
                >
                  Se connecter
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Creer un compte
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parametres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Zone de danger</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Supprimer toutes les donnees de reservation stockees localement. Cette action est irreversible.
              </p>
              <Button
                onClick={() => setShowClearDialog(true)}
                variant="destructive"
                className="w-full"
                disabled={guestBookings.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer les donnees invitees
              </Button>
            </CardContent>
          </Card>

          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="w-full"
          >
            Retour a l'accueil
          </Button>
        </div>

        <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Etes-vous sur de vouloir supprimer toutes vos donnees invitees? Cette action ne peut pas etre annulee et vous perdrez l'acces a vos {guestBookings.length} reservation(s).
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleClearGuestData}
                variant="destructive"
                className="w-full"
              >
                Oui, tout supprimer
              </Button>
              <Button
                onClick={() => setShowClearDialog(false)}
                variant="outline"
                className="w-full"
              >
                Annuler
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4">
          <SkeletonLoader type="profile" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="safe-area-top" />
        <div className="flex items-center justify-end mb-3">
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Edit3 className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifier le profil</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom complet</label>
                    <Input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telephone</label>
                    <Input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date de naissance</label>
                    <Input
                      type="date"
                      value={editForm.date_of_birth}
                      onChange={(e) => setEditForm(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" className="flex-1">
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        'Sauvegarder'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile?.full_name || 'Mon Profil'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{user.email}</span>
            </div>
            {profile?.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{profile.phone}</span>
              </div>
            )}
            {profile?.date_of_birth && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {format(parseISO(profile.date_of_birth), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {FEATURES.REFERRAL && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                Code de parrainage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="bg-primary/10 rounded-lg p-6 mb-4 border border-primary/20">
                  <p className="text-2xl font-bold text-primary mb-2">{profile?.referral_code || 'Generation...'}</p>
                  <p className="text-sm text-muted-foreground">Partagez ce code avec vos amis</p>
                </div>
                <Button onClick={handleShareReferralCode} className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager mon code
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Rappels de réservation</p>
                <p className="text-sm text-muted-foreground">Recevoir des rappels pour vos réservations</p>
              </div>
              <Switch
                checked={preferences.reminder_enabled}
                onCheckedChange={(checked) => handlePreferenceChange('reminder_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alertes de nouvelles offres</p>
                <p className="text-sm text-muted-foreground">Recevoir des alertes sur les nouvelles offres</p>
              </div>
              <Switch
                checked={preferences.marketing_notifications}
                onCheckedChange={(checked) => handlePreferenceChange('marketing_notifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se deconnecter
            </Button>
          </CardContent>
        </Card>
      </div>

      {showToast && (
        <div className="fixed bottom-24 left-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg ${toastType === 'success' ? 'bg-green-500' :
              toastType === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            } text-white`}>
            <p className="text-center font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {showPushPrompt && (
        <PushNotificationPrompt onClose={() => setShowPushPrompt(false)} />
      )}
    </div>
  );
};

export default UserProfilePage;
