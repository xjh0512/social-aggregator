export enum Platform {
  TIKTOK = 'TIKTOK',
  INSTAGRAM = 'INSTAGRAM',
  YOUTUBE = 'YOUTUBE',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
  XIAOHONGSHU = 'XIAOHONGSHU',
  REDDIT = 'REDDIT',
}

export interface PlatformConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface PlatformContent {
  text: string;
  entities: {
    mentions?: string[];
    hashtags?: string[];
    links?: string[];
  };
  media?: PlatformMedia[];
}

export interface PlatformMedia {
  type: 'image' | 'video' | 'gif';
  url: string;
  altText?: string;
}

export interface PlatformUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  followers: number;
  following: number;
}

export interface PlatformPost {
  id: string;
  platform: Platform;
  content: string;
  mediaUrls: string[];
  publishedAt: Date;
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

export interface PlatformMetrics {
  date: Date;
  followers: number;
  following: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagement: number;
}