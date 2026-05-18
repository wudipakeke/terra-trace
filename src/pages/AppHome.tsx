import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AppHome() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white">
      {/* Hero */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-sm font-medium mb-8">
            ✦ 创意创作平台
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Terra-Trace
          </h1>
          <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            循大地之迹，寻自然之本。
            <br />
            以 Terra-Trace 为笔，畅快淋漓地描绘属于你的世界，
            <br />
            让每一份奇思妙想，被更多人看见。
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/studio')}
                className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/30 hover:-translate-y-0.5"
              >
                进入创意工作室 →
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/30 hover:-translate-y-0.5"
              >
                免费开始创作
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">核心功能</h2>
          <p className="text-gray-500 text-center mb-12 max-w-lg mx-auto">
            释放你的想象力，用地图与文字构筑独一无二的世界
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-amber-300 to-amber-100 rounded-full" />
              <div className="text-5xl mb-5">📖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">小说创作</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                分屏协作编辑器，边写故事边看地图。沉浸式写作体验，自动保存，轻松管理章节与角色设定。
              </p>
            </div>
            <div className="group p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-indigo-300 to-indigo-100 rounded-full" />
              <div className="text-5xl mb-5">🗺️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">世界观地图</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                以真实地形图为底图，临摹绘制属于你的仙侠世界、奇幻大陆。支持画笔、纹理、图标等多种绘制工具。
              </p>
            </div>
            <div className="group p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-rose-200 transition-all hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-rose-300 to-rose-100 rounded-full" />
              <div className="text-5xl mb-5">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">创作工作室</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                分屏协作编辑器，地图与小说并排显示。沉浸式写作体验，自动保存，边写故事边编辑世界观地图。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Nav */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">探索更多</h2>
          <p className="text-gray-500 text-center mb-12 max-w-lg mx-auto">
            用创意连接世界，与万千创作者同行
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/activities')}
              className="group p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all text-left hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-emerald-300 to-emerald-100 rounded-full" />
              <div className="text-5xl mb-4">🎪</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">作家活动</h3>
              <p className="text-gray-500 text-sm">创作比赛、征文活动，与更多创作者交流</p>
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="group p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all text-left hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-amber-300 to-amber-100 rounded-full" />
              <div className="text-5xl mb-4">🛍️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">周边商场</h3>
              <p className="text-gray-500 text-sm">文创周边、限量商品，让你的世界触手可及</p>
            </button>
            <button
              onClick={() => navigate('/tutorials')}
              className="group p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all text-left hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-violet-300 to-violet-100 rounded-full" />
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">创作教程</h3>
              <p className="text-gray-500 text-sm">从入门到精通，系统学习世界观创作技巧</p>
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-indigo-50 via-white to-rose-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">开始你的创意创作之旅</h2>
          <p className="text-gray-500 mb-10 text-lg">在这里，每个世界都值得被看见</p>
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/studio')}
              className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
            >
              进入创意工作室 →
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
            >
              免费注册
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-400">
          <p className="mb-1">循大地之迹，寻自然之本 — Terra-Trace 创意创作平台</p>
          <p>以创作为笔，描绘万千世界</p>
        </div>
      </footer>
    </div>
  );
}
