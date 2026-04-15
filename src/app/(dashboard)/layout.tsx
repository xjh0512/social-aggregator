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
    { href: '/accounts', label: 'Accounts' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/posts', label: 'Posts' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h1 className="text-xl font-bold mb-8">Social Hub</h1>
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
        <form
          action={async () => {
            'use server';
            const { signOut } = await import('@/lib/auth');
            await signOut();
          }}
          className="mt-8"
        >
          <button className="w-full py-2 px-4 rounded bg-gray-800 hover:bg-gray-700">
            Sign Out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}