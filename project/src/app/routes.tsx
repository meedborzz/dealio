import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegistrationPage from '../pages/RegistrationPage';
import OnboardingPage from '../pages/OnboardingPage';
import UserProfilePage from '../pages/UserProfilePage';
import CategoriesPage from '../pages/CategoriesPage';
import SettingsPage from '../pages/SettingsPage';
import RequireAuth from './guards/RequireAuth';
import AdminRoute from './guards/AdminRoute';
import OwnerRoute from './guards/OwnerRoute';
import RequireOfferGuard from './guards/RequireOfferGuard';
import BusinessLayout from './business/BusinessLayout';
import AdminLayout from './admin/AdminLayout';
import ClientBookingsPage from '../features/bookings/ClientBookingsPage';
import GuestBookingPage from '../pages/GuestBookingPage';
import { FEATURES } from '../config/features';
import { BusinessProvider } from '../contexts/BusinessContext';

const DealDetailPage = lazy(() => import('../pages/DealDetailPage'));
const PublicBusinessProfilePage = lazy(() => import('../pages/BusinessProfilePage'));

const MapViewPage = FEATURES.MAP_VIEW ? lazy(() => import('../pages/MapViewPage')) : null;
const ClientMessagesPage = FEATURES.MESSAGING ? lazy(() => import('../pages/ClientMessagesPage')) : null;

const BusinessIntroPage = lazy(() => import('./business/BusinessIntroPage'));
const CreateOfferPage = lazy(() => import('./business/CreateOfferPage'));
const BusinessDashboardPage = lazy(() => import('./business/DashboardPage'));
const BusinessOffersPage = lazy(() => import('./business/OffersPage'));
const BusinessBookingsPage = lazy(() => import('./business/BookingsPage'));
const BusinessHistoryPage = FEATURES.BUSINESS_ANALYTICS ? lazy(() => import('./business/BookingHistoryPage')) : null;
const BusinessStatsPage = FEATURES.BUSINESS_ANALYTICS ? lazy(() => import('./business/BookingStatsPage')) : null;
const BusinessReviewsPage = FEATURES.REVIEWS ? lazy(() => import('./business/ReviewsPage')) : null;
const BusinessMessagesPage = FEATURES.MESSAGING ? lazy(() => import('./business/MessagesPage')) : null;
const OwnerBusinessProfilePage = lazy(() => import('./business/ProfilePage'));

const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const AdminBusinessesPage = lazy(() => import('./admin/BusinessesPage'));
const AdminClientsPage = lazy(() => import('./admin/ClientsPage'));
const AdminOffersPage = lazy(() => import('./admin/OffersPage'));
const AdminStatsPage = lazy(() => import('./admin/StatsPage'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/deal/:dealId" element={<DealDetailPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:slug" element={<CategoriesPage />} />

        {FEATURES.MAP_VIEW && MapViewPage && (
          <Route path="/map" element={<MapViewPage />} />
        )}

        <Route path="/profile" element={<RequireAuth><UserProfilePage /></RequireAuth>} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="/bookings" element={<ClientBookingsPage />} />

        <Route path="/booking/:token" element={<GuestBookingPage />} />

        {!FEATURES.QR && (
          <Route path="/bookings/:bookingId/qr" element={<Navigate to="/bookings" replace />} />
        )}

        <Route path="/booking-resume" element={<Navigate to="/bookings" replace />} />

        {FEATURES.MESSAGING && ClientMessagesPage && (
          <Route path="/messages" element={<RequireAuth><ClientMessagesPage /></RequireAuth>} />
        )}

        <Route path="/business/:businessId" element={<PublicBusinessProfilePage />} />

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="businesses" element={<AdminBusinessesPage />} />
          <Route path="clients" element={<AdminClientsPage />} />
          <Route path="offers" element={<AdminOffersPage />} />
          <Route path="stats" element={<AdminStatsPage />} />
        </Route>

        <Route path="/business/intro" element={<OwnerRoute><BusinessProvider><BusinessIntroPage /></BusinessProvider></OwnerRoute>} />
        <Route path="/business/offers/create" element={<OwnerRoute><BusinessProvider><CreateOfferPage /></BusinessProvider></OwnerRoute>} />

        <Route path="/business" element={<OwnerRoute><BusinessProvider><RequireOfferGuard><BusinessLayout /></RequireOfferGuard></BusinessProvider></OwnerRoute>}>
          <Route index element={<BusinessDashboardPage />} />
          <Route path="dashboard" element={<BusinessDashboardPage />} />
          <Route path="offers" element={<BusinessOffersPage />} />
          <Route path="bookings" element={<BusinessBookingsPage />} />

          {FEATURES.BUSINESS_ANALYTICS && BusinessHistoryPage && (
            <Route path="bookings/history" element={<BusinessHistoryPage />} />
          )}

          {FEATURES.BUSINESS_ANALYTICS && BusinessStatsPage && (
            <Route path="bookings/stats" element={<BusinessStatsPage />} />
          )}

          {FEATURES.REVIEWS && BusinessReviewsPage && (
            <Route path="reviews" element={<BusinessReviewsPage />} />
          )}

          {FEATURES.MESSAGING && BusinessMessagesPage && (
            <Route path="messages" element={<BusinessMessagesPage />} />
          )}

          <Route path="profile" element={<OwnerBusinessProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
