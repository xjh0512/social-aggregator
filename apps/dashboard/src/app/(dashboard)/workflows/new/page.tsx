'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewWorkflowPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('manual');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, triggerType }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/workflows/${data.id}`);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">创建工作流</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">工作流名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="例如：每日定时发布"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">描述（可选）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder="描述这个工作流的用途..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">触发方式</label>
          <select
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="manual">手动触发</option>
            <option value="scheduled">定时触发</option>
            <option value="webhook">Webhook 触发</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '创建中...' : '创建'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-md hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}