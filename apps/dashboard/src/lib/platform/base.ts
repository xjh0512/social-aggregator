import { Platform, PlatformConfig, PlatformUser, PlatformContent, PlatformMetrics } from './types';

export abstract class PlatformAdapter {
  protected platform: Platform;
  protected config: PlatformConfig;
  protected accessToken: string | null = null;
  protected refreshToken: string | null = null;

  constructor(platform: Platform, config: PlatformConfig) {
    this.platform = platform;
    this.config = config;
  }

  /**
   * Generate OAuth authorization URL
   */
  abstract getAuthUrl(): string;

  /**
   * Exchange code for tokens
   */
  abstract exchangeCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }>;

  /**
   * Refresh access token
   */
  abstract refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }>;

  /**
   * Get current user profile
   */
  abstract getProfile(accessToken: string): Promise<PlatformUser>;

  /**
   * Get user metrics/analytics
   */
  abstract getMetrics(accessToken: string, date: Date): Promise<PlatformMetrics>;

  /**
   * Create a post
   */
  abstract createPost(
    accessToken: string,
    content: PlatformContent
  ): Promise<{ platformPostId: string }>;

  /**
   * Delete a post
   */
  abstract deletePost(accessToken: string, platformPostId: string): Promise<void>;

  /**
   * Upload media file
   */
  abstract uploadMedia(
    accessToken: string,
    file: Buffer,
    mimeType: string
  ): Promise<string>; // returns media ID

  /**
   * Check if token is expired
   */
  isTokenExpired(expiry: Date | null): boolean {
    if (!expiry) return true;
    // Refresh 5 minutes before expiry
    return new Date(expiry.getTime() - 5 * 60 * 1000) < new Date();
  }
}