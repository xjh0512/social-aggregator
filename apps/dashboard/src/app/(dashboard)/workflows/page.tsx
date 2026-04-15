import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';

async function getWorkflows() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.workflow.findMany({
    where: { userId: session.user.id },
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

const statusLabels: Record<string, { label: string; class: string }> = {
  DRAFT: { label: '草稿', class: 'bg-gray-100 text-gray-800' },
  ACTIVE: { label: '运行中', class: 'bg-green-100 text-green-800' },
  PAUSED: { label: '已暂停', class: 'bg-yellow-100 text-yellow-800' },
  COMPLETED: { label: '已完成', class: 'bg-blue-100 text-blue-800' },
};

const stepTypeLabels: Record<string, string> = {
  POST: '发布',
  DELAY: '延迟',
  CONDITION: '条件',
  NOTIFY: '通知',
};

export default async function WorkflowsPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const workflows = await getWorkflows();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">工作流</h1>
        <Link
          href="/workflows/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          创建工作流
        </Link>
      </div>

      {workflows.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">暂无工作流</p>
          <Link href="/workflows/new" className="text-blue-600 hover:underline">
            创建你的第一个工作流
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((workflow) => {
            const status = statusLabels[workflow.status] || statusLabels.DRAFT;
            return (
              <Link
                key={workflow.id}
                href={`/workflows/${workflow.id}`}
                className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{workflow.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${status.class}`}>
                    {status.label}
                  </span>
                </div>
                {workflow.description && (
                  <p className="text-sm text-gray-500 mb-3">{workflow.description}</p>
                )}
                <div className="flex gap-2 text-xs text-gray-400">
                  <span>{workflow.steps.length} 个步骤</span>
                  <span>•</span>
                  <span>触发: {workflow.triggerType}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">工作流类型说明</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>发布</strong> - 自动发布内容到指定平台</li>
          <li>• <strong>延迟</strong> - 等待指定时间后继续</li>
          <li>• <strong>条件</strong> - 根据条件决定后续步骤</li>
          <li>• <strong>通知</strong> - 发送提醒通知</li>
        </ul>
      </div>
    </div>
  );
}