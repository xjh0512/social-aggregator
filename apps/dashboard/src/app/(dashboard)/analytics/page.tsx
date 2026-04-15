import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function getAnalytics() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.analytics.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: 30,
    include: {
      account: {
        select: {
          platform: true,
          username: true,
        },
      },
    },
  });
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const analytics = await getAnalytics();

  const totalFollowers = analytics.reduce((sum, a) => sum + a.followers, 0);
  const totalLikes = analytics.reduce((sum, a) => sum + a.likes, 0);
  const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
  const totalEngagement = analytics.length
    ? analytics.reduce((sum, a) => sum + a.engagement, 0) / analytics.length
    : 0;

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
      <h1 className="text-2xl font-bold mb-8">Analytics Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-1">Total Followers</p>
          <p className="text-3xl font-bold">{totalFollowers.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-1">Total Likes</p>
          <p className="text-3xl font-bold">{totalLikes.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-1">Total Views</p>
          <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-1">Avg Engagement</p>
          <p className="text-3xl font-bold">{totalEngagement.toFixed(1)}%</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Data</h2>
      {analytics.length === 0 ? (
        <p className="text-gray-500">No analytics data yet</p>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Platform
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Account
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Followers
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">Views</th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Engagement
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 text-sm">
                    {item.date.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {platformLabels[item.platform] || item.platform}
                  </td>
                  <td className="px-4 py-3 text-sm">{item.account.username}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    {item.followers.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {item.views.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {item.engagement.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}