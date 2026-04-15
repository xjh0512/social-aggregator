import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createPlatformAdapter } from '@/lib/platform';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { accountId, content, mediaUrls, scheduledAt } = body;

  if (!accountId || !content) {
    return NextResponse.json(
      { error: 'Account ID and content required' },
      { status: 400 }
    );
  }

  const account = await prisma.socialAccount.findFirst({
    where: {
      id: accountId,
      userId: session.user.id,
    },
  });

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  if (scheduledAt) {
    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        accountId,
        platform: account.platform,
        content: JSON.stringify({ text: content, mediaUrls }),
        mediaUrls: mediaUrls || [],
        status: 'SCHEDULED',
        scheduledAt: new Date(scheduledAt),
      },
    });
    return NextResponse.json({ postId: post.id, status: 'scheduled' });
  }

  const adapter = createPlatformAdapter(account.platform);
  const result = await adapter.createPost(account.accessToken, {
    text: content,
    entities: {},
    media: mediaUrls?.map((url: string) => ({
      type: 'image' as const,
      url,
    })),
  });

  const post = await prisma.post.create({
    data: {
      userId: session.user.id,
      accountId,
      platform: account.platform,
      platformPostId: result.platformPostId,
      content: JSON.stringify({ text: content, mediaUrls }),
      mediaUrls: mediaUrls || [],
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  return NextResponse.json({ postId: post.id, status: 'published' });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('accountId');
  const status = searchParams.get('status');

  const where: any = { userId: session.user.id };
  if (accountId) where.accountId = accountId;
  if (status) where.status = status.toUpperCase();

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      account: {
        select: {
          platform: true,
          username: true,
        },
      },
    },
  });

  return NextResponse.json(posts);
}