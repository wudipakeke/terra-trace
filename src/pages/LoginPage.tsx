import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi, type LoginResult } from '../api/auth';
import { authRepo } from '../dexie/authRepo';
import type { AuthMethod } from '../types/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  const [loginMethod, setLoginMethod] = useState<AuthMethod>('password');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Login form
  const [loginAccount, setLoginAccount] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPhone, setLoginPhone] = useState('');

  const from = (location.state as { from?: string })?.from || '/';

  // Handle Feishu OAuth callback: ?code=xxx
  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) return;

    setSubmitting(true);
    authApi.login(code)
      .then(async (res: LoginResult) => {
        const profile = await authRepo.loginOrRegisterWithFeishu(
          res.user.openId,
          res.user.name,
          res.user.avatar
        );
        localStorage.setItem('terra-trace-auth', res.token);
        localStorage.setItem('terra-trace-user', JSON.stringify(profile));
        window.location.href = from;
      })
      .catch((err: Error) => {
        setError(err.message || '飞书登录失败');
      })
      .finally(() => setSubmitting(false));
  }, []);

  // Redirect if already logged in
  const feishuCode = searchParams.get('code');
  if (isAuthenticated && !feishuCode) {
    navigate(from, { replace: true });
    return null;
  }

  if (feishuCode && submitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">飞书登录中...</p>
        </div>
      </div>
    );
  }

  const handleLogin = useCallback(async () => {
    setError('');
    setSubmitting(true);
    try {
      if (loginMethod === 'password') {
        if (!loginAccount || !loginPassword) {
          throw new Error('请输入用户名和密码');
        }
        await login({ method: 'password', account: loginAccount, password: loginPassword });
      } else if (loginMethod === 'phone') {
        if (!loginPhone) throw new Error('请输入手机号');
        await login({ method: 'phone', account: loginPhone });
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setSubmitting(false);
    }
  }, [loginMethod, loginAccount, loginPassword, loginPhone, login, navigate, from]);

  const handleFeishuLogin = useCallback(async () => {
    setError('');
    setSubmitting(true);
    try {
      const { url } = await authApi.getUrl();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : '飞书登录失败');
      setSubmitting(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-wider">Terra-Trace</h1>
          <p className="text-gray-500 mt-1">世界观创作平台</p>
        </div>

        {/* Card */}
        <div className="bg-white shadow-md border border-gray-100 rounded-2xl p-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">登录</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Login Method Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
            {(['password', 'phone'] as const).map((method) => (
              <button
                key={method}
                onClick={() => { setLoginMethod(method); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  loginMethod === method
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {method === 'password' ? '账号密码' : '手机号'}
              </button>
            ))}
          </div>

          {/* Login Form */}
          {loginMethod === 'password' ? (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="用户名"
                value={loginAccount}
                onChange={(e) => setLoginAccount(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 text-sm"
              />
              <input
                type="password"
                placeholder="密码"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 text-sm"
              />
              <button
                onClick={handleLogin}
                disabled={submitting}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
              >
                {submitting ? '登录中...' : '登录'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="tel"
                placeholder="手机号"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 text-sm"
              />
              <button
                onClick={handleLogin}
                disabled={submitting}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
              >
                {submitting ? '登录中...' : '登录'}
              </button>
            </div>
          )}

          {/* Quick login */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">快捷登录</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleFeishuLogin}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-500 disabled:opacity-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.5 2A2.5 2.5 0 0 0 2 4.5v15A2.5 2.5 0 0 0 4.5 22h15a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 19.5 2h-15zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
                </svg>
                飞书登录
              </button>
              <button
                onClick={() => setError('微信登录功能开发中，敬请期待')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-green-500 disabled:opacity-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
                </svg>
                微信登录
              </button>
            </div>
          </div>

          {/* Register link */}
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500">还没有账号？</span>
            <button
              onClick={() => navigate('/register')}
              className="text-sm text-indigo-600 hover:text-indigo-700 ml-1"
            >
              去注册
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
