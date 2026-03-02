import React, { useState, useEffect, useRef } from 'react';
import { Users, Search, Trophy, Calendar, Phone, Mail, Star, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { safeQuery } from '../../lib/supabaseSafe';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { formatCount, formatOptional } from './adminHelpers';

const ITEMS_PER_PAGE = 50;

interface UserProfile {
  id: string;
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  role: string;
  completed_bookings_count?: number;
  loyalty_points?: number;
  created_at?: string;
  updated_at?: string;
}

const AdminClientsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'loyalty' | 'bookings'>('recent');
  const [selectedClient, setSelectedClient] = useState<UserProfile | null>(null);
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
    fetchClients();
  }, [debouncedSearch, sortBy, currentPage]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          phone,
          date_of_birth,
          role,
          completed_bookings_count,
          loyalty_points,
          created_at,
          updated_at
        `, { count: 'exact' })
        .eq('role', 'client');

      if (debouncedSearch) {
        query = query.or(`full_name.ilike.%${debouncedSearch}%,phone.ilike.%${debouncedSearch}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'loyalty':
          query = query.order('loyalty_points', { ascending: false });
          break;
        case 'bookings':
          query = query.order('completed_bookings_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await safeQuery(query.range(from, to));

      if (error) throw error;

      setClients(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const getLoyaltyLevel = (points: number) => {
    if (points >= 1000) return { level: 'Diamant', gradient: 'from-blue-500 to-purple-600', emoji: '💎' };
    if (points >= 500) return { level: 'Platine', gradient: 'from-gray-400 to-gray-600', emoji: '🏆' };
    if (points >= 200) return { level: 'Or', gradient: 'from-yellow-500 to-teal-600', emoji: '👑' };
    if (points >= 50) return { level: 'Argent', gradient: 'from-gray-300 to-gray-500', emoji: '🥈' };
    return { level: 'Bronze', gradient: 'from-teal-300 to-teal-500', emoji: '🥉' };
  };

  const getClientTypeEmoji = (bookings: number, points: number) => {
    if (bookings >= 10 && points >= 500) return '👑'; // VIP
    if (bookings >= 5 && points >= 200) return '⭐'; // Premium
    if (bookings >= 2) return '💎'; // Regular
    if (bookings >= 1) return '🌟'; // New
    return '👤'; // Prospect
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
              <Users className="h-5 w-5 mr-2" />
              Clients ({totalCount})
            </CardTitle>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un client..."
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="recent">Plus récents</option>
                <option value="loyalty">Points fidélité</option>
                <option value="bookings">Réservations</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Clients List */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </CardContent>
        </Card>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Aucun client trouvé</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Aucun résultat pour cette recherche' : 'Aucun client inscrit'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => {
            const loyaltyInfo = getLoyaltyLevel(client.loyalty_points || 0);
            const clientTypeEmoji = getClientTypeEmoji(client.completed_bookings_count || 0, client.loyalty_points || 0);
            
            return (
              <Card key={client.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-xl">{clientTypeEmoji}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-bold text-foreground text-lg">{client.full_name || 'Nom non renseigné'}</h4>
                          <Badge variant="secondary">
                            {loyaltyInfo.level}
                          </Badge>
                        </div>
                        {client.phone && (
                          <div className="flex items-center space-x-2 mb-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground text-sm">{client.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground text-sm">
                            Inscrit le {format(parseISO(client.created_at || new Date().toISOString()), 'dd MMM yyyy', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-primary">{formatCount(client.completed_bookings_count)}</p>
                          <p className="text-xs text-muted-foreground">Réservations</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-primary">{formatCount(client.loyalty_points)}</p>
                          <p className="text-xs text-muted-foreground">Points</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages} ({totalCount} clients)
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

      {/* Client Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du client</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{getClientTypeEmoji(selectedClient.completed_bookings_count || 0, selectedClient.loyalty_points || 0)}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedClient.full_name || 'Nom non renseigné'}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {getLoyaltyLevel(selectedClient.loyalty_points || 0).level}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Informations personnelles</h4>
                  <div className="space-y-2">
                    {selectedClient.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedClient.phone}</span>
                      </div>
                    )}
                    {selectedClient.date_of_birth && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(parseISO(selectedClient.date_of_birth), 'dd MMM yyyy', { locale: fr })}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Inscrit le {format(parseISO(selectedClient.created_at || new Date().toISOString()), 'dd MMM yyyy', { locale: fr })}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Statistiques</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Réservations complétées</span>
                      <span className="font-bold">{formatCount(selectedClient.completed_bookings_count)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Points de fidélité</span>
                      <span className="font-bold">{formatCount(selectedClient.loyalty_points)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Niveau</span>
                      <Badge variant="secondary">
                        {getLoyaltyLevel(selectedClient.loyalty_points || 0).level}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClientsPage;