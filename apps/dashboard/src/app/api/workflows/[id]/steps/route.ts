import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: workflowId } = await params;
  const body = await request.json();
  const { type, config, accountId } = body;

  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId: session.user.id },
  });

  if (!workflow) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  }

  const lastStep = await prisma.workflowStep.findFirst({
    where: { workflowId },
    orderBy: { order: 'desc' },
  });

  const step = await prisma.workflowStep.create({
    data: {
      workflowId,
      accountId,
      type,
      order: (lastStep?.order || 0) + 1,
      config: config || {},
    },
  });

  return NextResponse.json(step);
}