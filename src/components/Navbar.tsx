import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProfileEditDialog } from './ProfileEditDialog';

const NAV_ITEMS = [
  { path: '/', label: '首页', auth: false },
  { path: '/studio', label: '创意工作室', auth: true },
  { path: '/activities', label: '作家活动', auth: false },
  { path: '/shop', label: '周边商场', auth: false },
  { path: '/tutorials', label: '创作教程', auth: false },
];

function isActive(path: string, currentPath: string): boolean {
  if (path === '/') return currentPath === '/';
  if (path === '/studio') return currentPath === '/studio' || currentPath.startsWith('/novel/') || currentPath === '/map';
  return currentPath === path;
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const avatarUrl = user?.avatar || '';
  const displayName = user?.feishuName || user?.username || '';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="text-lg font-bold text-indigo-700 tracking-wider whitespace-nowrap"
            >
              Terra-Trace
            </button>
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                if (item.auth && !isAuthenticated) return null;
                const active = isActive(item.path, location.pathname);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      active
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="hidden sm:inline">{displayName}</span>
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  登录
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  注册
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      {showProfile && <ProfileEditDialog onClose={() => setShowProfile(false)} />}
    </>
  );
}
