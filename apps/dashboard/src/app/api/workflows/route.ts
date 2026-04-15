import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workflows = await prisma.workflow.findMany({
    where: { userId: session.user.id },
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(workflows);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, triggerType } = body;

  const workflow = await prisma.workflow.create({
    data: {
      userId: session.user.id,
      name,
      description,
      triggerType: triggerType || 'manual',
      status: 'DRAFT',
    },
  });

  return NextResponse.json(workflow);
}