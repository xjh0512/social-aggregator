'use client';

import { useState } from 'react';

type ConfigItem = { key: string; secret: string };

const platforms = [
  { name: 'TikTok', key: 'TIKTOK_CLIENT_KEY', secret: 'TIKTOK_CLIENT_SECRET' },
  { name: 'Instagram/Meta', key: 'META_APP_ID', secret: 'META_APP_SECRET' },
  { name: 'Twitter/X', key: 'TWITTER_CLIENT_ID', secret: 'TWITTER_CLIENT_SECRET' },
  { name: 'YouTube', key: 'YOUTUBE_CLIENT_ID', secret: 'YOUTUBE_CLIENT_SECRET' },
  { name: 'LinkedIn', key: 'LINKEDIN_CLIENT_ID', secret: 'LINKEDIN_CLIENT_SECRET' },
  { name: '小红书', key: 'XIAOHONGSHU_APP_KEY', secret: 'XIAOHONGSHU_APP_SECRET' },
];

export default function SettingsPage() {
  const [configs, setConfigs] = useState<Record<string, ConfigItem>>(() => {
    const initial: Record<string, ConfigItem> = {};
    platforms.forEach((p) => {
      initial[p.key] = { key: '', secret: '' };
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (key: string, field: 'key' | 'secret', value: string) => {
    setConfigs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configs),
    });
    setSaving(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">平台配置</h1>

      <div className="space-y-6">
        {platforms.map((p) => (
          <div key={p.key} className="border rounded-lg p-4">
            <h2 className="font-semibold mb-4">{p.name}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Client Key</label>
                <input
                  type="text"
                  value={configs[p.key]?.key || ''}
                  onChange={(e) => handleChange(p.key, 'key', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Client Secret</label>
                <input
                  type="password"
                  value={configs[p.key]?.secret || ''}
                  onChange={(e) => handleChange(p.key, 'secret', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存配置'}
        </button>
      </div>
    </div>
  );
}