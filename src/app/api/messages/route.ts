import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/messages — carrega histórico de mensagens
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: 'asc' },
    take: 100,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          banned: true,
        },
      },
    },
  });

  return NextResponse.json(messages);
}

// POST /api/messages — salva uma nova mensagem
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verifica se o usuário foi banido
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!currentUser || currentUser.banned) {
    return NextResponse.json(
      { error: 'You are banned and cannot send messages.' },
      { status: 403 }
    );
  }

  const { text } = await req.json();

  if (typeof text !== 'string' || !text.trim()) {
    return NextResponse.json(
      { error: 'Message cannot be empty.' },
      { status: 400 }
    );
  }

  if (text.trim().length > 1000) {
    return NextResponse.json(
      { error: 'Message cannot exceed 1000 characters.' },
      { status: 400 }
    );
  }

  const newMessage = await prisma.message.create({
    data: {
      text: text.trim(),
      userId: session.user.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return NextResponse.json(newMessage, { status: 201 });
}
