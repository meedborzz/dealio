export type Language = 'ar' | 'fr' | 'en';

interface Translations {
  [key: string]: {
    ar: string;
    fr: string;
    en: string;
  };
}

export const translations: Translations = {
  // Setup wizard
  'setup.welcome.title': {
    ar: 'مرحباً بك في Dealio',
    fr: 'Bienvenue sur Dealio',
    en: 'Welcome to Dealio',
  },
  'setup.welcome.subtitle': {
    ar: 'اكتشف أفضل عروض الجمال بالقرب منك',
    fr: 'Découvrez les meilleures offres beauté près de chez vous',
    en: 'Discover the best beauty deals near you',
  },
  'setup.welcome.tip': {
    ar: 'ستستغرق هذه العملية دقيقة واحدة فقط',
    fr: 'Cela ne prendra qu\'une minute',
    en: 'This will only take a minute',
  },
  'setup.language.title': {
    ar: 'اختر لغتك',
    fr: 'Choisissez votre langue',
    en: 'Choose your language',
  },
  'setup.language.tip': {
    ar: 'تقييمات حقيقية من عملاء موثوقين لمساعدتك في اختيار الأفضل',
    fr: 'Avis authentiques de clients vérifiés pour vous aider à choisir le meilleur',
    en: 'Real reviews from verified customers to help you choose the best',
  },
  'setup.theme.title': {
    ar: 'اختر المظهر',
    fr: 'Choisissez le thème',
    en: 'Choose theme',
  },
  'setup.theme.system': {
    ar: 'نظام',
    fr: 'Système',
    en: 'System',
  },
  'setup.theme.light': {
    ar: 'فاتح',
    fr: 'Clair',
    en: 'Light',
  },
  'setup.theme.dark': {
    ar: 'داكن',
    fr: 'Sombre',
    en: 'Dark',
  },
  'setup.theme.tip': {
    ar: 'اكسب نقاط ولاء مع كل حجز واستبدلها بخصومات وخدمات مجانية',
    fr: 'Gagnez des points de fidélité à chaque réservation et échangez-les contre des réductions',
    en: 'Earn loyalty points with every booking and redeem them for discounts',
  },
  'setup.categories.title': {
    ar: 'ما الذي يهمك؟',
    fr: 'Qu\'est-ce qui vous intéresse ?',
    en: 'What interests you?',
  },
  'setup.categories.subtitle': {
    ar: 'اختر 3 فئات على الأقل',
    fr: 'Choisissez au moins 3 catégories',
    en: 'Choose at least 3 categories',
  },
  'setup.categories.tip': {
    ar: 'اكتشف أفضل العروض من صالوناتك المفضلة مع خصومات حصرية تصل إلى 70%',
    fr: 'Découvrez les meilleures offres de vos salons préférés avec jusqu\'à 70% de réduction',
    en: 'Discover best offers from your favorite salons with up to 70% off',
  },
  'setup.location.title': {
    ar: 'شاهد العروض القريبة منك',
    fr: 'Voir les offres près de vous',
    en: 'See offers near you',
  },
  'setup.location.subtitle': {
    ar: 'اسمح بالوصول إلى الموقع للحصول على عروض محلية',
    fr: 'Autoriser l\'accès à la localisation pour des offres locales',
    en: 'Allow location access for local offers',
  },
  'setup.location.tip': {
    ar: 'نظام حجز سهل يفيد الطرفين - احجز بسرعة والصالونات تدير المواعيد بكفاءة',
    fr: 'Système de réservation facile bénéfique pour tous - réservez vite, salons gèrent efficacement',
    en: 'Easy booking system benefits both sides - book fast, salons manage efficiently',
  },
  'setup.notifications.title': {
    ar: 'ابق على اطلاع',
    fr: 'Restez informé',
    en: 'Stay informed',
  },
  'setup.notifications.subtitle': {
    ar: 'احصل على عروض اللحظة الأخيرة وتحديثات الحجز',
    fr: 'Recevez des offres de dernière minute et des mises à jour de réservation',
    en: 'Get last-minute offers and booking updates',
  },
  'setup.notifications.tip': {
    ar: 'احصل على إشعارات فورية للعروض الحصرية وتأكيدات الحجز لتبقى دائماً على اطلاع',
    fr: 'Recevez des notifications instantanées pour les offres exclusives et confirmations de réservation',
    en: 'Get instant notifications for exclusive offers and booking confirmations',
  },
  'setup.install.title': {
    ar: 'قم بتثبيت التطبيق',
    fr: 'Installer l\'application',
    en: 'Install the app',
  },
  'setup.install.subtitle': {
    ar: 'احصل على أفضل تجربة مع تطبيقنا',
    fr: 'Obtenez la meilleure expérience avec notre application',
    en: 'Get the best experience with our app',
  },
  'setup.install.tip': {
    ar: 'أصحاب الصالونات يحصلون على لوحة تحكم سهلة لإدارة الحجوزات والعروض والإحصائيات',
    fr: 'Les propriétaires de salons ont un tableau de bord facile pour gérer réservations et offres',
    en: 'Salon owners get an easy dashboard to manage bookings, offers and analytics',
  },
  'setup.account.title': {
    ar: 'الخطوة الأخيرة',
    fr: 'Dernière étape',
    en: 'Final step',
  },
  'setup.account.subtitle': {
    ar: 'قم بإنشاء حساب أو تسجيل الدخول',
    fr: 'Créez un compte ou connectez-vous',
    en: 'Create an account or log in',
  },
  'setup.account.tip': {
    ar: 'شارك تجربتك واكسب مكافآت - كل تقييم وحجز يساهم في تحسين المجتمع ويكسبك نقاط',
    fr: 'Partagez votre expérience et gagnez - chaque avis et réservation améliore la communauté',
    en: 'Share your experience and earn - every review and booking improves the community',
  },

  // Common buttons
  'button.next': {
    ar: 'التالي',
    fr: 'Suivant',
    en: 'Next',
  },
  'button.back': {
    ar: 'السابق',
    fr: 'Précédent',
    en: 'Back',
  },
  'button.skip': {
    ar: 'تخطى',
    fr: 'Passer',
    en: 'Skip',
  },
  'button.allow': {
    ar: 'السماح',
    fr: 'Autoriser',
    en: 'Allow',
  },
  'button.not_now': {
    ar: 'ليس الآن',
    fr: 'Pas maintenant',
    en: 'Not now',
  },
  'button.install': {
    ar: 'تثبيت',
    fr: 'Installer',
    en: 'Install',
  },
  'button.login': {
    ar: 'تسجيل الدخول',
    fr: 'Se connecter',
    en: 'Log in',
  },
  'button.register': {
    ar: 'إنشاء حساب',
    fr: 'S\'inscrire',
    en: 'Register',
  },
  'button.continue_guest': {
    ar: 'متابعة كضيف',
    fr: 'Continuer en tant qu\'invité',
    en: 'Continue as guest',
  },
  'button.finish': {
    ar: 'إنهاء',
    fr: 'Terminer',
    en: 'Finish',
  },
  'button.cancel': {
    ar: 'إلغاء',
    fr: 'Annuler',
    en: 'Cancel',
  },
  'button.save': {
    ar: 'حفظ',
    fr: 'Sauvegarder',
    en: 'Save',
  },
  'button.edit': {
    ar: 'تعديل',
    fr: 'Modifier',
    en: 'Edit',
  },
  'button.continue': {
    ar: 'متابعة',
    fr: 'Continuer',
    en: 'Continue',
  },
  'button.confirm': {
    ar: 'تأكيد',
    fr: 'Confirmer',
    en: 'Confirm',
  },
  'button.book': {
    ar: 'حجز',
    fr: 'Réserver',
    en: 'Book',
  },
  'button.book_now': {
    ar: 'احجز الآن',
    fr: 'Réserver maintenant',
    en: 'Book now',
  },
  'button.contact': {
    ar: 'تواصل',
    fr: 'Contacter',
    en: 'Contact',
  },
  'button.share': {
    ar: 'مشاركة',
    fr: 'Partager',
    en: 'Share',
  },
  'button.view_all': {
    ar: 'عرض الكل',
    fr: 'Voir tout',
    en: 'View all',
  },
  'button.clear': {
    ar: 'مسح',
    fr: 'Effacer',
    en: 'Clear',
  },
  'button.discover': {
    ar: 'اكتشف',
    fr: 'Découvrir',
    en: 'Discover',
  },
  'button.explore': {
    ar: 'استكشف',
    fr: 'Explorer les offres',
    en: 'Explore offers',
  },
  'button.enable': {
    ar: 'تفعيل',
    fr: 'Activer',
    en: 'Enable',
  },
  'button.return_home': {
    ar: 'العودة للرئيسية',
    fr: 'Retour à l\'accueil',
    en: 'Return home',
  },

  // Common labels
  'common.or': {
    ar: 'أو',
    fr: 'ou',
    en: 'or',
  },
  'common.loading': {
    ar: 'جاري التحميل...',
    fr: 'Chargement...',
    en: 'Loading...',
  },
  'common.error': {
    ar: 'خطأ',
    fr: 'Erreur',
    en: 'Error',
  },
  'common.success': {
    ar: 'نجح',
    fr: 'Succès',
    en: 'Success',
  },
  'common.reviews': {
    ar: 'تقييم',
    fr: 'avis',
    en: 'reviews',
  },
  'common.bookings': {
    ar: 'الحجوزات',
    fr: 'Réservations',
    en: 'Bookings',
  },
  'common.points': {
    ar: 'نقاط',
    fr: 'Points',
    en: 'Points',
  },

  // Auth pages
  'auth.login.title': {
    ar: 'تسجيل الدخول',
    fr: 'Se connecter',
    en: 'Log in',
  },
  'auth.login.subtitle': {
    ar: 'سجل الدخول إلى حسابك',
    fr: 'Connectez-vous à votre compte',
    en: 'Sign in to your account',
  },
  'auth.login.email': {
    ar: 'البريد الإلكتروني',
    fr: 'Email',
    en: 'Email',
  },
  'auth.login.password': {
    ar: 'كلمة المرور',
    fr: 'Mot de passe',
    en: 'Password',
  },
  'auth.login.email_placeholder': {
    ar: 'your@email.com',
    fr: 'votre@email.com',
    en: 'your@email.com',
  },
  'auth.login.password_placeholder': {
    ar: 'كلمة المرور الخاصة بك',
    fr: 'Votre mot de passe',
    en: 'Your password',
  },
  'auth.login.submitting': {
    ar: 'جاري تسجيل الدخول...',
    fr: 'Connexion...',
    en: 'Logging in...',
  },
  'auth.login.error': {
    ar: 'حدث خطأ أثناء تسجيل الدخول',
    fr: 'Une erreur est survenue lors de la connexion',
    en: 'An error occurred during login',
  },
  'auth.login.no_account': {
    ar: 'ليس لديك حساب؟',
    fr: 'Vous n\'avez pas de compte ?',
    en: 'Don\'t have an account?',
  },
  'auth.login.create_account': {
    ar: 'إنشاء حساب',
    fr: 'Créer un compte',
    en: 'Create account',
  },

  // Settings
  'settings.title': {
    ar: 'الإعدادات',
    fr: 'Paramètres',
    en: 'Settings',
  },
  'settings.language': {
    ar: 'اللغة',
    fr: 'Langue',
    en: 'Language',
  },
  'settings.theme': {
    ar: 'المظهر',
    fr: 'Thème',
    en: 'Theme',
  },
  'settings.categories': {
    ar: 'الفئات',
    fr: 'Catégories',
    en: 'Categories',
  },
  'settings.location': {
    ar: 'الموقع',
    fr: 'Localisation',
    en: 'Location',
  },
  'settings.notifications': {
    ar: 'الإشعارات',
    fr: 'Notifications',
    en: 'Notifications',
  },
  'settings.reset': {
    ar: 'إعادة تعيين',
    fr: 'Réinitialiser',
    en: 'Reset',
  },
  'settings.reset_preferences': {
    ar: 'إعادة تعيين التفضيلات',
    fr: 'Réinitialiser les préférences',
    en: 'Reset preferences',
  },
  'settings.confirm_reset': {
    ar: 'هل أنت متأكد؟',
    fr: 'Êtes-vous sûr ?',
    en: 'Are you sure?',
  },
  'settings.enabled': {
    ar: 'مفعّل',
    fr: 'Activé',
    en: 'Enabled',
  },
  'settings.disabled': {
    ar: 'غير مفعّل',
    fr: 'Désactivé',
    en: 'Disabled',
  },
  'settings.choose_city': {
    ar: 'اختر مدينة',
    fr: 'Choisissez une ville',
    en: 'Choose a city',
  },

  // Home page
  'home.search_placeholder': {
    ar: 'البحث عن خدمة، صالون...',
    fr: 'Rechercher service, salon...',
    en: 'Search service, salon...',
  },
  'home.detecting': {
    ar: 'جاري الكشف...',
    fr: 'Détection en cours...',
    en: 'Detecting...',
  },
  'home.near_me': {
    ar: 'قريب مني',
    fr: 'Près de moi',
    en: 'Near me',
  },
  'home.big_discounts': {
    ar: 'عروض -40% وأكثر',
    fr: 'Offres -40% et plus',
    en: 'Deals -40% and more',
  },
  'home.new_businesses': {
    ar: 'صالونات جديدة',
    fr: 'Nouveaux salons',
    en: 'New businesses',
  },
  'home.categories': {
    ar: 'الفئات',
    fr: 'Catégories',
    en: 'Categories',
  },
  'home.special_offer': {
    ar: 'عرض خاص',
    fr: 'Offre Spéciale',
    en: 'Special Offer',
  },
  'home.promo_text': {
    ar: 'خصم يصل إلى 70% على خدمات التجميل المفضلة لديك',
    fr: 'Jusqu\'à 70% de réduction sur vos services beauté préférés',
    en: 'Up to 70% off your favorite beauty services',
  },
  'home.search_results': {
    ar: 'نتائج البحث عن "{query}"',
    fr: 'Résultats pour "{query}"',
    en: 'Results for "{query}"',
  },
  'home.no_results': {
    ar: 'لا توجد نتائج لـ "{query}"',
    fr: 'Aucun résultat pour "{query}"',
    en: 'No results for "{query}"',
  },
  'home.clear_search': {
    ar: 'مسح البحث',
    fr: 'Effacer la recherche',
    en: 'Clear search',
  },
  'home.choose_city': {
    ar: 'اختر مدينتك',
    fr: 'Choisir votre ville',
    en: 'Choose your city',
  },
  'home.use_location': {
    ar: 'استخدام موقعي',
    fr: 'Utiliser ma position',
    en: 'Use my location',
  },
  'home.auto_detection': {
    ar: 'الكشف التلقائي',
    fr: 'Détection automatique',
    en: 'Auto-detection',
  },

  // Deal details
  'deal.details': {
    ar: 'التفاصيل',
    fr: 'Détails',
    en: 'Details',
  },
  'deal.not_found': {
    ar: 'العرض غير موجود',
    fr: 'Offre non trouvée',
    en: 'Deal not found',
  },
  'deal.you_save': {
    ar: 'توفر',
    fr: 'Vous économisez',
    en: 'You save',
  },
  'deal.payment_onsite': {
    ar: 'الدفع في المكان',
    fr: 'Paiement sur place',
    en: 'Payment on-site',
  },
  'deal.description': {
    ar: 'الوصف',
    fr: 'Description',
    en: 'Description',
  },
  'deal.business': {
    ar: 'الصالون',
    fr: 'Salon',
    en: 'Business',
  },
  'deal.view_profile': {
    ar: 'عرض الملف الشخصي',
    fr: 'Voir profil',
    en: 'View profile',
  },
  'deal.customer_reviews': {
    ar: 'تقييمات العملاء',
    fr: 'Avis clients',
    en: 'Customer reviews',
  },
  'deal.no_reviews': {
    ar: 'لا توجد تقييمات لهذا العرض',
    fr: 'Aucun avis pour cette offre',
    en: 'No reviews for this deal',
  },
  'deal.anonymous_client': {
    ar: 'عميل مجهول',
    fr: 'Client anonyme',
    en: 'Anonymous client',
  },
  'deal.view_more_reviews': {
    ar: 'عرض {count} تقييمات أخرى',
    fr: 'Voir les {count} autres avis',
    en: 'View {count} more reviews',
  },

  // Booking
  'booking.title': {
    ar: 'حجز',
    fr: 'Réserver',
    en: 'Book',
  },
  'booking.choose_date': {
    ar: 'اختر تاريخاً',
    fr: 'Choisir une date',
    en: 'Choose a date',
  },
  'booking.choose_time': {
    ar: 'اختر الوقت',
    fr: 'Choisir l\'heure',
    en: 'Choose time',
  },
  'booking.no_slots': {
    ar: 'لا توجد أوقات متاحة',
    fr: 'Aucun créneau disponible',
    en: 'No slots available',
  },
  'booking.your_info': {
    ar: 'معلوماتك',
    fr: 'Vos informations',
    en: 'Your information',
  },
  'booking.full_name': {
    ar: 'الاسم الكامل',
    fr: 'Nom complet',
    en: 'Full name',
  },
  'booking.phone': {
    ar: 'الهاتف',
    fr: 'Téléphone',
    en: 'Phone',
  },
  'booking.email': {
    ar: 'البريد الإلكتروني',
    fr: 'Email',
    en: 'Email',
  },
  'booking.confirm': {
    ar: 'تأكيد الحجز',
    fr: 'Confirmer la réservation',
    en: 'Confirm booking',
  },
  'booking.submitting': {
    ar: 'جاري الحجز...',
    fr: 'Réservation...',
    en: 'Booking...',
  },
  'booking.error': {
    ar: 'خطأ أثناء الحجز. حاول مرة أخرى.',
    fr: 'Erreur lors de la réservation. Veuillez réessayer.',
    en: 'Booking error. Please try again.',
  },
  'booking.fill_required': {
    ar: 'يرجى ملء جميع الحقول المطلوبة',
    fr: 'Veuillez remplir tous les champs obligatoires',
    en: 'Please fill all required fields',
  },
  'booking.request_sent': {
    ar: 'تم إرسال الطلب!',
    fr: 'Demande envoyée!',
    en: 'Request sent!',
  },
  'booking.awaiting_confirmation': {
    ar: 'في انتظار تأكيد الصالون',
    fr: 'En attente de confirmation du salon',
    en: 'Awaiting salon confirmation',
  },
  'booking.closed_day': {
    ar: 'الصالون مغلق في هذا اليوم',
    fr: 'Le salon est fermé ce jour-là',
    en: 'Salon is closed this day',
  },
  'booking.select_other_date': {
    ar: 'يرجى اختيار تاريخ آخر',
    fr: 'Veuillez sélectionner une autre date',
    en: 'Please select another date',
  },
  'booking.all_slots_full': {
    ar: 'جميع الأوقات محجوزة لهذا اليوم',
    fr: 'Tous les créneaux sont complets pour cette date',
    en: 'All slots are full for this date',
  },
  'booking.waiting_list': {
    ar: 'قائمة الانتظار',
    fr: 'Liste d\'attente',
    en: 'Waiting list',
  },
  'booking.notes_optional': {
    ar: 'ملاحظات (اختياري)',
    fr: 'Notes (optionnel)',
    en: 'Notes (optional)',
  },
  'booking.notes_placeholder': {
    ar: 'طلبات خاصة، تفضيلات...',
    fr: 'Demandes spéciales, préférences...',
    en: 'Special requests, preferences...',
  },
  'booking.summary': {
    ar: 'ملخص',
    fr: 'Récapitulatif',
    en: 'Summary',
  },
  'booking.duration': {
    ar: 'المدة: {minutes} دقيقة',
    fr: 'Durée: {minutes} minutes',
    en: 'Duration: {minutes} minutes',
  },

  // Profile
  'profile.title': {
    ar: 'ملفي الشخصي',
    fr: 'Mon Profil',
    en: 'My Profile',
  },
  'profile.access_account': {
    ar: 'الوصول إلى حسابك',
    fr: 'Accédez à votre compte',
    en: 'Access your account',
  },
  'profile.login_prompt': {
    ar: 'سجل الدخول',
    fr: 'Connectez-vous',
    en: 'Log in',
  },
  'profile.login_subtitle': {
    ar: 'الوصول إلى ملفك الشخصي وحجوزاتك',
    fr: 'Accédez à votre profil et vos réservations',
    en: 'Access your profile and bookings',
  },
  'profile.continue_no_account': {
    ar: 'المتابعة بدون حساب',
    fr: 'Continuer sans compte',
    en: 'Continue without account',
  },
  'profile.wallet': {
    ar: 'المحفظة',
    fr: 'Portefeuille',
    en: 'Wallet',
  },
  'profile.wallet_dh': {
    ar: 'درهم المحفظة',
    fr: 'DH Portefeuille',
    en: 'DH Wallet',
  },
  'profile.info': {
    ar: 'المعلومات',
    fr: 'Infos',
    en: 'Info',
  },
  'profile.favorites': {
    ar: 'المفضلة',
    fr: 'Favoris',
    en: 'Favorites',
  },
  'profile.messages': {
    ar: 'الرسائل',
    fr: 'Messages',
    en: 'Messages',
  },
  'profile.settings': {
    ar: 'الإعدادات',
    fr: 'Paramètres',
    en: 'Settings',
  },
  'profile.personal_info': {
    ar: 'المعلومات الشخصية',
    fr: 'Informations personnelles',
    en: 'Personal information',
  },
  'profile.birth_date': {
    ar: 'تاريخ الميلاد',
    fr: 'Date de naissance',
    en: 'Birth date',
  },
  'profile.my_favorites': {
    ar: 'مفضلاتي',
    fr: 'Mes Favoris',
    en: 'My Favorites',
  },
  'profile.no_favorites': {
    ar: 'لا توجد مفضلة',
    fr: 'Aucun favori',
    en: 'No favorites',
  },
  'profile.add_favorites_tip': {
    ar: 'أضف عروضاً إلى المفضلة لإيجادها بسهولة',
    fr: 'Ajoutez des offres à vos favoris pour les retrouver facilement',
    en: 'Add offers to favorites to find them easily',
  },
  'profile.recent_bookings': {
    ar: 'الحجوزات الأخيرة',
    fr: 'Réservations récentes',
    en: 'Recent bookings',
  },
  'profile.no_bookings': {
    ar: 'لا توجد حجوزات',
    fr: 'Aucune réservation',
    en: 'No bookings',
  },
  'profile.messages_appear_here': {
    ar: 'ستظهر محادثاتك مع الصالونات هنا',
    fr: 'Vos conversations avec les salons apparaîtront ici',
    en: 'Your conversations with salons will appear here',
  },
  'profile.view_messages': {
    ar: 'عرض رسائلي',
    fr: 'Voir mes messages',
    en: 'View my messages',
  },
  'profile.referral_code': {
    ar: 'كود الإحالة',
    fr: 'Code de parrainage',
    en: 'Referral code',
  },
  'profile.share_code': {
    ar: 'شارك هذا الرمز واكسب 20 درهم لكل صديق يسجل',
    fr: 'Partagez ce code et gagnez 20 DH pour chaque ami qui s\'inscrit',
    en: 'Share this code and earn 20 DH for each friend who signs up',
  },
  'profile.share_my_code': {
    ar: 'مشاركة رمزي',
    fr: 'Partager mon code',
    en: 'Share my code',
  },
  'profile.preferences': {
    ar: 'التفضيلات',
    fr: 'Préférences',
    en: 'Preferences',
  },
  'profile.manage_preferences': {
    ar: 'إدارة جميع التفضيلات',
    fr: 'Gérer toutes les préférences',
    en: 'Manage all preferences',
  },
  'profile.preferences_description': {
    ar: 'اللغة، المظهر، الفئات، الموقع والمزيد',
    fr: 'Langue, thème, catégories, localisation et plus',
    en: 'Language, theme, categories, location and more',
  },
  'profile.location_preference': {
    ar: 'استخدام موقعك للحصول على اقتراحات مخصصة',
    fr: 'Utiliser votre position pour des suggestions personnalisées',
    en: 'Use your location for personalized suggestions',
  },
  'profile.reminders': {
    ar: 'التذكيرات',
    fr: 'Rappels',
    en: 'Reminders',
  },
  'profile.reminders_description': {
    ar: 'تلقي تذكيرات لحجوزاتك',
    fr: 'Recevoir des rappels pour vos réservations',
    en: 'Receive reminders for your bookings',
  },
  'profile.marketing_notifications': {
    ar: 'الإشعارات التسويقية',
    fr: 'Notifications marketing',
    en: 'Marketing notifications',
  },
  'profile.marketing_description': {
    ar: 'تلقي عروض خاصة وعروض ترويجية',
    fr: 'Recevoir des offres spéciales et promotions',
    en: 'Receive special offers and promotions',
  },
  'profile.push_notifications': {
    ar: 'الإشعارات الفورية',
    fr: 'Notifications push',
    en: 'Push notifications',
  },
  'profile.push_description': {
    ar: 'تلقي الإشعارات حتى عندما يكون التطبيق مغلقاً',
    fr: 'Recevoir des notifications même quand l\'app est fermée',
    en: 'Receive notifications even when the app is closed',
  },
  'profile.level': {
    ar: 'المستوى {level}',
    fr: 'Niveau {level}',
    en: 'Level {level}',
  },
  'profile.next_level': {
    ar: 'إلى {nextLevel}:',
    fr: 'Vers {nextLevel}:',
    en: 'To {nextLevel}:',
  },
  'profile.points_remaining': {
    ar: '{points} نقطة متبقية',
    fr: '{points} pts restants',
    en: '{points} pts remaining',
  },

  'onboarding.button.discover': {
    ar: 'هيا نبدأ',
    fr: 'C\'est parti!',
    en: 'Let\'s Explore',
  },
  'onboarding.button.book': {
    ar: 'أرني كيف',
    fr: 'Voir comment',
    en: 'Show Me How',
  },
  'onboarding.button.rewards': {
    ar: 'أريد المكافآت',
    fr: 'Je veux gagner',
    en: 'I Want Rewards',
  },
  'onboarding.button.community': {
    ar: 'ابدأ الآن',
    fr: 'Commencer',
    en: 'Get Started',
  },
  'onboarding.button.back': {
    ar: 'رجوع',
    fr: 'Retour',
    en: 'Back',
  },
  'onboarding.skip': {
    ar: 'تخطي',
    fr: 'Passer',
    en: 'Skip',
  },
  'onboarding.discover.title': {
    ar: 'اكتشف أفضل العروض',
    fr: 'Decouvrez les meilleures offres',
    en: 'Discover the best deals',
  },
  'onboarding.discover.subtitle': {
    ar: 'اعثر على صالونات التجميل القريبة منك مع خصومات حصرية',
    fr: 'Trouvez les salons de beaute pres de chez vous avec des reductions exclusives',
    en: 'Find beauty salons near you with exclusive discounts',
  },
  'onboarding.discover.feature1': {
    ar: 'تحديد الموقع الذكي',
    fr: 'Geolocalisation intelligente',
    en: 'Smart location detection',
  },
  'onboarding.discover.feature2': {
    ar: 'صالونات معتمدة ومقيّمة',
    fr: 'Salons certifies et notes',
    en: 'Certified and rated salons',
  },
  'onboarding.discover.feature3': {
    ar: 'خصومات تصل إلى 70%',
    fr: 'Reductions jusqu\'a 70%',
    en: 'Discounts up to 70%',
  },
  'onboarding.book.title': {
    ar: 'احجز بنقرات قليلة',
    fr: 'Reservez en quelques clics',
    en: 'Book in a few clicks',
  },
  'onboarding.book.subtitle': {
    ar: 'احجز موعدك فوراً مع تأكيد فوري',
    fr: 'Reservez votre creneau instantanement avec confirmation immediate',
    en: 'Book your slot instantly with immediate confirmation',
  },
  'onboarding.book.feature1': {
    ar: 'مواعيد في الوقت الفعلي',
    fr: 'Creneaux en temps reel',
    en: 'Real-time slots',
  },
  'onboarding.book.feature2': {
    ar: 'رمز QR آمن',
    fr: 'Code QR securise',
    en: 'Secure QR code',
  },
  'onboarding.book.feature3': {
    ar: 'الدفع في المكان',
    fr: 'Paiement sur place',
    en: 'Pay on-site',
  },
  'onboarding.rewards.title': {
    ar: 'اكسب نقاط الولاء',
    fr: 'Gagnez des points fidelite',
    en: 'Earn loyalty points',
  },
  'onboarding.rewards.subtitle': {
    ar: 'اجمع النقاط مع كل زيارة واحصل على مكافآت',
    fr: 'Cumulez des points a chaque visite et debloquez des recompenses',
    en: 'Collect points with every visit and unlock rewards',
  },
  'onboarding.rewards.feature1': {
    ar: '1 نقطة = 1 درهم',
    fr: '1 point = 1 DH depense',
    en: '1 point = 1 DH spent',
  },
  'onboarding.rewards.feature2': {
    ar: 'خدمات مجانية',
    fr: 'Services gratuits',
    en: 'Free services',
  },
  'onboarding.rewards.feature3': {
    ar: 'عروض شخصية',
    fr: 'Offres personnalisees',
    en: 'Personalized offers',
  },
  'onboarding.community.title': {
    ar: 'شارك تجاربك',
    fr: 'Partagez vos experiences',
    en: 'Share your experiences',
  },
  'onboarding.community.subtitle': {
    ar: 'اكتشف الاتجاهات وتواصل مع صالوناتك المفضلة',
    fr: 'Decouvrez les tendances et connectez-vous avec vos salons favoris',
    en: 'Discover trends and connect with your favorite salons',
  },
  'onboarding.community.feature1': {
    ar: 'تقييمات وصور',
    fr: 'Avis et photos',
    en: 'Reviews and photos',
  },
  'onboarding.community.feature2': {
    ar: 'اتجاهات الجمال',
    fr: 'Tendances beaute',
    en: 'Beauty trends',
  },
  'onboarding.community.feature3': {
    ar: 'رسائل مع الصالونات',
    fr: 'Messages avec salons',
    en: 'Chat with salons',
  },
  'install.title': {
    ar: 'تثبيت Dealio',
    fr: 'Installer Dealio',
    en: 'Install Dealio',
  },
  'install.subtitle': {
    ar: 'احصل على وصول أسرع من شاشتك الرئيسية',
    fr: 'Acces rapide depuis votre ecran d\'accueil',
    en: 'Get quick access from your home screen',
  },
  'install.benefit1': {
    ar: 'وصول فوري',
    fr: 'Acces instantane',
    en: 'Instant access',
  },
  'install.benefit2': {
    ar: 'إشعارات الحجز',
    fr: 'Notifications de reservation',
    en: 'Booking notifications',
  },
  'install.benefit3': {
    ar: 'يعمل بدون إنترنت',
    fr: 'Fonctionne hors ligne',
    en: 'Works offline',
  },
  'install.button': {
    ar: 'تثبيت التطبيق',
    fr: 'Installer l\'app',
    en: 'Install App',
  },
  'install.ios_instructions': {
    ar: 'اضغط على أيقونة المشاركة ثم "إضافة للشاشة الرئيسية"',
    fr: 'Appuyez sur l\'icone Partager puis "Ajouter a l\'ecran d\'accueil"',
    en: 'Tap the Share icon then "Add to Home Screen"',
  },
  'install.installed': {
    ar: 'التطبيق مثبت',
    fr: 'App installee',
    en: 'App installed',
  },
  'setup.button.type_select': {
    ar: 'متابعة',
    fr: 'Continuer',
    en: 'Continue',
  },
  'setup.button.categories': {
    ar: 'اختر المفضلة',
    fr: 'Choisir mes favoris',
    en: 'Pick Favorites',
  },
  'setup.button.business_basics': {
    ar: 'متابعة',
    fr: 'Continuer',
    en: 'Continue',
  },
  'setup.button.permissions': {
    ar: 'تقريباً انتهينا',
    fr: 'Presque fini',
    en: 'Almost Done',
  },
  'setup.button.tips': {
    ar: 'لنبدأ',
    fr: 'C\'est parti',
    en: 'Let\'s Go',
  },
  'notification.requesting': {
    ar: 'جاري طلب الإذن...',
    fr: 'Demande d\'autorisation...',
    en: 'Requesting permission...',
  },
  'notification.enabled_success': {
    ar: 'تم تفعيل الإشعارات بنجاح!',
    fr: 'Notifications activees avec succes!',
    en: 'Notifications enabled successfully!',
  },
  'notification.denied': {
    ar: 'تم رفض الإشعارات',
    fr: 'Notifications refusees',
    en: 'Notifications denied',
  },
  'notification.not_supported': {
    ar: 'الإشعارات غير مدعومة في هذا المتصفح',
    fr: 'Notifications non supportees sur ce navigateur',
    en: 'Notifications not supported in this browser',
  },
  'notification.unblock_instructions': {
    ar: 'انقر على أيقونة القفل بجوار شريط العنوان، ثم اسمح بالإشعارات',
    fr: 'Cliquez sur l\'icone du cadenas pres de la barre d\'adresse, puis autorisez les notifications',
    en: 'Click the lock icon near the address bar, then allow notifications',
  },
  'notification.try_again': {
    ar: 'إعادة المحاولة',
    fr: 'Reessayer',
    en: 'Try Again',
  },
};

export const t = (key: string, language: Language, params?: Record<string, string | number>): string => {
  let text = translations[key]?.[language] || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(`{${paramKey}}`, String(value));
    });
  }

  return text;
};
