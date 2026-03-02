import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

interface InAppMessagingProps {
    businessId: string;
    businessName: string;
    onClose: () => void;
}

const InAppMessaging: React.FC<InAppMessagingProps> = ({ businessId, businessName, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && businessId) {
            initConversation();
        }
    }, [user, businessId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const initConversation = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Try to find existing conversation
            const { data: existing } = await supabase
                .from('conversations')
                .select('id')
                .eq('client_id', user.id)
                .eq('business_id', businessId)
                .maybeSingle();

            let convId = existing?.id;

            if (!convId) {
                // Create new conversation
                const { data: created, error } = await supabase
                    .from('conversations')
                    .insert({ client_id: user.id, business_id: businessId })
                    .select('id')
                    .single();
                if (error) throw error;
                convId = created?.id;
            }

            if (convId) {
                setConversationId(convId);
                await loadMessages(convId);
            }
        } catch (err) {
            console.error('Failed to init conversation:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (convId: string) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true });
        if (data) setMessages(data as Message[]);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !conversationId || !user || sending) return;
        setSending(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({ conversation_id: conversationId, sender_id: user.id, content: newMessage.trim() })
                .select()
                .single();
            if (error) throw error;
            if (data) setMessages(prev => [...prev, data as Message]);
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-background border border-border rounded-xl shadow-2xl flex flex-col z-50" style={{ height: '420px' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-primary/5 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm truncate">{businessName}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        Chargement…
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm text-center px-4">
                        Aucun message pour l'instant. Envoyez un message pour démarrer la conversation.
                    </div>
                ) : (
                    messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${msg.sender_id === user?.id
                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                        : 'bg-muted text-foreground rounded-bl-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
                {user ? (
                    <>
                        <Input
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Votre message…"
                            className="flex-1 text-sm h-9"
                            disabled={sending}
                        />
                        <Button size="icon" className="h-9 w-9 shrink-0" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <p className="text-xs text-muted-foreground text-center w-full py-1">
                        Connectez-vous pour envoyer un message.
                    </p>
                )}
            </div>
        </div>
    );
};

export default InAppMessaging;
