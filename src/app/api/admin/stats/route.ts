import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/admin/stats — estatísticas para os gráficos do dashboard
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const totalUsers = await prisma.user.count();
  const bannedUsers = await prisma.user.count({ where: { banned: true } });
  const totalMessages = await prisma.message.count();

  // Mensagens por dia nos últimos 7 dias
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentMessages = await prisma.message.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  });

  const messagesByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    messagesByDay[key] = 0;
  }

  for (const msg of recentMessages) {
    const key = msg.createdAt.toISOString().split('T')[0];
    if (messagesByDay[key] !== undefined) {
      messagesByDay[key]++;
    }
  }

  const messagesChart = Object.entries(messagesByDay).map(([date, count]) => ({
    date,
    messages: count,
  }));

  // Usuários criados por dia nos últimos 7 dias
  const recentUsers = await prisma.user.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  });

  const usersByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    usersByDay[key] = 0;
  }

  for (const usr of recentUsers) {
    const key = usr.createdAt.toISOString().split('T')[0];
    if (usersByDay[key] !== undefined) {
      usersByDay[key]++;
    }
  }

  const usersChart = Object.entries(usersByDay).map(([date, count]) => ({
    date,
    users: count,
  }));

  // Top 5 usuários mais ativos
  const topUsers = await prisma.user.findMany({
    select: {
      name: true,
      _count: { select: { messages: true } },
    },
    orderBy: { messages: { _count: 'desc' } },
    take: 5,
  });

  const topUsersChart = topUsers.map((u) => ({
    name: u.name,
    messages: u._count.messages,
  }));

  return NextResponse.json({
    totalUsers,
    bannedUsers,
    totalMessages,
    messagesChart,
    usersChart,
    topUsersChart,
  });
}
