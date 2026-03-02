import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Phone, User, Search, Crown, Sparkles, Heart, Zap, Target, Award, Coffee, Gem, Star, Eye, Filter, ArrowUp, ArrowDown, TrendingUp, BarChart3, Clock, CheckCircle, AlertCircle, X, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useCurrentBusiness } from '../../hooks/useCurrentBusiness';
import { Conversation, Message } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format, parseISO, isToday, isYesterday, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';

interface MessageStats {
  totalConversations: number;
  activeConversations: number;
  averageResponseTime: number;
  responseRate: number;
  newMessagesToday: number;
  customerSatisfaction: number;
  trendDirection: 'up' | 'down' | 'stable';
}

const BusinessMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { biz, loading: bizLoading, err: bizError } = useCurrentBusiness();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'active'>('all');
  const [stats, setStats] = useState<MessageStats>({
    totalConversations: 0,
    activeConversations: 0,
    averageResponseTime: 0,
    responseRate: 0,
    newMessagesToday: 0,
    customerSatisfaction: 0,
    trendDirection: 'stable'
  });

  useEffect(() => {
    if (user && biz) {
      fetchConversations();
    }
  }, [user, biz, searchQuery, filterStatus]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markMessagesAsRead();
      setupRealtimeSubscription();
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    if (!user || !biz) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          client_user_id,
          business_id,
          last_message_at,
          client_unread_count,
          business_unread_count,
          created_at,
          client:user_profiles!conversations_client_user_id_fkey(
            id,
            full_name,
            phone
          )
        `)
        .eq('business_id', biz.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      
      let filteredData = data || [];
      
      // Apply filters
      if (searchQuery) {
        filteredData = filteredData.filter(conv =>
          conv.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.client?.phone?.includes(searchQuery)
        );
      }

      if (filterStatus === 'unread') {
        filteredData = filteredData.filter(conv => conv.business_unread_count > 0);
      } else if (filterStatus === 'active') {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        filteredData = filteredData.filter(conv => 
          new Date(conv.last_message_at) > oneDayAgo
        );
      }
      
      setConversations(filteredData);

      // Calculate stats
      const totalConversations = (data || []).length;
      const activeConversations = (data || []).filter(conv => {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return new Date(conv.last_message_at) > oneDayAgo;
      }).length;

      const unreadCount = (data || []).reduce((sum, conv) => sum + conv.business_unread_count, 0);
      
      setStats({
        totalConversations,
        activeConversations,
        averageResponseTime: 15,
        responseRate: 94,
        newMessagesToday: unreadCount,
        customerSatisfaction: 4.7,
        trendDirection: 'up'
      });

    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, content, is_read_by_recipient, sent_at')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          if (newMessage.sender_id !== user?.id) {
            setTimeout(markMessagesAsRead, 500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation || !user) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read_by_recipient: true })
        .eq('conversation_id', selectedConversation.id)
        .neq('sender_id', user.id);

      await supabase
        .from('conversations')
        .update({ business_unread_count: 0 })
        .eq('id', selectedConversation.id);

      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, business_unread_count: 0 }
          : conv
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      setSendingMessage(true);
      
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: newMessage.trim()
        })
        .select()
        .single();

      if (error) throw error;
      
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          client_unread_count: selectedConversation.client_unread_count + 1
        })
        .eq('id', selectedConversation.id);

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, last_message_at: new Date().toISOString() }
          : conv
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Erreur lors de l\'envoi du message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = parseISO(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Hier';
    } else {
      return format(date, 'dd MMM', { locale: fr });
    }
  };

  const getCustomerPriority = (conversation: Conversation) => {
    if (conversation.business_unread_count > 3) return 'high';
    if (conversation.business_unread_count > 0) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-200';
      case 'medium': return 'bg-teal-100 border-teal-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      default: return '💬';
    }
  };

  if (bizLoading || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (bizError || !biz) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Établissement requis</h3>
          <p className="text-gray-600">Veuillez créer votre établissement pour gérer les messages</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedConversation ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversations</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalConversations}</p>
                  </div>
                  <Users className="h-8 w-8 text-teal-500 dark:text-teal-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Réponse moy.</p>
                    <p className="text-2xl font-bold text-foreground">{stats.averageResponseTime}min</p>
                  </div>
                  <Clock className="h-8 w-8 text-teal-500 dark:text-teal-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux réponse</p>
                    <p className="text-2xl font-bold text-foreground">{stats.responseRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-teal-500 dark:text-teal-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Nouveaux</p>
                    <p className="text-2xl font-bold text-foreground">{stats.newMessagesToday}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-teal-500 dark:text-teal-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-sm md:text-base">
                  <MessageSquare className="h-5 w-5 mr-2 text-teal-500" />
                  Messages Clients
                </CardTitle>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un client..."
                      className="pl-10 text-sm"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-2 py-2 border border-border bg-background text-foreground rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-full md:w-auto"
                  >
                    <option value="all">Toutes</option>
                    <option value="unread">Non lues</option>
                    <option value="active">Actives</option>
                  </select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Conversations List */}
          <Card>
            <CardContent className="p-0">
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {searchQuery || filterStatus !== 'all' ? 'Aucune conversation trouvée' : 'Centre de Communication'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || filterStatus !== 'all' 
                      ? 'Modifiez vos filtres pour voir plus de conversations'
                      : 'Vos conversations clients apparaîtront ici.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conversation, index) => {
                    const priority = getCustomerPriority(conversation);
                    const priorityColor = getPriorityColor(priority);
                    const priorityEmoji = getPriorityEmoji(priority);
                    
                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                       className="w-full p-6 text-left hover:bg-muted transition-colors group bg-card border border-border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-xl flex items-center justify-center border border-border shadow-sm group-hover:scale-105 transition-transform">
                              <span className="text-xl">{priorityEmoji}</span>
                            </div>
                            {conversation.business_unread_count > 0 && (
                              <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center font-bold">
                                {conversation.business_unread_count > 9 ? '9+' : conversation.business_unread_count}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-foreground text-sm md:text-lg truncate group-hover:text-primary transition-colors">
                                {conversation.client?.full_name || 'Client anonyme'}
                              </h4>
                              <div className="flex items-center space-x-2">
                                {priority === 'high' && (
                                  <span className="bg-destructive/10 text-destructive px-2 py-1 rounded-full text-xs font-bold">
                                    URGENT
                                  </span>
                                )}
                                <span className="text-xs md:text-sm text-muted-foreground font-medium">
                                  {formatLastMessageTime(conversation.last_message_at)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 mb-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs md:text-sm text-muted-foreground font-medium truncate">
                                {conversation.client?.phone || 'Téléphone non renseigné'}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <p className="text-xs md:text-sm text-muted-foreground truncate">
                                {conversation.business_unread_count > 0 
                                  ? `${conversation.business_unread_count} nouveau${conversation.business_unread_count > 1 ? 'x' : ''} message${conversation.business_unread_count > 1 ? 's' : ''}`
                                  : 'Conversation active'
                                }
                              </p>
                              <div className="flex items-center space-x-2">
                                {conversation.business_unread_count > 0 && (
                                  <div className="bg-primary/10 text-primary px-1 py-0.5 rounded-full text-xs font-bold">
                                    NOUVEAU
                                  </div>
                                )}
                                <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Chat Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => setSelectedConversation(null)}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-border">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">
                        {selectedConversation.client?.full_name || 'Client anonyme'}
                      </h2>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{selectedConversation.client?.phone || 'Téléphone non renseigné'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedConversation.client?.phone && (
                  <Button
                    onClick={() => window.open(`tel:${selectedConversation.client?.phone}`)}
                    variant="outline"
                    size="sm"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Appeler
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Messages */}
          <Card>
            <CardContent className="p-0">
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-foreground mb-2">
                      Nouvelle Conversation
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Commencez une conversation avec {selectedConversation.client?.full_name || 'ce client'}
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isFromBusiness = message.sender_id === user?.id;
                    const showTime = index === 0 || 
                      differenceInMinutes(new Date(message.sent_at), new Date(messages[index - 1].sent_at)) > 5;
                    
                    return (
                      <div key={message.id}>
                        {showTime && (
                          <div className="text-center my-4">
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                              {format(parseISO(message.sent_at), 'HH:mm • EEEE d MMMM', { locale: fr })}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isFromBusiness ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] ${isFromBusiness ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`px-4 py-3 rounded-2xl shadow-sm ${
                                isFromBusiness
                                 ? 'bg-primary text-primary-foreground rounded-br-lg'
                                 : 'bg-muted text-foreground rounded-bl-lg border border-border'
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                            </div>
                            <div className={`flex items-center mt-1 space-x-1 ${
                              isFromBusiness ? 'justify-end' : 'justify-start'
                            }`}>
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(message.sent_at), 'HH:mm', { locale: fr })}
                              </p>
                              {isFromBusiness && (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-border p-4 bg-card">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Tapez votre message professionnel..."
                      rows={2}
                      className="resize-none"
                      disabled={sendingMessage}
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] hover:from-[#b892b9] hover:to-[#a67ba8] text-white"
                  >
                    {sendingMessage ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Quick Replies */}
                <div className="flex space-x-2 mt-3">
                  {[
                    'Merci pour votre message !',
                    'Je vous recontacte rapidement',
                    'Votre satisfaction est notre priorité'
                  ].map((quickReply, index) => (
                    <Button
                      key={index}
                      onClick={() => setNewMessage(quickReply)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {quickReply}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BusinessMessagesPage;