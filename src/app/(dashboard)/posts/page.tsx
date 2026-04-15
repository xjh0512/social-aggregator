import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';

async function getPosts() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.post.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
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

export default async function PostsPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const posts = await getPosts();

  const statusLabels: Record<string, { label: string; class: string }> = {
    DRAFT: { label: 'Draft', class: 'bg-gray-100 text-gray-800' },
    SCHEDULED: { label: 'Scheduled', class: 'bg-blue-100 text-blue-800' },
    PUBLISHING: { label: 'Publishing', class: 'bg-yellow-100 text-yellow-800' },
    PUBLISHED: { label: 'Published', class: 'bg-green-100 text-green-800' },
    FAILED: { label: 'Failed', class: 'bg-red-100 text-red-800' },
  };

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
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link
          href="/posts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No posts yet</p>
          <Link href="/posts/new" className="text-blue-600 hover:underline">
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const content = JSON.parse(post.content as string);
            const status = statusLabels[post.status] || statusLabels.DRAFT;
            return (
              <div
                key={post.id}
                className="border rounded-lg p-4 flex gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        status.class
                      }`}
                    >
                      {status.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      {platformLabels[post.platform] || post.platform}
                    </span>
                    <span className="text-sm text-gray-400">
                      @{post.account.username}
                    </span>
                  </div>
                  <p className="text-gray-700 line-clamp-2">
                    {content.text || '(No content)'}
                  </p>
                  {post.mediaUrls.length > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      {post.mediaUrls.length} media file(s)
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {post.scheduledAt
                      ? `Scheduled: ${post.scheduledAt.toLocaleString()}`
                      : post.publishedAt
                      ? `Published: ${post.publishedAt.toLocaleString()}`
                      : `Created: ${post.createdAt.toLocaleString()}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}