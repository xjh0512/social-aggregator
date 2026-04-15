import { PlatformAdapter } from './base';
import { Platform, PlatformConfig, PlatformUser, PlatformContent, PlatformMetrics } from './types';

export class InstagramAdapter extends PlatformAdapter {
  private static BASE_URL = 'https://graph.instagram.com';
  private static AUTH_URL = 'https://api.instagram.com/oauth/authorize';

  constructor(config: PlatformConfig) {
    super(Platform.INSTAGRAM, config);
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'user_profile,user_media',
      response_type: 'code',
    });
    return `${InstagramAdapter.AUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri,
      }),
    });

    const data = await response.json();
    const longLivedParams = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: this.config.clientSecret,
      access_token: data.access_token,
    });
    const longLivedResponse = await fetch(
      `${InstagramAdapter.BASE_URL}/access_token?${longLivedParams.toString()}`
    );

    const longLivedData = await longLivedResponse.json();
    return {
      accessToken: longLivedData.access_token,
      refreshToken: longLivedData.access_token,
      expiresIn: longLivedData.expires_in,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const params = new URLSearchParams({
      grant_type: 'ig_refresh_token',
      access_token: refreshToken,
    });
    const response = await fetch(
      `${InstagramAdapter.BASE_URL}/refresh_access_token?${params.toString()}`
    );

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.access_token,
      expiresIn: data.expires_in,
    };
  }

  async getProfile(accessToken: string): Promise<PlatformUser> {
    const params = new URLSearchParams({
      fields: 'id,username,account_type,media_count',
      access_token: accessToken,
    });
    const response = await fetch(`${InstagramAdapter.BASE_URL}/me?${params.toString()}`);

    const data = await response.json();
    return {
      id: data.id,
      username: data.username,
      displayName: data.username,
      avatar: '',
      followers: 0,
      following: 0,
    };
  }

  async getMetrics(accessToken: string, date: Date): Promise<PlatformMetrics> {
    const params = new URLSearchParams({
      fields: 'followers_count,follows_count,media_count,engagement',
      access_token: accessToken,
    });
    const response = await fetch(`${InstagramAdapter.BASE_URL}/me?${params.toString()}`);

    const data = await response.json();
    return {
      date,
      followers: data.followers_count,
      following: data.follows_count,
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      engagement: data.engagement || 0,
    };
  }

  async createPost(
    accessToken: string,
    content: PlatformContent
  ): Promise<{ platformPostId: string }> {
    const mediaParams = new URLSearchParams({
      media_type: content.media?.[0]?.type === 'video' ? 'VIDEO' : 'IMAGE',
      image_url: content.media?.[0]?.url || '',
      caption: content.text,
      access_token: accessToken,
    });
    const containerResponse = await fetch(
      `${InstagramAdapter.BASE_URL}/me/media?${mediaParams.toString()}`,
      { method: 'POST' }
    );

    const containerData = await containerResponse.json();
    const publishParams = new URLSearchParams({
      access_token: accessToken,
    });
    const publishResponse = await fetch(
      `${InstagramAdapter.BASE_URL}/${containerData.id}/publish?${publishParams.toString()}`,
      { method: 'POST' }
    );

    const publishData = await publishResponse.json();
    return {
      platformPostId: publishData.id,
    };
  }

  async deletePost(accessToken: string, platformPostId: string): Promise<void> {
    const params = new URLSearchParams({
      access_token: accessToken,
    });
    await fetch(
      `${InstagramAdapter.BASE_URL}/${platformPostId}?${params.toString()}`,
      { method: 'DELETE' }
    );
  }

  async uploadMedia(
    accessToken: string,
    file: Buffer,
    mimeType: string
  ): Promise<string> {
    const params = new URLSearchParams({
      media_type: mimeType.startsWith('video') ? 'VIDEO' : 'IMAGE',
      video: file.toString('base64'),
      access_token: accessToken,
    });
    const response = await fetch(
      `${InstagramAdapter.BASE_URL}/me/media?${params.toString()}`,
      { method: 'POST' }
    );

    const data = await response.json();
    return data.id;
  }
}