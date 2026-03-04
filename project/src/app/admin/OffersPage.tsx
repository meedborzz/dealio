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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Offres ({totalCount})
            </CardTitle>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une offre..."
                  className="pl-10 w-full"
                />
              </div>
              <select
                value={businessFilter}
                onChange={(e) => setBusinessFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground w-full sm:w-auto"
              >
                <option value="all">Tous les établissements</option>
                {businesses.map(business => (
                  <option key={business.id} value={business.id}>{business.name}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground w-full sm:w-auto"
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
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto text-center sm:text-left">
                    <img
                      src={deal.image_url || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={deal.title}
                      className="w-20 h-20 sm:w-16 sm:h-16 rounded-lg object-cover shrink-0 mx-auto sm:mx-0 shadow-sm"
                    />
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                        <h4 className="font-bold text-foreground text-lg truncate w-full sm:w-auto text-center">{deal.title}</h4>
                        <Badge variant={deal.is_active ? 'approved' : 'draft' as any} className="shrink-0 text-[10px] px-2 py-0.5 h-auto min-h-[16px] leading-none uppercase tracking-wider font-bold w-fit mx-auto sm:mx-0">
                          {deal.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2 w-full">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground text-sm truncate">{deal.business?.name} • {deal.business?.city}</span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{deal.description}</p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-primary">{deal.discounted_price} DH</span>
                          <span className="text-sm text-muted-foreground line-through">{deal.original_price} DH</span>
                          <span className="text-xs font-bold text-white bg-green-500 rounded px-1.5 py-0.5">-{deal.discount_percentage}%</span>
                        </div>
                        <div className="flex items-center space-x-1.5 bg-muted/40 px-2.5 py-1 rounded-md border border-border/50">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground font-medium">
                            Expire le {format(parseISO(deal.valid_until || new Date().toISOString()), 'dd MMM', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center justify-center gap-3 md:gap-2 w-full md:w-auto border-t md:border-t-0 border-border pt-4 md:pt-0 mt-2 md:mt-0">
                    <Button
                      onClick={() => handleToggleActive(deal.id, deal.is_active)}
                      variant="outline"
                      size="sm"
                      className={`flex-1 md:w-full ${deal.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                    >
                      {deal.is_active ? <EyeOff className="h-4 w-4 md:mr-2" /> : <Eye className="h-4 w-4 md:mr-2" />}
                      <span className="hidden md:inline">{deal.is_active ? 'Désactiver' : 'Activer'}</span>
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedDeal(deal);
                        setShowDetails(true);
                      }}
                      variant="default"
                      size="sm"
                      className="flex-1 md:w-full shadow-sm"
                    >
                      <Eye className="h-4 w-4 mr-2 md:mr-2 md:inline hidden" />
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
            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-xl border border-border/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground font-medium block text-xs uppercase tracking-wider mb-1">Prix original</span>
                  <p className="font-medium text-foreground text-base strike-through opacity-70">{formatMoney(selectedDeal.original_price)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium block text-xs uppercase tracking-wider mb-1">Prix réduit</span>
                  <p className="font-bold text-primary text-xl">{formatMoney(selectedDeal.discounted_price)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium block text-xs uppercase tracking-wider mb-1">Réduction</span>
                  <p className="font-bold text-green-600 text-lg">{formatOptional(selectedDeal.discount_percentage ? `-${selectedDeal.discount_percentage}%` : null)}</p>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-4 text-sm">
                <div>
                  <span className="text-muted-foreground font-medium block text-xs uppercase tracking-wider mb-1">Établissement</span>
                  <p className="font-semibold text-foreground">{formatOptional(selectedDeal.business?.name)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium block text-xs uppercase tracking-wider mb-1">Description</span>
                  <p className="text-foreground leading-relaxed text-sm">{formatOptional(selectedDeal.description)}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Fermer
                </Button>
                <Button
                  onClick={() => handleToggleActive(selectedDeal.id, selectedDeal.is_active)}
                  className={`flex-1 ${selectedDeal.is_active
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