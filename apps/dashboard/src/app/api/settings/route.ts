import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const envPath = path.join(process.cwd(), '.env');
  const content = fs.readFileSync(envPath, 'utf-8');
  
  const configs: Record<string, { key: string; secret: string }> = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('#') || !line.trim()) continue;
    const [key, ...rest] = line.split('=');
    const value = rest.join('=').trim();
    
    const platforms = [
      { key: 'TIKTOK_CLIENT_KEY', secret: 'TIKTOK_CLIENT_SECRET' },
      { key: 'META_APP_ID', secret: 'META_APP_SECRET' },
      { key: 'TWITTER_CLIENT_ID', secret: 'TWITTER_CLIENT_SECRET' },
      { key: 'YOUTUBE_CLIENT_ID', secret: 'YOUTUBE_CLIENT_SECRET' },
      { key: 'LINKEDIN_CLIENT_ID', secret: 'LINKEDIN_CLIENT_SECRET' },
      { key: 'XIAOHONGSHU_APP_KEY', secret: 'XIAOHONGSHU_APP_SECRET' },
    ];
    
    for (const p of platforms) {
      if (key === p.key) configs[p.key] = { key: value, secret: '' };
      if (key === p.secret) {
        const parentKey = Object.keys(configs).find(k => 
          configs[k].secret === '' && 
          (k.includes(key.replace('_SECRET', '_KEY')) || k.includes(key.replace('_APP_SECRET', '_APP_KEY')))
        );
        if (parentKey) {
          configs[parentKey].secret = value;
        }
      }
    }
  }

  return NextResponse.json(configs);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const envPath = path.join(process.cwd(), '.env');
  let content = fs.readFileSync(envPath, 'utf-8');

  for (const [platformKey, values] of Object.entries(body)) {
    const config = values as { key: string; secret: string };
    const keyLine = `${platformKey}="${config.key}"`;
    const secretKey = platformKey.replace('CLIENT_KEY', 'CLIENT_SECRET')
      .replace('APP_KEY', 'APP_SECRET')
      .replace('_ID', '_SECRET');
    const secretLine = `${secretKey}="${config.secret}"`;

    const keyPattern = new RegExp(`^${platformKey}=.*`, 'm');
    if (keyPattern.test(content)) {
      content = content.replace(keyPattern, keyLine);
    } else {
      content += `\n${keyLine}`;
    }

    const secretPattern = new RegExp(`^${secretKey}=.*`, 'm');
    if (secretPattern.test(content)) {
      content = content.replace(secretPattern, secretLine);
    } else {
      content += `\n${secretLine}`;
    }
  }

  fs.writeFileSync(envPath, content);
  return NextResponse.json({ success: true });
}