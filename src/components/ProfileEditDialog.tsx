import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authRepo } from '../dexie/authRepo';

interface Props {
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  { emoji: '🎨', label: '画家' },
  { emoji: '✍️', label: '作家' },
  { emoji: '🗺️', label: '探险家' },
  { emoji: '📖', label: '读者' },
  { emoji: '🌟', label: '明星' },
  { emoji: '🎭', label: '表演者' },
  { emoji: '🦊', label: '狐狸' },
  { emoji: '🐉', label: '龙' },
  { emoji: '🦅', label: '鹰' },
  { emoji: '🌙', label: '月亮' },
];

export function ProfileEditDialog({ onClose }: Props) {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [wechat, setWechat] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const handleSave = async () => {
    if (!username.trim()) {
      setError('用户名不能为空');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updates: Partial<typeof user> = {
        username: username.trim(),
        phone: phone || undefined,
        avatar: selectedAvatar,
      };
      await authRepo.updateProfile(user.id, updates);
      updateUser(updates);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const currentDisplay = user.feishuName || user.username || '';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">个人设置</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Avatar display */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
            {selectedAvatar || currentDisplay.charAt(0).toUpperCase()}
          </div>
          {user.feishuName && (
            <p className="text-xs text-gray-400">已绑定飞书账号</p>
          )}
        </div>

        {/* Avatar selector */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">选择头像</label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_OPTIONS.map((opt) => (
              <button
                key={opt.emoji}
                onClick={() => setSelectedAvatar(opt.emoji)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors ${
                  selectedAvatar === opt.emoji
                    ? 'bg-indigo-100 ring-2 ring-indigo-400'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                title={opt.label}
              >
                {opt.emoji}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Username */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">用户名</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">手机号</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="未绑定"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* WeChat binding */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">微信号</label>
          <div className="flex gap-2">
            <input
              value={wechat}
              onChange={(e) => setWechat(e.target.value)}
              placeholder="绑定微信号"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => alert('微信绑定功能待开放')}
              className="px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border border-green-200"
            >
              绑定
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
