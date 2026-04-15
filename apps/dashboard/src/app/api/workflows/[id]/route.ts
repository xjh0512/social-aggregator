import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const workflow = await prisma.workflow.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      steps: {
        orderBy: { order: 'asc' },
        include: {
          account: true,
        },
      },
    },
  });

  if (!workflow) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(workflow);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const workflow = await prisma.workflow.updateMany({
    where: {
      id,
      userId: session.user.id,
    },
    data: body,
  });

  return NextResponse.json(workflow);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await prisma.workflow.deleteMany({
    where: {
      id,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}