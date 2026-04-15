import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const navItems = [
    { href: '/accounts', label: '账号管理' },
    { href: '/workflows', label: '工作流' },
    { href: '/analytics', label: '数据看板' },
    { href: '/posts', label: '内容管理' },
    { href: '/settings', label: '设置' },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h1 className="text-xl font-bold mb-8">内容中台</h1>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2 px-4 rounded hover:bg-gray-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <a
            href="/storefront"
            target="_blank"
            className="block py-2 px-4 rounded hover:bg-gray-800 text-gray-400"
          >
            独立站 →
          </a>
        </div>
        <form
          action={async () => {
            'use server';
            const { signOut } = await import('@/lib/auth');
            await signOut();
          }}
          className="mt-4"
        >
          <button className="w-full py-2 px-4 rounded bg-gray-800 hover:bg-gray-700">
            退出
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  );
}