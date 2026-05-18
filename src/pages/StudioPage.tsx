import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NovelMeta } from '../types/novel';
import { NOVEL_GENRES } from '../types/novel';
import { listNovels, createNovel, deleteNovel, createChapter, updateNovel, listTrashedNovels, restoreNovel, permanentDeleteNovel, cleanupExpiredTrash } from '../dexie/novelRepo';
import { useMapStore } from '../store/useMapStore';
import type { ProjectMapType } from '../types';
import { MAP_TYPES, ANCIENT_COLORS, INK_COLORS } from '../types';
import { downloadSync, restoreFromSync } from '../utils/sync';

type TabType = 'novels' | 'maps' | 'trash';

export default function StudioPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabType>('novels');

  const COVER_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#64748b'];
  const COVER_TEXT_COLORS = ['#ffffff', '#000000', '#fbbf24', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#3b82f6', '#22c55e', '#94a3b8'];

  // Novel state
  const [novels, setNovels] = useState<NovelMeta[]>([]);
  const [showNewNovel, setShowNewNovel] = useState(false);
  const [novelTitle, setNovelTitle] = useState('');
  const [novelDesc, setNovelDesc] = useState('');
  const [novelCover, setNovelCover] = useState(COVER_COLORS[0]);
  const [novelCoverColor, setNovelCoverColor] = useState('#ffffff');
  const [novelSubtitle, setNovelSubtitle] = useState('');
  const [novelLayout, setNovelLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [novelAlign, setNovelAlign] = useState<'left' | 'center' | 'right'>('center');
  const [novelGenre, setNovelGenre] = useState('玄幻');

  // Trash state
  const [trashedNovels, setTrashedNovels] = useState<NovelMeta[]>([]);

  // Edit novel state
  const [editingNovel, setEditingNovel] = useState<NovelMeta | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCover, setEditCover] = useState('');
  const [editCoverColor, setEditCoverColor] = useState('#ffffff');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editLayout, setEditLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [editAlign, setEditAlign] = useState<'left' | 'center' | 'right'>('center');
  const [editGenre, setEditGenre] = useState('玄幻');

  // Map state
  const projects = useMapStore((s) => s.projects);
  const createProject = useMapStore((s) => s.createProject);
  const openProject = useMapStore((s) => s.openProject);
  const deleteProject = useMapStore((s) => s.deleteProject);
  const restoreProject = useMapStore((s) => s.restoreProject);
  const permanentDeleteProject = useMapStore((s) => s.permanentDeleteProject);

  // Derive trashed maps from zustand store (auto-updates)
  const trashedProjects = projects.filter((p) => p.deletedAt);

  const [showNewMap, setShowNewMap] = useState(false);
  const [mapName, setMapName] = useState('');
  const [mapDesc, setMapDesc] = useState('');
  const [mapType, setMapType] = useState<ProjectMapType>('maplibre-outdoor-contour');
  const [mapColor, setMapColor] = useState('#C23A2B');
  const [mapBorder, setMapBorder] = useState(false);

  const activeProjects = projects.filter((p) => !p.deletedAt);

  // Auto-restore from cloud on first load
  const syncRestoredRef = useRef(false);
  useEffect(() => {
    if (syncRestoredRef.current) return;
    syncRestoredRef.current = true;
    (async () => {
      try {
        const server = await downloadSync();
        if (!server) return;
        const lastRestore = localStorage.getItem('terra-sync-last-restore');
        if (!lastRestore || new Date(lastRestore).getTime() < server.syncedAt.getTime()) {
          await restoreFromSync(server.data);
          localStorage.setItem('terra-sync-last-restore', server.syncedAt.toISOString());
          // Reload novel list
          setNovels(await listNovels());
        }
      } catch {
        // Silently ignore sync restore errors
      }
    })();
  }, []);

  const loadTrash = useCallback(async () => {
    setTrashedNovels(await listTrashedNovels());
  }, []);

  useEffect(() => {
    if (tab === 'novels') {
      listNovels().then(setNovels);
    } else if (tab === 'trash') {
      loadTrash();
      useMapStore.getState().cleanupExpiredTrashMaps();
    }
  }, [tab, loadTrash]);

  // Create novel
  const handleCreateNovel = async () => {
    if (!novelTitle.trim()) return;
    const novel = await createNovel(novelTitle.trim(), '未知作者', novelGenre);
    await updateNovel(novel.id, { description: novelDesc, coverUrl: novelCover, coverTextColor: novelCoverColor, coverSubtitle: novelSubtitle, coverLayout: novelLayout, coverAlign: novelAlign });
    await createChapter(novel.id, '第一章');
    setShowNewNovel(false);
    setNovelTitle('');
    setNovelDesc('');
    setNovelCover(COVER_COLORS[0]);
    setNovelCoverColor('#ffffff');
    setNovelSubtitle('');
    setNovelLayout('horizontal');
    setNovelAlign('center');
    setNovelGenre('玄幻');
    setNovels(await listNovels());
  };

  // Edit novel
  const handleEditNovel = (novel: NovelMeta, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNovel(novel);
    setEditTitle(novel.title);
    setEditDesc(novel.description);
    setEditCover(novel.coverUrl || COVER_COLORS[0]);
    setEditCoverColor(novel.coverTextColor || '#ffffff');
    setEditSubtitle(novel.coverSubtitle || '');
    setEditLayout(novel.coverLayout || 'horizontal');
    setEditAlign(novel.coverAlign || 'center');
    setEditGenre(novel.genre);
  };

  const handleSaveEditNovel = async () => {
    if (!editingNovel || !editTitle.trim()) return;
    await updateNovel(editingNovel.id, { title: editTitle.trim(), description: editDesc, coverUrl: editCover, coverTextColor: editCoverColor, coverSubtitle: editSubtitle, coverLayout: editLayout, coverAlign: editAlign, genre: editGenre });
    setEditingNovel(null);
    setNovels(await listNovels());
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
          <button
            onClick={() => setTab('trash')}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'trash' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🗑️ 回收站
          </button>
        </div>
      </div>

      {/* Novel Tab */}
      {tab === 'novels' && (
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">{novels.length} 部小说</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewNovel(true)}
                className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                + 新建小说
              </button>
            </div>
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
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group overflow-hidden flex"
                >
                  <div className="w-20 h-28 shrink-0 relative overflow-hidden">
                    {novel.coverUrl?.startsWith('data:image') ? (
                      <img src={novel.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0" style={{ backgroundColor: novel.coverUrl?.startsWith('#') ? novel.coverUrl : '#e2e8f0' }} />
                    )}
                    <div className="absolute inset-0 flex p-2" style={{
                        background: novel.coverUrl?.startsWith('data:image') ? 'rgba(0,0,0,0.15)' : 'none',
                        flexDirection: novel.coverLayout === 'vertical' ? 'row' : 'column',
                        alignItems: novel.coverLayout === 'vertical' ? 'center' : 'center',
                        justifyContent: (() => {
                          const a = novel.coverAlign || 'center';
                          return a === 'left' ? 'flex-start' : a === 'right' ? 'flex-end' : 'center';
                        })(),
                      }}>
                      {novel.coverLayout === 'vertical' ? (
                        <div className="flex gap-1" style={{ color: novel.coverTextColor || '#ffffff' }}>
                          <div className="text-xs font-bold drop-shadow-md" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>{novel.title}</div>
                          {novel.coverSubtitle && (
                            <div className="text-[10px] drop-shadow-md pt-4" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>{novel.coverSubtitle}</div>
                          )}
                        </div>
                      ) : (
                        <div style={{ color: novel.coverTextColor || '#ffffff' }}>
                          <div className="text-xs font-bold drop-shadow-md leading-tight text-center">{novel.title}</div>
                          {novel.coverSubtitle && (
                            <div className="text-[10px] drop-shadow-md leading-tight" style={{ textAlign: 'right' }}>{novel.coverSubtitle}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{novel.title}</h3>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditNovel(novel, e)}
                          className="text-gray-300 hover:text-indigo-500 transition-colors p-0.5"
                          title="编辑"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteNovel(novel.id, e)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-0.5"
                          title="删除"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    {novel.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{novel.description}</p>
                    )}
                    <div className="mt-auto pt-2 flex items-center gap-2">
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium">{novel.genre}</span>
                      <span className="text-xs text-gray-400">{novel.wordCount.toLocaleString()} 字</span>
                    </div>
                  </div>
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
            <p className="text-sm text-gray-400">{activeProjects.length} 个地图</p>
            <button
              onClick={() => setShowNewMap(true)}
              className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              + 新建地图
            </button>
          </div>

          {activeProjects.length === 0 ? (
            <div className="text-center mt-20 text-gray-400">
              <div className="text-5xl mb-3">🗺️</div>
              <p>还没有地图项目</p>
              <p className="text-sm mt-1">点击"新建地图"开始临摹</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...activeProjects].reverse().map((project) => (
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

            {/* Cover preview + selector */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block">封面</label>

              {/* Cover preview */}
              <div className="flex justify-center mb-4">
                <div className="w-28 h-36 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                  {novelCover.startsWith('data:image') ? (
                    <img src={novelCover} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: novelCover }} />
                  )}
                  <div className="absolute inset-0 flex p-3" style={{
                      background: novelCover.startsWith('data:image') ? 'rgba(0,0,0,0.15)' : 'none',
                      flexDirection: novelLayout === 'vertical' ? 'row' : 'column',
                      alignItems: novelLayout === 'vertical' ? 'center' : 'center',
                      justifyContent: (() => {
                        const a = novelAlign || 'center';
                        return a === 'left' ? 'flex-start' : a === 'right' ? 'flex-end' : 'center';
                      })(),
                    }}>
                    {novelTitle ? (
                      novelLayout === 'vertical' ? (
                        <div className="flex gap-1.5" style={{ color: novelCoverColor }}>
                          <div className="text-sm font-bold drop-shadow-md" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>{novelTitle}</div>
                          {novelSubtitle && (
                            <div className="text-xs drop-shadow-md pt-4" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>{novelSubtitle}</div>
                          )}
                        </div>
                      ) : (
                        <div style={{ color: novelCoverColor }}>
                          <div className="font-bold text-sm drop-shadow-md leading-tight text-center">{novelTitle}</div>
                          {novelSubtitle ? (
                            <div className="text-xs drop-shadow-md leading-tight" style={{ textAlign: 'right' }}>{novelSubtitle}</div>
                          ) : null}
                        </div>
                      )
                    ) : (
                      <span className="text-xs" style={{ color: novelCoverColor === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)' }}>小说标题</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Image upload */}
              <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-500 mb-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                上传图片
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setNovelCover(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>

              {/* Recommended colors */}
              <p className="text-xs text-gray-400 mb-1.5">推荐纯色封面</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {COVER_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNovelCover(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      novelCover === c ? 'border-indigo-400 scale-110 ring-2 ring-indigo-200' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Title text color */}
              <p className="text-xs text-gray-400 mb-1.5">标题颜色</p>
              <div className="flex flex-wrap gap-1.5">
                {COVER_TEXT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNovelCoverColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      novelCoverColor === c ? 'border-indigo-400 scale-110 ring-2 ring-indigo-200' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Layout toggle */}
              <p className="text-xs text-gray-400 mb-1.5">排版方向</p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setNovelLayout('horizontal')}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    novelLayout === 'horizontal' ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  横排
                </button>
                <button
                  onClick={() => setNovelLayout('vertical')}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    novelLayout === 'vertical' ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  竖排
                </button>
              </div>

              {/* Alignment */}
              <p className="text-xs text-gray-400 mb-1.5">对齐方式</p>
              <div className="flex gap-1.5">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => setNovelAlign(align)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      novelAlign === align ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {novelLayout === 'vertical'
                      ? (align === 'left' ? '靠左' : align === 'center' ? '居中' : '靠右')
                      : (align === 'left' ? '靠上' : align === 'center' ? '居中' : '靠下')
                    }
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
            <input
              value={novelSubtitle}
              onChange={(e) => setNovelSubtitle(e.target.value)}
              placeholder="副标题（可选）"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
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

      {/* Edit Novel Dialog */}
      {editingNovel && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setEditingNovel(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-medium">编辑小说</h2>

            {/* Cover preview + selector */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block">封面</label>

              {/* Cover preview */}
              <div className="flex justify-center mb-4">
                <div className="w-28 h-36 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                  {editCover.startsWith('data:image') ? (
                    <img src={editCover} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: editCover }} />
                  )}
                  <div className="absolute inset-0 flex p-3" style={{
                      background: editCover.startsWith('data:image') ? 'rgba(0,0,0,0.15)' : 'none',
                      flexDirection: editLayout === 'vertical' ? 'row' : 'column',
                      alignItems: editLayout === 'vertical' ? 'center' : 'center',
                      justifyContent: (() => {
                        const a = editAlign || 'center';
                        return a === 'left' ? 'flex-start' : a === 'right' ? 'flex-end' : 'center';
                      })(),
                    }}>
                    {editTitle ? (
                      editLayout === 'vertical' ? (
                        <div className="flex gap-1.5" style={{ color: editCoverColor }}>
                          <div className="text-sm font-bold drop-shadow-md" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>{editTitle}</div>
                          {editSubtitle && (
                            <div className="text-xs drop-shadow-md pt-4" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>{editSubtitle}</div>
                          )}
                        </div>
                      ) : (
                        <div style={{ color: editCoverColor }}>
                          <div className="font-bold text-sm drop-shadow-md leading-tight text-center">{editTitle}</div>
                          {editSubtitle ? (
                            <div className="text-xs drop-shadow-md leading-tight" style={{ textAlign: 'right' }}>{editSubtitle}</div>
                          ) : null}
                        </div>
                      )
                    ) : (
                      <span className="text-xs" style={{ color: editCoverColor === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)' }}>小说标题</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Image upload */}
              <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-500 mb-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                上传图片
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setEditCover(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>

              {/* Recommended colors */}
              <p className="text-xs text-gray-400 mb-1.5">推荐纯色封面</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {COVER_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setEditCover(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      editCover === c ? 'border-indigo-400 scale-110 ring-2 ring-indigo-200' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Title text color */}
              <p className="text-xs text-gray-400 mb-1.5">标题颜色</p>
              <div className="flex flex-wrap gap-1.5">
                {COVER_TEXT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setEditCoverColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      editCoverColor === c ? 'border-indigo-400 scale-110 ring-2 ring-indigo-200' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Layout toggle */}
              <p className="text-xs text-gray-400 mb-1.5">排版方向</p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setEditLayout('horizontal')}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    editLayout === 'horizontal' ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  横排
                </button>
                <button
                  onClick={() => setEditLayout('vertical')}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    editLayout === 'vertical' ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  竖排
                </button>
              </div>

              {/* Alignment */}
              <p className="text-xs text-gray-400 mb-1.5">对齐方式</p>
              <div className="flex gap-1.5">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => setEditAlign(align)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      editAlign === align ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {editLayout === 'vertical'
                      ? (align === 'left' ? '靠左' : align === 'center' ? '居中' : '靠右')
                      : (align === 'left' ? '靠上' : align === 'center' ? '居中' : '靠下')
                    }
                  </button>
                ))}
              </div>
            </div>

            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="小说标题 *"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEditNovel()}
            />
            <input
              value={editSubtitle}
              onChange={(e) => setEditSubtitle(e.target.value)}
              placeholder="副标题（可选）"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="小说描述（可选）"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
            <select
              value={editGenre}
              onChange={(e) => setEditGenre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            >
              {NOVEL_GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingNovel(null)} className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleSaveEditNovel} disabled={!editTitle.trim()} className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trash Tab */}
      {tab === 'trash' && (
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">{trashedNovels.length + trashedProjects.length} 个项目</p>
          </div>

          {trashedNovels.length === 0 && trashedProjects.length === 0 ? (
            <div className="text-center mt-20 text-gray-400">
              <div className="text-4xl mb-2">🗑️</div>
              <p className="text-sm">回收站为空</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Deleted novels */}
              {trashedNovels.map((novel) => {
                const daysLeft = novel.deletedAt ? Math.max(0, 30 - Math.floor((Date.now() - novel.deletedAt) / (24 * 60 * 60 * 1000))) : 30;
                return (
                  <div key={`novel-${novel.id}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="w-10 h-14 rounded shrink-0" style={{ backgroundColor: novel.coverUrl?.startsWith('#') ? novel.coverUrl : '#e2e8f0' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">📖</span>
                        <p className="text-sm font-medium text-gray-800 truncate">{novel.title}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{daysLeft > 0 ? `${daysLeft} 天后自动删除` : '即将自动删除'}</p>
                    </div>
                    <button
                      onClick={async () => {
                        await restoreNovel(novel.id);
                        loadTrash();
                        setNovels(await listNovels());
                      }}
                      className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      恢复
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('确定永久删除？此操作不可恢复')) return;
                        await permanentDeleteNovel(novel.id);
                        loadTrash();
                      }}
                      className="px-3 py-1 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
                    >
                      删除
                    </button>
                  </div>
                );
              })}
              {/* Deleted maps */}
              {trashedProjects.map((project) => {
                const daysLeft = project.deletedAt ? Math.max(0, 30 - Math.floor((Date.now() - project.deletedAt!) / (24 * 60 * 60 * 1000))) : 30;
                return (
                  <div key={`map-${project.id}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="w-10 h-14 rounded shrink-0 flex items-center justify-center bg-gray-50 border border-gray-200">
                      <span className="text-lg">🗺️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">🗺️</span>
                        <p className="text-sm font-medium text-gray-800 truncate">{project.name}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{daysLeft > 0 ? `${daysLeft} 天后自动删除` : '即将自动删除'}</p>
                    </div>
                    <button
                      onClick={() => {
                        restoreProject(project.id);
                      }}
                      className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      恢复
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm('确定永久删除？此操作不可恢复')) return;
                        permanentDeleteProject(project.id);
                      }}
                      className="px-3 py-1 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
                    >
                      删除
                    </button>
                  </div>
                );
              })}
            </div>
          )}
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
