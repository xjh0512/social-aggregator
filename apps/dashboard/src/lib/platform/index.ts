import { PlatformAdapter } from './base';
import { TikTokAdapter } from './tiktok';
import { InstagramAdapter } from './instagram';
import { Platform, PlatformConfig } from './types';
import { Platform as PlatformEnum } from '@prisma/client';

const platformConfigs: Record<PlatformEnum, PlatformConfig> = {
  [PlatformEnum.TIKTOK]: {
    clientId: process.env.TIKTOK_CLIENT_KEY || '',
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
    redirectUri: process.env.NEXTAUTH_URL + '/api/auth/callback/tiktok',
  },
  [PlatformEnum.INSTAGRAM]: {
    clientId: process.env.META_APP_ID || '',
    clientSecret: process.env.META_APP_SECRET || '',
    redirectUri: process.env.NEXTAUTH_URL + '/api/auth/callback/instagram',
  },
  [PlatformEnum.YOUTUBE]: {
    clientId: '',
    clientSecret: '',
    redirectUri: '',
  },
  [PlatformEnum.TWITTER]: {
    clientId: process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    redirectUri: process.env.NEXTAUTH_URL + '/api/auth/callback/twitter',
  },
  [PlatformEnum.LINKEDIN]: {
    clientId: '',
    clientSecret: '',
    redirectUri: '',
  },
  [PlatformEnum.XIAOHONGSHU]: {
    clientId: '',
    clientSecret: '',
    redirectUri: '',
  },
  [PlatformEnum.REDDIT]: {
    clientId: '',
    clientSecret: '',
    redirectUri: '',
  },
};

export function createPlatformAdapter(platform: PlatformEnum): PlatformAdapter {
  const config = platformConfigs[platform];
  if (!config.clientId) {
    throw new Error(`Platform ${platform} not configured`);
  }

  switch (platform) {
    case PlatformEnum.TIKTOK:
      return new TikTokAdapter(config);
    case PlatformEnum.INSTAGRAM:
      return new InstagramAdapter(config);
    default:
      throw new Error(`Platform ${platform} not supported yet`);
  }
}

export { PlatformAdapter } from './base';