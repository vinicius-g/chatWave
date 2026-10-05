'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Ban, ShieldCheck, Users, MessageSquare, Activity, Eye, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
  _count: { messages: number };
};

type AdminMessage = {
  id: string;
  text: string;
  createdAt: string;
  user: { name: string; email: string };
};

type Stats = {
  totalUsers: number;
  bannedUsers: number;
  totalMessages: number;
  messagesChart: Array<{ date: string; messages: number }>;
  usersChart: Array<{ date: string; users: number }>;
  topUsersChart: Array<{ name: string; messages: number }>;
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && session.user.role !== 'ADMIN') {
      router.push('/chat');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (!session?.user || session.user.role !== 'ADMIN') return;

    const socketInstance = io({
      path: '/api/socket',
      auth: {
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
    });
    socketRef.current = socketInstance;

    return () => {
      socketRef.current = null;
      socketInstance.disconnect();
    };
  }, [session]);

  const loadData = async () => {
    setLoading(true);
    const [usersRes, statsRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/stats'),
    ]);

    if (usersRes.ok) {
      setUsers(await usersRes.json());
    }
    if (statsRes.ok) {
      setStats(await statsRes.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') return;

    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [session]);

  const toggleBan = async (user: AdminUser) => {
    const res = await fetch('/api/admin/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, banned: !user.banned }),
    });

    if (res.ok) {
      socketRef.current?.emit('ban-user', user.id);
      await loadData();
    }
  };

  const viewMessages = async (user: AdminUser) => {
    setSelectedUser(user);
    const res = await fetch(`/api/admin/messages?userId=${user.id}`);
    if (res.ok) {
      setSelectedMessages(await res.json());
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-300 flex items-center justify-center">
        Loading admin dashboard...
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-purple-300" />
              </div>
              <h1 className="text-3xl font-black">Admin Dashboard</h1>
            </div>
            <p className="text-gray-400">Monitor users, moderate messages, and track platform activity.</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {stats && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={<Users className="w-6 h-6" />} label="Total Users" value={stats.totalUsers} accent="text-indigo-300" />
              <StatCard icon={<MessageSquare className="w-6 h-6" />} label="Total Messages" value={stats.totalMessages} accent="text-green-300" />
              <StatCard icon={<Ban className="w-6 h-6" />} label="Banned Users" value={stats.bannedUsers} accent="text-red-300" />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartPanel title="Messages in the Last 7 Days">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={stats.messagesChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                    <Line type="monotone" dataKey="messages" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8' }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="Top Users by Messages">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats.topUsersChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                    <Bar dataKey="messages" fill="#a855f7" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>
            </section>
          </>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
          <div className="bg-gray-900/70 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-300" />
              <h2 className="font-bold">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-gray-400">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">User</th>
                    <th className="text-left px-5 py-3 font-medium">Role</th>
                    <th className="text-left px-5 py-3 font-medium">Messages</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-right px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{user.name}</div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs border ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-300">{user._count.messages}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs border ${user.banned ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-green-500/10 text-green-300 border-green-500/20'}`}>
                          {user.banned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => viewMessages(user)}
                            className="p-2 text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="View messages"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleBan(user)}
                            disabled={user.id === session.user.id || user.role === 'ADMIN'}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${user.banned ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'}`}
                            title={user.banned ? 'Unban user' : 'Ban user immediately'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-900/70 border border-white/10 rounded-2xl overflow-hidden shadow-2xl lg:sticky lg:top-24">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="font-bold">User Messages</h2>
              <p className="text-xs text-gray-500 mt-1">
                {selectedUser ? `${selectedUser.name} — ${selectedMessages.length} recent messages` : 'Select a user to inspect their messages.'}
              </p>
            </div>
            <div className="p-4 max-h-[640px] overflow-y-auto chat-scroll space-y-3">
              {!selectedUser ? (
                <div className="py-16 text-center text-gray-500">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                  <p>Select a user from the table.</p>
                </div>
              ) : selectedMessages.length === 0 ? (
                <p className="py-16 text-center text-gray-500">This user has not sent messages yet.</p>
              ) : (
                selectedMessages.map((message) => (
                  <div key={message.id} className="bg-white/5 border border-white/5 rounded-xl p-3">
                    <p className="text-sm text-gray-100 leading-relaxed">{message.text}</p>
                    <p className="text-[11px] text-gray-500 mt-2">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: string }) {
  return (
    <div className="bg-gray-900/70 border border-white/10 rounded-2xl p-5 shadow-2xl">
      <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${accent}`}>
        {icon}
      </div>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900/70 border border-white/10 rounded-2xl p-5 shadow-2xl">
      <h2 className="font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}
