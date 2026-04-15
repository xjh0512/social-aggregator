import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';

async function getAccounts() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.socialAccount.findMany({
    where: { userId: session.user.id },
  });
}

export default async function AccountsPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const accounts = await getAccounts();

  const platformLabels: Record<string, string> = {
    TIKTOK: 'TikTok',
    INSTAGRAM: 'Instagram',
    YOUTUBE: 'YouTube',
    TWITTER: 'Twitter/X',
    LINKEDIN: 'LinkedIn',
    XIAOHONGSHU: '小红书',
    REDDIT: 'Reddit',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Connected Accounts</h1>
        <Link
          href="/accounts/connect"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          连接账号
        </Link>
      </div>

      {accounts.length === 0 ? (
        <div className="text-gray-500 text-center py-12">
          <p className="mb-4">No accounts connected yet</p>
          <Link href="/accounts/connect" className="text-blue-600 hover:underline">
            连接你的第一个账号
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="border rounded-lg p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                {account.avatar ? (
                  <img
                    src={account.avatar}
                    alt={account.username}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <span className="text-xl">
                    {account.platform.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold">{account.username}</p>
                <p className="text-sm text-gray-500">
                  {platformLabels[account.platform] || account.platform}
                </p>
                <p className="text-xs text-gray-400">
                  Connected {account.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}