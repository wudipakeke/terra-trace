import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string })?.from || '/';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleRegister = useCallback(async () => {
    setError('');
    if (username.length < 2) {
      setError('用户名至少 2 个字符');
      return;
    }
    if (password.length < 6) {
      setError('密码至少 6 个字符');
      return;
    }
    if (password !== confirm) {
      setError('两次密码输入不一致');
      return;
    }
    setSubmitting(true);
    try {
      await register(username, password, phone || undefined);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setSubmitting(false);
    }
  }, [username, password, confirm, phone, register, navigate, from]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-wider">Terra-Trace</h1>
          <p className="text-gray-500 mt-1">创建你的创作账号</p>
        </div>

        <div className="bg-white shadow-md border border-gray-100 rounded-2xl p-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">注册</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 text-sm"
            />
            <input
              type="tel"
              placeholder="手机号（选填）"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 text-sm"
            />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 text-sm"
            />
            <input
              type="password"
              placeholder="确认密码"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 text-sm"
            />
            <button
              onClick={handleRegister}
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
            >
              {submitting ? '注册中...' : '注册'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">已有账号？</span>
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-indigo-600 hover:text-indigo-700 ml-1"
            >
              去登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
