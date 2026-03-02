import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface SkeletonLoaderProps {
  type: 'deal-card' | 'deal-detail' | 'business-card' | 'booking-item' | 'review-item' | 'profile' | 'messages';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 1 }) => {
  const renderDealCardSkeleton = () => (
    <div className="card-bolt overflow-hidden">
      <div className="h-48 bg-gray-200 animate-pulse"></div>
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
        <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-20"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
        </div>
      </div>
    </div>
  );

  const renderDealDetailSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="h-64 md:h-80 bg-gray-200 animate-pulse"></div>
      <div className="p-6 md:p-8 space-y-6">
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded w-4/5"></div>
        </div>
        <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
      </div>
    </div>
  );

  const renderBusinessCardSkeleton = () => (
    <Card className="overflow-hidden">
      <div className="h-48 bg-gray-200 animate-pulse"></div>
      <CardContent className="p-4 space-y-4">
        <div className="h-6 bg-gray-200 animate-pulse rounded w-2/3"></div>
        <div className="flex space-x-4">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 animate-pulse rounded w-full"></div>
          <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="h-5 bg-gray-200 animate-pulse rounded w-24"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div>
          </div>
          <div className="h-10 bg-gray-200 animate-pulse rounded w-20"></div>
        </div>
      </CardContent>
    </Card>
  );

  const renderBookingItemSkeleton = () => (
    <Card>
      <CardContent className="p-4 relative">
        {/* Cancel button skeleton */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-muted animate-pulse rounded-md"></div>
        
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-16 h-16 bg-muted animate-pulse rounded-lg flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-muted animate-pulse rounded"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-muted animate-pulse rounded"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-1/3"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-muted animate-pulse rounded"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-2/5"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-muted animate-pulse rounded"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-1/4"></div>
                <div className="w-12 h-4 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="h-9 bg-muted animate-pulse rounded"></div>
            <div className="h-9 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="h-9 bg-muted animate-pulse rounded w-full"></div>
        </div>
      </CardContent>
    </Card>
  );

  const renderProfileSkeleton = () => (
    <div className="space-y-6">
      {/* Profile Header Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-muted animate-pulse rounded-2xl"></div>
              <div className="space-y-2">
                <div className="h-6 bg-muted animate-pulse rounded w-32"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
              <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
              <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-muted animate-pulse rounded mx-auto mb-2"></div>
              <div className="h-6 bg-muted animate-pulse rounded w-12 mx-auto mb-1"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-16 mx-auto"></div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-1 h-8 bg-background animate-pulse rounded"></div>
          ))}
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-muted animate-pulse rounded"></div>
                <div className="h-4 bg-muted animate-pulse rounded flex-1"></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMessagesSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-muted animate-pulse rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
              </div>
              <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderReviewItemSkeleton = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-16"></div>
          </div>
          <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'deal-card':
        return renderDealCardSkeleton();
      case 'deal-detail':
        return renderDealDetailSkeleton();
      case 'business-card':
        return renderBusinessCardSkeleton();
      case 'booking-item':
        return renderBookingItemSkeleton();
      case 'review-item':
        return renderReviewItemSkeleton();
      case 'profile':
        return renderProfileSkeleton();
      case 'messages':
        return renderMessagesSkeleton();
      default:
        return renderDealCardSkeleton();
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={count > 1 ? 'mb-6' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;