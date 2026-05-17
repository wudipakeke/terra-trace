import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NovelMeta } from '../types/novel';
import { NOVEL_GENRES } from '../types/novel';
import { listNovels, createNovel, deleteNovel, createChapter, updateNovel } from '../dexie/novelRepo';
import { useMapStore } from '../store/useMapStore';
import type { ProjectMapType } from '../types';
import { MAP_TYPES, ANCIENT_COLORS, INK_COLORS } from '../types';

type TabType = 'novels' | 'maps';

interface MapProject {
  id: string;
  name: string;
  mapType: ProjectMapType;
  backgroundColor: string;
  createdAt: number;
}

export default function StudioPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabType>('novels');

  // Novel state
  const [novels, setNovels] = useState<NovelMeta[]>([]);
  const [showNewNovel, setShowNewNovel] = useState(false);
  const [novelTitle, setNovelTitle] = useState('');
  const [novelDesc, setNovelDesc] = useState('');
  const [novelCover, setNovelCover] = useState('📖');
  const [novelGenre, setNovelGenre] = useState('玄幻');

  // Map state
  const projects = useMapStore((s) => s.projects);
  const createProject = useMapStore((s) => s.createProject);
  const openProject = useMapStore((s) => s.openProject);
  const deleteProject = useMapStore((s) => s.deleteProject);
  const [showNewMap, setShowNewMap] = useState(false);
  const [mapName, setMapName] = useState('');
  const [mapDesc, setMapDesc] = useState('');
  const [mapType, setMapType] = useState<ProjectMapType>('maplibre-outdoor-contour');
  const [mapColor, setMapColor] = useState('#C23A2B');
  const [mapBorder, setMapBorder] = useState(false);

  useEffect(() => {
    if (tab === 'novels') {
      listNovels().then(setNovels);
    }
  }, [tab]);

  const COVER_OPTIONS = ['📖', '✍️', '🗺️', '⚔️', '🐉', '🌟', '🌙', '🏯', '🌊', '🔥', '❄️', '🌸', '🍂', '🔮', '⚡'];

  // Create novel
  const handleCreateNovel = async () => {
    if (!novelTitle.trim()) return;
    const novel = await createNovel(novelTitle.trim(), '未知作者', novelGenre);
    // Update with description and cover
    await updateNovel(novel.id, { description: novelDesc, coverUrl: novelCover });
    // Auto-create first chapter
    const chapter = await createChapter(novel.id, '第一章');
    setShowNewNovel(false);
    setNovelTitle('');
    setNovelDesc('');
    setNovelCover('📖');
    setNovelGenre('玄幻');
    // Navigate to editor (navbar will be hidden)
    navigate(`/novel/${novel.id}/write/${chapter.id}`);
  };

  // Delete novel
  const handleDeleteNovel = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定删除这本小说吗？')) return;
    await deleteNovel(id);
    setNovels(await listNovels());
  };

  // Create map
  const handleCreateMap = () => {
    if (!mapName.trim()) return;
    const id = createProject(mapName.trim(), mapType, mapColor);
    openProject(id);
    setShowNewMap(false);
    setMapName('');
    setMapDesc('');
    setMapType('maplibre-outdoor-contour');
    setMapColor('#C23A2B');
    setMapBorder(false);
    navigate('/map');
  };

  // Delete map
  const handleDeleteMap = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定删除这个地图项目吗？')) return;
    deleteProject(id);
  };

  const mapTypeLabel = (t: ProjectMapType) => MAP_TYPES.find((m) => m.type === t)?.labelZh || t;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-6 bg-gradient-to-b from-indigo-400 to-indigo-200 rounded-full" />
          <h1 className="text-2xl font-bold text-gray-900">创意工作室</h1>
        </div>
        <p className="text-sm text-gray-500 ml-4">管理你的小说和世界观地图</p>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 pb-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab('novels')}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'novels' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📖 小说
          </button>
          <button
            onClick={() => setTab('maps')}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'maps' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🗺️ 地图
          </button>
        </div>
      </div>

      {/* Novel Tab */}
      {tab === 'novels' && (
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">{novels.length} 部小说</p>
            <button
              onClick={() => setShowNewNovel(true)}
              className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              + 新建小说
            </button>
          </div>

          {novels.length === 0 ? (
            <div className="text-center mt-20 text-gray-400">
              <div className="text-5xl mb-3">📖</div>
              <p>还没有小说</p>
              <p className="text-sm mt-1">点击"新建小说"开始创作</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {novels.map((novel) => (
                <div
                  key={novel.id}
                  onClick={() => navigate(`/novel/${novel.id}`)}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{novel.coverUrl || '📖'}</span>
                      <div>
                        <h3 className="font-medium text-gray-800">{novel.title}</h3>
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium">{novel.genre}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteNovel(novel.id, e)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                  {novel.description && (
                    <p className="text-xs text-gray-400 mt-3 line-clamp-2">{novel.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{novel.wordCount.toLocaleString()} 字</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map Tab */}
      {tab === 'maps' && (
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">{projects.length} 个地图</p>
            <button
              onClick={() => setShowNewMap(true)}
              className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              + 新建地图
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center mt-20 text-gray-400">
              <div className="text-5xl mb-3">🗺️</div>
              <p>还没有地图项目</p>
              <p className="text-sm mt-1">点击"新建地图"开始临摹</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...projects].reverse().map((project) => (
                <div
                  key={project.id}
                  onClick={() => {
                    openProject(project.id);
                    navigate('/map');
                  }}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{project.name}</h3>
                      <span className="text-xs bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-medium">
                        {mapTypeLabel(project.mapType)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteMap(project.id, e)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: project.backgroundColor }}
                    />
                    <span className="text-xs text-gray-400">
                      {project.elements.length} 个元素
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    创建于 {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Novel Dialog */}
      {showNewNovel && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setShowNewNovel(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-medium">新建小说</h2>

            {/* Cover emoji selector */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">封面图标</label>
              <div className="flex flex-wrap gap-1.5">
                {COVER_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setNovelCover(emoji)}
                    className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-colors ${
                      novelCover === emoji ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <input
              value={novelTitle}
              onChange={(e) => setNovelTitle(e.target.value)}
              placeholder="小说标题 *"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateNovel()}
            />
            <textarea
              value={novelDesc}
              onChange={(e) => setNovelDesc(e.target.value)}
              placeholder="小说描述（可选）"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
            <select
              value={novelGenre}
              onChange={(e) => setNovelGenre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            >
              {NOVEL_GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNewNovel(false)} className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleCreateNovel} disabled={!novelTitle.trim()} className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                提交
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Map Dialog */}
      {showNewMap && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setShowNewMap(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-medium">新建地图</h2>
            <input
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              placeholder="地图名称 *"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateMap()}
            />
            <textarea
              value={mapDesc}
              onChange={(e) => setMapDesc(e.target.value)}
              placeholder="地图描述（可选）"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />

            {/* Base map selection */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">底图选择</label>
              <div className="grid grid-cols-3 gap-2">
                {MAP_TYPES.map((mt) => (
                  <button
                    key={mt.type}
                    onClick={() => setMapType(mt.type)}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      mapType === mt.type
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-10 mb-1" dangerouslySetInnerHTML={{ __html: mt.svgPreview }} />
                    <span className="text-[10px] text-gray-500">{mt.labelZh}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trace color */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">临摹颜色</label>
              <div className="flex flex-wrap gap-2">
                {[...ANCIENT_COLORS, ...INK_COLORS].map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setMapColor(c.value)}
                    className={`w-7 h-7 rounded-full border-2 transition-colors ${
                      mapColor === c.value ? 'border-indigo-400 scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Border style */}
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={mapBorder}
                onChange={(e) => setMapBorder(e.target.checked)}
                className="rounded border-gray-300"
              />
              装饰边框
            </label>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNewMap(false)} className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleCreateMap} disabled={!mapName.trim()} className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
