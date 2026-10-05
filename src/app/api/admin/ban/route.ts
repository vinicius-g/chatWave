import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST /api/admin/ban — banir/desbanir um usuário
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { userId, banned } = await req.json();

  if (typeof userId !== 'string' || !userId || typeof banned !== 'boolean') {
    return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
  }

  // Impede que o admin se bana
  if (userId === session.user.id) {
    return NextResponse.json(
      { error: 'You cannot ban yourself.' },
      { status: 400 }
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (targetUser.role === 'ADMIN') {
    return NextResponse.json(
      { error: 'Administrator accounts cannot be banned.' },
      { status: 400 }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { banned },
    select: {
      id: true,
      name: true,
      email: true,
      banned: true,
    },
  });

  return NextResponse.json(updatedUser);
}
