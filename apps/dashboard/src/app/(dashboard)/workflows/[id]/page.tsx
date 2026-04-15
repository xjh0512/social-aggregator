'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface WorkflowStep {
  id: string;
  type: string;
  order: number;
  config: any;
}

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  status: string;
  triggerType: string;
  steps: WorkflowStep[];
}

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    const [wfRes, accountsRes] = await Promise.all([
      fetch(`/api/workflows/${params.id}`),
      fetch('/api/accounts'),
    ]);

    if (wfRes.ok) {
      const wfData = await wfRes.json();
      setWorkflow(wfData);
    }
    if (accountsRes.ok) {
      const accData = await accountsRes.json();
      setAccounts(accData);
    }
    setLoading(false);
  };

  const addStep = async (type: string) => {
    await fetch(`/api/workflows/${params.id}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, config: {} }),
    });
    fetchData();
  };

  const deleteStep = async (stepId: string) => {
    await fetch(`/api/workflows/${params.id}/steps/${stepId}`, {
      method: 'DELETE',
    });
    fetchData();
  };

  if (loading) return <div>加载中...</div>;
  if (!workflow) return <div>工作流不存在</div>;

  const stepTypeLabels: Record<string, string> = {
    POST: '发布',
    DELAY: '延迟',
    CONDITION: '条件',
    NOTIFY: '通知',
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          ← 返回
        </button>
        <h1 className="text-2xl font-bold">{workflow.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white border rounded-lg p-4 mb-6">
            <h2 className="font-semibold mb-4">步骤</h2>
            {workflow.steps.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无步骤，点击下方添加</p>
            ) : (
              <div className="space-y-3">
                {workflow.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">{index + 1}</span>
                      <span className="font-medium">
                        {stepTypeLabels[step.type] || step.type}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteStep(step.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-4">添加步骤</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => addStep('POST')}
                className="p-3 border rounded hover:border-blue-500 text-left"
              >
                <span className="font-medium">发布</span>
                <p className="text-xs text-gray-500">发布内容到平台</p>
              </button>
              <button
                onClick={() => addStep('DELAY')}
                className="p-3 border rounded hover:border-blue-500 text-left"
              >
                <span className="font-medium">延迟</span>
                <p className="text-xs text-gray-500">等待指定时间</p>
              </button>
              <button
                onClick={() => addStep('CONDITION')}
                className="p-3 border rounded hover:border-blue-500 text-left"
              >
                <span className="font-medium">条件</span>
                <p className="text-xs text-gray-500">根据条件分支</p>
              </button>
              <button
                onClick={() => addStep('NOTIFY')}
                className="p-3 border rounded hover:border-blue-500 text-left"
              >
                <span className="font-medium">通知</span>
                <p className="text-xs text-gray-500">发送提醒</p>
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-4">工作流信息</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">状态</span>
                <p className="font-medium">{workflow.status}</p>
              </div>
              <div>
                <span className="text-gray-500">触发方式</span>
                <p className="font-medium">{workflow.triggerType}</p>
              </div>
              {workflow.description && (
                <div>
                  <span className="text-gray-500">描述</span>
                  <p>{workflow.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4 mt-4">
            <h2 className="font-semibold mb-4">已连接账号</h2>
            {accounts.length === 0 ? (
              <p className="text-sm text-gray-500">暂无账号</p>
            ) : (
              <div className="space-y-2">
                {accounts.map((acc) => (
                  <div key={acc.id} className="text-sm">
                    <span className="font-medium">{acc.platform}</span>
                    <span className="text-gray-400"> @{acc.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}