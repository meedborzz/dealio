import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Phone, MapPin, Send, User, Search, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Conversation, Message } from '../types';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import SkeletonLoader from '../components/SkeletonLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

const ClientMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markMessagesAsRead();
      setupRealtimeSubscription();
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
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
          business:businesses(
            id,
            name,
            phone,
            address,
            city
          )
        `)
        .eq('client_user_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
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
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          is_read_by_recipient,
          sent_at
        `)
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
        .update({ client_unread_count: 0 })
        .eq('id', selectedConversation.id);

      setConversations(prev => prev.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, client_unread_count: 0 }
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
        .select('id, conversation_id, sender_id, content, is_read_by_recipient, sent_at')
        .single();

      if (error) throw error;

      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          business_unread_count: selectedConversation.business_unread_count + 1
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
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = parseISO(timestamp);
    const now = new Date();
    const diffInMinutes = differenceInMinutes(now, date);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}min`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return format(date, 'dd MMM', { locale: fr });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Connectez-vous</h2>
            <p className="text-muted-foreground mb-6">
              Vous devez être connecté pour accéder à vos messages
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/login')} className="w-full">
                Se connecter
              </Button>
              <Button onClick={() => navigate('/register')} variant="outline" className="w-full">
                Créer un compte
              </Button>
              <Button onClick={() => navigate('/')} variant="ghost" className="w-full">
                Retour à l'accueil
              </Button>
            </div>
            Se connecter
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          {selectedConversation ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedConversation(null)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-xl font-semibold text-white">
            {selectedConversation ? selectedConversation.business?.name : 'Messages'}
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {!selectedConversation ? (
        /* Conversation List */
        <div className="p-4 space-y-4">
          {loading ? (
            <Card>
              <CardContent className="text-center py-12">
                <SkeletonLoader type="deal-card" count={2} />
              </CardContent>
            </Card>
          ) : conversations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Aucune conversation</h3>
                <p className="text-muted-foreground mb-6">
                  Commencez une conversation en contactant un salon depuis sa page
                </p>
                <Button onClick={() => navigate('/')}>
                  Découvrir les salons
                </Button>
              </CardContent>
            </Card>
          ) : (
            conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedConversation(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-foreground truncate">
                            {conversation.business?.name || 'Salon'}
                          </h4>
                          {conversation.client_unread_count > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                              {conversation.client_unread_count}
                            </Badge>
                          )}
                        </div>
                        {conversation.business?.address && (
                          <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{conversation.business.address}</span>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {formatLastMessageTime(conversation.last_message_at)}
                        </p>
                      </div>
                    </div>
                    {conversation.business?.phone && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${conversation.business?.phone}`);
                        }}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Chat View */
        <div className="flex flex-col h-[calc(100vh-160px)]">
          {/* Business Info */}
          <Card className="mx-4 mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{selectedConversation.business?.name}</h3>
                  {selectedConversation.business?.address && (
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{selectedConversation.business.address}</span>
                    </div>
                  )}
                </div>
                {selectedConversation.business?.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`tel:${selectedConversation.business?.phone}`)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Appeler
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    Commencez la conversation
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Envoyez votre premier message à {selectedConversation.business?.name}
                  </p>
                </CardContent>
              </Card>
            ) : (
              messages.map((message) => {
                const isFromUser = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%]`}>
                      <div
                        className={`px-4 py-3 rounded-2xl ${isFromUser
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                          }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      <p className={`text-xs mt-1 ${isFromUser ? 'text-muted-foreground text-right' : 'text-muted-foreground text-left'
                        }`}>
                        {format(parseISO(message.sent_at), 'HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <Card className="mx-4 mb-4">
            <CardContent className="p-4">
              <div className="flex items-end space-x-3">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Tapez votre message..."
                  rows={1}
                  className="flex-1 resize-none"
                  disabled={sendingMessage}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  size="icon"
                >
                  {sendingMessage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientMessagesPage;