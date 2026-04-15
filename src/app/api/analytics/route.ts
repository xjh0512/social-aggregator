import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('accountId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const where: any = { userId: session.user.id };

  if (accountId) {
    where.accountId = accountId;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const analytics = await prisma.analytics.findMany({
    where,
    orderBy: { date: 'desc' },
    take: 30,
    include: {
      account: {
        select: {
          platform: true,
          username: true,
        },
      },
    },
  });

  return NextResponse.json(analytics);
}