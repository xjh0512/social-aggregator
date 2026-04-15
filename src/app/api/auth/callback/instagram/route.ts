import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createPlatformAdapter } from '@/lib/platform';
import { Platform } from '@prisma/client';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/accounts?error=oauth_failed', request.url));
  }

  try {
    const adapter = createPlatformAdapter(Platform.INSTAGRAM);
    const tokens = await adapter.exchangeCode(code);
    const profile = await adapter.getProfile(tokens.accessToken);

    await prisma.socialAccount.upsert({
      where: {
        userId_platform_platformUserId: {
          userId: session.user.id,
          platform: Platform.INSTAGRAM,
          platformUserId: profile.id,
        },
      },
      create: {
        userId: session.user.id,
        platform: Platform.INSTAGRAM,
        platformUserId: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        avatar: profile.avatar || '',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: new Date(Date.now() + tokens.expiresIn * 1000),
      },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: new Date(Date.now() + tokens.expiresIn * 1000),
        username: profile.username,
        displayName: profile.displayName,
        avatar: profile.avatar || '',
      },
    });

    return NextResponse.redirect(new URL('/accounts?success=true', request.url));
  } catch (err) {
    console.error('Instagram OAuth error:', err);
    return NextResponse.redirect(new URL('/accounts?error=oauth_failed', request.url));
  }
}