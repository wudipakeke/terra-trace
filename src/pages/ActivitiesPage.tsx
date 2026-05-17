import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  title: string;
  description: string;
  dateRange: string;
  status: 'active' | 'ended' | 'upcoming';
  participantCount: number;
  prize: string;
  details: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    title: '仙侠世界征文大赛',
    description: '以中国仙侠文化为主题，创作属于你的仙侠世界',
    dateRange: '2026.05.01 - 2026.06.30',
    status: 'active',
    participantCount: 1286,
    prize: '¥5,000 奖金 + 平台推荐',
    details: '本次征文大赛面向所有注册作者，主题为"仙侠世界"。参赛作品需在 3 万字以上，题材需包含仙侠元素。优秀作品将获得平台推荐位和现金奖励。',
  },
  {
    id: '2',
    title: '短篇小说创作挑战',
    description: '30 天完成一篇 1 万字以内的短篇小说',
    dateRange: '2026.05.15 - 2026.06.15',
    status: 'active',
    participantCount: 723,
    prize: '¥1,000 奖金',
    details: '30 天短篇挑战，每天创作 300 字以上。完成挑战的作者可获得平台专属徽章和现金奖励。',
  },
  {
    id: '3',
    title: '世界观设定大赛',
    description: '展示你精心构建的世界观设定，赢取大奖',
    dateRange: '2026.03.01 - 2026.04.30',
    status: 'ended',
    participantCount: 2156,
    prize: '¥3,000 奖金',
    details: '参赛者需提交完整的世界观设定文档，包括地理、历史、文化、魔法/力量体系等。由专业评委评选最佳世界观。',
  },
  {
    id: '4',
    title: '玄幻题材推荐会',
    description: '优秀玄幻作品编辑推荐，获得签约机会',
    dateRange: '2026.02.01 - 2026.03.31',
    status: 'ended',
    participantCount: 892,
    prize: '签约机会 + 编辑指导',
    details: '平台联合多家出版社举办玄幻题材推荐会，优秀作品将获得编辑一对一指导和签约机会。',
  },
  {
    id: '5',
    title: '暑期创作训练营',
    description: '资深作家带队，30 天系统提升写作技巧',
    dateRange: '2026.07.01 - 2026.07.31',
    status: 'upcoming',
    participantCount: 0,
    prize: '结业证书 + 平台资源包',
    details: '邀请 5 位资深网络作家担任导师，分 5 个小组进行为期 30 天的密集创作训练。包含写作技巧分享、作品点评、互动交流等环节。',
  },
  {
    id: '6',
    title: '年度最佳作品评选',
    description: '2026 年度平台最佳原创小说评选',
    dateRange: '2026.12.01 - 2026.12.31',
    status: 'upcoming',
    participantCount: 0,
    prize: '¥10,000 奖金 + 全平台推广',
    details: '年度盛事！评选本年度平台最佳原创小说，由读者投票和专家评审共同决定。获奖作品将获得全平台推广资源和丰厚奖金。',
  },
];

const statusLabels: Record<string, string> = {
  active: '进行中',
  ended: '已结束',
  upcoming: '即将开始',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  ended: 'bg-gray-50 text-gray-400 border-gray-200',
  upcoming: 'bg-blue-50 text-blue-600 border-blue-200',
};

type FilterType = 'all' | 'active' | 'ended' | 'upcoming';

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selected, setSelected] = useState<Activity | null>(null);

  const filtered = filter === 'all'
    ? mockActivities
    : mockActivities.filter((a) => a.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-emerald-200 rounded-full" />
          <h1 className="text-3xl font-bold text-gray-900">作家活动</h1>
        </div>
        <p className="text-gray-500 ml-4">创作比赛、征文活动，与更多创作者交流</p>
      </div>

      {/* Filter */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="flex gap-2">
          {(['all', 'active', 'ended', 'upcoming'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200'
              }`}
            >
              {f === 'all' ? '全部' : statusLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500">暂无活动</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((activity) => (
              <button
                key={activity.id}
                onClick={() => setSelected(activity)}
                className="text-left p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[activity.status]}`}>
                    {statusLabels[activity.status]}
                  </span>
                  {activity.status === 'active' && (
                    <span className="text-xs text-gray-500">{activity.participantCount} 人参与</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{activity.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{activity.dateRange}</span>
                  <span className="text-yellow-500/80">{activity.prize}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[selected.status]}`}>
                {statusLabels[selected.status]}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selected.title}</h2>
            <p className="text-gray-500 text-sm mb-4">{selected.dateRange}</p>
            <p className="text-gray-600 leading-relaxed mb-6">{selected.details}</p>
            <div className="flex items-center justify-between py-4 border-t border-gray-100">
              <span className="text-yellow-500/80 font-medium">{selected.prize}</span>
              {selected.status === 'active' && (
                <span className="text-sm text-gray-400">{selected.participantCount} 人已参与</span>
              )}
            </div>
            {selected.status === 'active' && (
              <button
                onClick={() => alert('报名功能待开放')}
                className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                立即参与
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
