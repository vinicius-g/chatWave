'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Send, Users, MessageSquare, ShieldAlert } from 'lucide-react';
import Navbar from '@/components/Navbar';

type ChatUser = {
  id: string;
  name: string;
  email?: string;
  role?: string;
};

type ChatMessage = {
  id: string;
  text: string;
  createdAt: string;
  user: ChatUser;
};

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;

    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(() => setError('Failed to load message history.'));

    const socketInstance = io({
      path: '/api/socket',
      auth: {
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setError('');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('online-users', (users: ChatUser[]) => {
      setOnlineUsers(users);
    });

    socketInstance.on('new-message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on('user-banned', (userId: string) => {
      if (userId === session.user.id) {
        setError('Your account has been banned. You will be signed out.');
        setTimeout(() => router.push('/login'), 1500);
      }
    });

    socketInstance.on('connect_error', () => {
      setError('Could not connect to the chat server.');
    });

    socketRef.current = socketInstance;

    return () => {
      socketRef.current = null;
      socketInstance.disconnect();
    };
  }, [session, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !session?.user) return;

    setNewMessage('');

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed }),
    });

    const savedMessage = await res.json();

    if (!res.ok) {
      setError(savedMessage.error || 'Failed to send message.');
      return;
    }

    socketRef.current?.emit('send-message', savedMessage);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-300">
        Loading chat...
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 min-h-0">
        <section className="bg-gray-900/70 border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-[calc(100vh-8rem)] shadow-2xl">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gray-900/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Global Chat</h1>
                <p className="text-xs text-gray-400">Talk with everyone online right now</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {error && (
            <div className="m-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex-1 overflow-y-auto chat-scroll p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center">
                <MessageSquare className="w-12 h-12 mb-3 text-gray-700" />
                <p className="font-medium">No messages yet.</p>
                <p className="text-sm">Be the first person to start the conversation.</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.user.id === session.user.id;
                return (
                  <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {message.user.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className={`max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 font-medium">{message.user.name}</span>
                        {message.user.role === 'ADMIN' && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-full">
                            ADMIN
                          </span>
                        )}
                        <span className="text-[10px] text-gray-600">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`${isOwn ? 'bg-indigo-600 rounded-tr-sm' : 'bg-white/10 rounded-tl-sm'} px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-lg`}>
                        {message.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-white/10 bg-gray-900/80 flex gap-3">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800/80 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </section>

        <aside className="bg-gray-900/70 border border-white/10 rounded-2xl overflow-hidden shadow-2xl h-fit lg:sticky lg:top-24">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              <h2 className="font-bold">Online Now</h2>
            </div>
            <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">
              {onlineUsers.length}
            </span>
          </div>
          <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto chat-scroll">
            {onlineUsers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No online users yet.</p>
            ) : (
              onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                      {user.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      {user.role === 'ADMIN' && <span className="text-[9px] text-purple-300">ADMIN</span>}
                    </div>
                    <p className="text-xs text-green-400">Online</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
