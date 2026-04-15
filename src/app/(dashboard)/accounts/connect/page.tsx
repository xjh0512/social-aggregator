import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { createPlatformAdapter } from '@/lib/platform';
import { Platform } from '@prisma/client';

const platforms = [
  { name: 'TikTok', platform: Platform.TIKTOK, icon: '🎵' },
  { name: 'Instagram', platform: Platform.INSTAGRAM, icon: '📷' },
];

export default async function ConnectPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">连接账号</h1>

      <div className="grid grid-cols-2 gap-4">
        {platforms.map((p) => {
          let authUrl = '#';
          let configured = true;
          
          try {
            const adapter = createPlatformAdapter(p.platform);
            authUrl = adapter.getAuthUrl();
          } catch {
            configured = false;
          }

          return (
            <a
              key={p.platform}
              href={configured ? authUrl : '#'}
              className={`border rounded-lg p-6 flex items-center gap-4 ${
                configured ? 'hover:border-blue-500' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-3xl">{p.icon}</span>
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-gray-500">
                  {configured ? '点击连接' : '未配置 API'}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p>需要先在 Settings 页面配置平台 API 密钥</p>
      </div>
    </div>
  );
}