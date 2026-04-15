import { PlatformAdapter } from './base';
import { Platform, PlatformConfig, PlatformUser, PlatformContent, PlatformMetrics } from './types';

export class TikTokAdapter extends PlatformAdapter {
  private static BASE_URL = 'https://open.tiktokapis.com/v2';
  private static AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';

  constructor(config: PlatformConfig) {
    super(Platform.TIKTOK, config);
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_key: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'user.info.basic,video.upload',
    });
    return `${TikTokAdapter.AUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri,
      }),
    });

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  async getProfile(accessToken: string): Promise<PlatformUser> {
    const response = await fetch(`${TikTokAdapter.BASE_URL}/user/info/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    const user = data.data.user;
    return {
      id: user.open_id,
      username: user.display_name,
      displayName: user.display_name,
      avatar: user.avatar_url,
      followers: 0,
      following: 0,
    };
  }

  async getMetrics(accessToken: string, date: Date): Promise<PlatformMetrics> {
    const response = await fetch(`${TikTokAdapter.BASE_URL}/user/stats/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_date: date.toISOString().split('T')[0],
        end_date: date.toISOString().split('T')[0],
      }),
    });

    const data = await response.json();
    const stats = data.data;
    return {
      date,
      followers: stats.follower_count,
      following: stats.following_count,
      likes: stats.like_count,
      comments: 0,
      shares: stats.share_count,
      views: stats.video_view_count,
      engagement: 0,
    };
  }

  async createPost(
    accessToken: string,
    content: PlatformContent
  ): Promise<{ platformPostId: string }> {
    const initResponse = await fetch(`${TikTokAdapter.BASE_URL}/post/publish/video/init/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_file_info: {
          file_name: 'video.mp4',
          upload_id: content.media?.[0]?.url,
        },
        post_mode: 'DIRECT',
        text: content.text,
      }),
    });

    const initData = await initResponse.json();
    return {
      platformPostId: initData.data.video_id,
    };
  }

  async deletePost(accessToken: string, platformPostId: string): Promise<void> {
    await fetch(`${TikTokAdapter.BASE_URL}/post/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        video_id: platformPostId,
      }),
    });
  }

  async uploadMedia(
    accessToken: string,
    file: Buffer,
    mimeType: string
  ): Promise<string> {
    const bytes = Array.from(new Uint8Array(file));
    const response = await fetch(`${TikTokAdapter.BASE_URL}/upload/video/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      body: JSON.stringify({
        video: bytes,
      }),
    });

    const data = await response.json();
    return data.data.upload_id;
  }
}