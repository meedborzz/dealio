import React, { useState, useEffect, useRef } from 'react';
import { Star, Eye, EyeOff, Search, MapPin, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { safeQuery, safeSingle } from '../../lib/supabaseSafe';
import { Deal } from '../../shared/types/contracts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { formatMoney, formatOptional } from './adminHelpers';

const ITEMS_PER_PAGE = 50;

const AdminOffersPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [businesses, setBusinesses] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [businessFilter, setBusinessFilter] = useState<string>('all');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
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
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [debouncedSearch, statusFilter, businessFilter, currentPage]);

  const fetchBusinesses = async () => {
    try {
      const { data } = await safeQuery(
        supabase
          .from('businesses')
          .select('id, name')
          .eq('status', 'approved')
          .order('name')
      );
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('deals')
        .select(`
          id,
          title,
          description,
          image_url,
          original_price,
          discounted_price,
          discount_percentage,
          valid_until,
          is_active,
          duration_minutes,
          created_at,
          business_id
        `, { count: 'exact' });

      if (debouncedSearch) {
        query = query.or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('is_active', statusFilter === 'active');
      }

      if (businessFilter !== 'all') {
        query = query.eq('business_id', businessFilter);
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await safeQuery(
        query
          .order('created_at', { ascending: false })
          .range(from, to)
      );

      if (error) throw error;

      // Fetch business data separately for each deal
      const dealsWithBusiness = await Promise.all(
        (data || []).map(async (deal) => {
          const { data: businessData } = await safeSingle(
            supabase
              .from('businesses')
              .select(`
                id,
                name,
                city,
                status
              `)
              .eq('id', deal.business_id)
              .maybeSingle()
          );

          return {
            ...deal,
            business: businessData
          };
        })
      );

      setDeals(dealsWithBusiness);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setError('Failed to load offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (dealId: string, currentStatus: boolean) => {
    try {
      const { error } = await safeQuery(
        supabase
          .from('deals')
          .update({ is_active: !currentStatus })
          .eq('id', dealId)
      );

      if (error) throw error;

      setDeals(prev => prev.map(deal =>
        deal.id === dealId ? { ...deal, is_active: !currentStatus } : deal
      ));

      const statusText = !currentStatus ? 'activée' : 'désactivée';
      alert(`Offre ${statusText} avec succès`);
    } catch (error) {
      console.error('Error toggling deal status:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

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
              <Star className="h-5 w-5 mr-2" />
              Offres ({totalCount})
            </CardTitle>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une offre..."
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={businessFilter}
                onChange={(e) => setBusinessFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Tous les établissements</option>
                {businesses.map(business => (
                  <option key={business.id} value={business.id}>{business.name}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Toutes</option>
                <option value="active">Actives</option>
                <option value="inactive">Inactives</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Offers List */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </CardContent>
        </Card>
      ) : deals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Aucune offre trouvée</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Aucun résultat pour cette recherche' : 'Aucune offre publiée'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => (
            <Card key={deal.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img
                      src={deal.image_url || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={deal.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-foreground text-lg">{deal.title}</h4>
                        <Badge variant={deal.is_active ? 'approved' : 'draft'}>
                          {deal.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-sm">{deal.business?.name} • {deal.business?.city}</span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{deal.description}</p>
                      <div className="flex items-center space-x-4">
                        <span className="text-xl font-bold text-primary">{deal.discounted_price} DH</span>
                        <span className="text-sm text-muted-foreground line-through">{deal.original_price} DH</span>
                        <span className="text-sm text-green-600 font-bold">-{deal.discount_percentage}%</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Expire le {format(parseISO(deal.valid_until || new Date().toISOString()), 'dd MMM', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleToggleActive(deal.id, deal.is_active)}
                      variant="outline"
                      size="sm"
                      className={deal.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                    >
                      {deal.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedDeal(deal);
                        setShowDetails(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Détails
                    </Button>
                  </div>
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
                Page {currentPage} sur {totalPages} ({totalCount} offres)
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

      {/* Deal Details Modal */}
      {showDetails && selectedDeal && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>{selectedDeal.title}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground font-medium">Prix original:</span>
                  <p className="font-medium text-foreground">{formatMoney(selectedDeal.original_price)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Prix réduit:</span>
                  <p className="font-medium text-foreground">{formatMoney(selectedDeal.discounted_price)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Réduction:</span>
                  <p className="font-medium text-foreground">{formatOptional(selectedDeal.discount_percentage ? `${selectedDeal.discount_percentage}%` : null)}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-muted-foreground font-medium">Établissement:</span>
                  <p className="font-medium text-foreground">{formatOptional(selectedDeal.business?.name)}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-muted-foreground font-medium">Description:</span>
                  <p className="font-medium text-foreground">{formatOptional(selectedDeal.description)}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Fermer
                </Button>
                <Button
                  onClick={() => handleToggleActive(selectedDeal.id, selectedDeal.is_active)}
                  className={`flex-1 ${
                    selectedDeal.is_active 
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {selectedDeal.is_active ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {selectedDeal.is_active ? 'Désactiver' : 'Activer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminOffersPage;