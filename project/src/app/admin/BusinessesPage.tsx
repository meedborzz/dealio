import React, { useState, useEffect, useRef } from 'react';
import { Building2, Check, X, Eye, Search, MapPin, Phone, Mail, Star, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { safeQuery, safeSingle } from '../../lib/supabaseSafe';
import { Business } from '../../types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { formatCount, formatRating, formatOptional } from './adminHelpers';

const ITEMS_PER_PAGE = 50;

const AdminBusinessesPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended'>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    fetchBusinesses();
  }, [debouncedSearch, statusFilter, currentPage]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('businesses')
        .select(`
          id,
          name,
          description,
          address,
          city,
          phone,
          email,
          website,
          category,
          rating,
          review_count,
          status,
          total_validated_bookings,
          created_at,
          updated_at
        `, { count: 'exact' });

      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,city.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await safeQuery(
        query
          .order('created_at', { ascending: false })
          .range(from, to)
      );

      if (error) throw error;

      setBusinesses(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setError('Failed to load businesses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (businessId: string, newStatus: 'approved' | 'rejected' | 'suspended') => {
    try {
      const { error } = await safeQuery(
        supabase
          .from('businesses')
          .update({ status: newStatus })
          .eq('id', businessId)
      );

      if (error) throw error;

      setBusinesses(prev => prev.map(business =>
        business.id === businessId ? { ...business, status: newStatus } : business
      ));

      const statusText =
        newStatus === 'approved' ? 'approuvé' :
        newStatus === 'rejected' ? 'rejeté' : 'suspendu';

      alert(`Établissement ${statusText} avec succès`);
    } catch (error) {
      console.error('Error updating business status:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'from-green-500 to-emerald-600';
      case 'pending': return 'from-teal-500 to-amber-600';
      case 'rejected': return 'from-red-500 to-pink-600';
      case 'suspended': return 'from-gray-500 to-slate-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      case 'suspended': return '⚠️';
      default: return '📋';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'approved';
      case 'pending': return 'pending';
      case 'rejected': return 'rejected';
      case 'suspended': return 'destructive';
      default: return 'draft';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Établissements ({totalCount})
            </CardTitle>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Tous</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
                <option value="rejected">Rejetés</option>
                <option value="suspended">Suspendus</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Businesses List */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </CardContent>
        </Card>
      ) : businesses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Aucun établissement trouvé</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Aucun résultat pour cette recherche' : 'Aucun établissement inscrit'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {businesses.map((business) => (
            <Card key={business.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-bold text-foreground">{business.name}</h4>
                        <Badge variant={getStatusVariant(business.status)}>
                          {getStatusText(business.status)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{business.city} • {business.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{business.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{business.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {business.description && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{business.description}</p>
                )}

                {/* Business Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{formatCount(business.total_validated_bookings)}</p>
                    <p className="text-xs text-muted-foreground">Réservations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{formatRating(business.rating)}</p>
                    <p className="text-xs text-muted-foreground">Note</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{formatCount(business.review_count)}</p>
                    <p className="text-xs text-muted-foreground">Avis</p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {business.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(business.id, 'rejected')}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(business.id, 'approved')}
                        size="sm"
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approuver
                      </Button>
                    </>
                  )}

                  {business.status === 'approved' && (
                    <Button
                      onClick={() => handleStatusUpdate(business.id, 'suspended')}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-purple-600 hover:bg-purple-50 border-purple-200"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Suspendre
                    </Button>
                  )}

                  {business.status === 'suspended' && (
                    <Button
                      onClick={() => handleStatusUpdate(business.id, 'approved')}
                      size="sm"
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Réactiver
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      setSelectedBusiness(business);
                      setShowDetails(true);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages} ({totalCount} établissements)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={!hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!hasNextPage}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Details Modal */}
      {showDetails && selectedBusiness && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>{selectedBusiness.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground font-medium">Adresse:</span>
                  <p className="font-medium text-foreground">{formatOptional(selectedBusiness.address)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Email:</span>
                  <p className="font-medium text-foreground">{formatOptional(selectedBusiness.email)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Téléphone:</span>
                  <p className="font-medium text-foreground">{formatOptional(selectedBusiness.phone)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Site web:</span>
                  <p className="font-medium text-foreground">{formatOptional(selectedBusiness.website)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Note:</span>
                  <p className="font-medium text-foreground">{formatRating(selectedBusiness.rating)}{selectedBusiness.rating ? '/5' : ''}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Réservations:</span>
                  <p className="font-medium text-foreground">{formatCount(selectedBusiness.total_validated_bookings)}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-muted-foreground font-medium">Description:</span>
                  <p className="font-medium text-foreground">{formatOptional(selectedBusiness.description)}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminBusinessesPage;