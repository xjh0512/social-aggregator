import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { stepId } = await params;

  await prisma.workflowStep.delete({
    where: { id: stepId },
  });

  return NextResponse.json({ success: true });
}