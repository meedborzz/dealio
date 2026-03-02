import React, { useState } from 'react';
import { Filter, X, MapPin, Star, DollarSign, Clock, Users, Sparkles } from 'lucide-react';

interface EnhancedSearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

const EnhancedSearchFilters: React.FC<EnhancedSearchFiltersProps> = ({
  isOpen,
  onClose,
  onApplyFilters
}) => {
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    rating: 0,
    distance: 50,
    availability: 'any',
    sortBy: 'relevance',
    serviceType: [],
    gender: 'all',
    discountLevel: 'all'
  });

  const serviceTypes = [
    { id: 'hair', name: 'Coiffure', icon: '💇‍♀️' },
    { id: 'hammam', name: 'Hammam', icon: '🛁' },
    { id: 'massage', name: 'Massage', icon: '💆‍♀️' },
    { id: 'nails', name: 'Ongles', icon: '💅' },
    { id: 'aesthetic', name: 'Esthétique', icon: '✨' },
    { id: 'barbershop', name: 'Barbier', icon: '🧔' }
  ];

  const genderOptions = [
    { id: 'all', name: 'Tous' },
    { id: 'women', name: 'Femmes' },
    { id: 'men', name: 'Hommes' },
    { id: 'unisex', name: 'Mixte' }
  ];

  const discountLevels = [
    { id: 'all', name: 'Toutes les offres' },
    { id: '10', name: '10%' },
    { id: '20', name: '20%' },
    { id: '30', name: '30%' },
    { id: '40plus', name: '40% et plus' }
  ];

  const sortOptions = [
    { id: 'relevance', name: 'Pertinence' },
    { id: 'rating', name: 'Mieux notés' },
    { id: 'price', name: 'Prix croissant' },
    { id: 'discount', name: 'Meilleure réduction' },
    { id: 'newest', name: 'Plus récents' },
    { id: 'expiring', name: 'Expire bientôt' }
  ];

  const handleServiceTypeToggle = (serviceId: string) => {
    setFilters(prev => ({
      ...prev,
      serviceType: prev.serviceType.includes(serviceId)
        ? prev.serviceType.filter(id => id !== serviceId)
        : [...prev.serviceType, serviceId]
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      priceRange: [0, 1000],
      rating: 0,
      distance: 50,
      availability: 'any',
      sortBy: 'relevance',
      serviceType: [],
      gender: 'all',
      discountLevel: 'all'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-teal-600" />
              Filtres avancés
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-8">
          {/* Service Types */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-teal-600" />
              Types de services
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {serviceTypes.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceTypeToggle(service.id)}
                  className={`p-4 rounded-xl border-2 transition-colors duration-200 ${
                    filters.serviceType.includes(service.id)
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-teal-400'
                  }`}
                >
                  <div className="text-2xl mb-2">{service.icon}</div>
                  <div className="font-medium text-sm">{service.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-teal-600" />
              Public cible
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {genderOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFilters(prev => ({ ...prev, gender: option.id }))}
                  className={`p-3 rounded-lg border transition-colors duration-200 ${
                    filters.gender === option.id
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-teal-400'
                  }`}
                >
                  <span className="font-medium text-sm">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-teal-600" />
              Gamme de prix
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">0 DH</span>
                <span className="text-sm text-gray-600">1000+ DH</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: [0, parseInt(e.target.value)]
                  }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div className="text-center">
                <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-medium">
                  Jusqu'à {filters.priceRange[1]} DH
                </span>
              </div>
            </div>
          </div>

          {/* Discount Level */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Niveau de réduction
            </h4>
            <div className="space-y-2">
              {discountLevels.map((level) => (
                <label key={level.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200">
                  <input
                    type="radio"
                    name="discountLevel"
                    value={level.id}
                    checked={filters.discountLevel === level.id}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      discountLevel: e.target.value
                    }))}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-gray-700 font-medium">{level.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-teal-600" />
              Note minimum
            </h4>
            <div className="flex space-x-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilters(prev => ({ ...prev, rating }))}
                  className={`px-4 py-3 rounded-lg border transition-colors duration-200 ${
                    filters.rating === rating
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-teal-300'
                  }`}
                >
                  {rating === 0 ? 'Toutes' : `${rating}+ ⭐`}
                </button>
              ))}
            </div>
          </div>

          {/* Distance */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-teal-600" />
              Distance maximale
            </h4>
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="100"
                value={filters.distance}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  distance: parseInt(e.target.value)
                }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-center">
                <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-medium">
                  Dans un rayon de {filters.distance} km
                </span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-teal-600" />
              Disponibilité
            </h4>
            <div className="space-y-2">
              {[
                { value: 'any', label: 'Toutes les disponibilités' },
                { value: 'today', label: 'Disponible aujourd\'hui' },
                { value: 'tomorrow', label: 'Disponible demain' },
                { value: 'week', label: 'Cette semaine' },
                { value: 'weekend', label: 'Ce week-end' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200">
                  <input
                    type="radio"
                    name="availability"
                    value={option.value}
                    checked={filters.availability === option.value}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      availability: e.target.value
                    }))}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Trier par
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFilters(prev => ({ ...prev, sortBy: option.id }))}
                  className={`p-3 rounded-lg border text-sm transition-colors duration-200 ${
                    filters.sortBy === option.id
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-teal-300'
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex space-x-3">
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] text-white py-4 rounded-xl font-medium hover:from-[#b892b9] hover:to-[#a67ba8] transition-colors duration-200 shadow-lg"
          >
            Appliquer les filtres
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSearchFilters;