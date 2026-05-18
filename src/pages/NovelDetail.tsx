import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { NovelMeta, Chapter, Outline, SaveStatus } from '../types/novel';
import { getNovel, listChapters, createChapter, deleteChapter, updateChapter, listOutlines, createOutline, updateOutline, deleteOutline } from '../dexie/novelRepo';
import { NovelEditor, type NovelEditorHandle } from '../components/editor/NovelEditor';
import { useMapStore } from '../store/useMapStore';
import { MapContainer } from '../components/MapContainer';
import { DrawingOverlay } from '../components/DrawingOverlay';
import { Toolbar } from '../components/Toolbar';
import { ElementsPanel } from '../components/ElementsPanel';
import { ZoomControl } from '../components/ZoomControl';

const OUTLINE_TYPES: { value: Outline['type']; label: string }[] = [
  { value: 'plot', label: '剧情' },
  { value: 'character_arc', label: '角色弧' },
  { value: 'setting', label: '设定' },
  { value: 'note', label: '备注' },
];

export function NovelDetail() {
  const { id: novelId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Novel state
  const [novel, setNovel] = useState<NovelMeta | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Save state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const chapterContentRef = useRef({ json: '', text: '', wordCount: 0 });

  // Editor ref
  const editorRef = useRef<NovelEditorHandle>(null);

  // Left sidebar
  const [leftTab, setLeftTab] = useState<'outline' | 'map'>('outline');
  const [showLeftPanel, setShowLeftPanel] = useState(true);

  // Outline state
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [editingOutline, setEditingOutline] = useState<Outline | null>(null);
  const [showNewOutline, setShowNewOutline] = useState(false);
  const [outlineTitle, setOutlineTitle] = useState('');
  const [outlineContent, setOutlineContent] = useState('');
  const [outlineType, setOutlineType] = useState<Outline['type']>('plot');

  // Map state
  const projects = useMapStore((s) => s.projects);
  const openProject = useMapStore((s) => s.openProject);
  const closeProject = useMapStore((s) => s.closeProject);

  const load = useCallback(async () => {
    if (!novelId) return;
    setNovel(await getNovel(novelId) ?? null);
    setChapters(await listChapters(novelId));
    setOutlines(await listOutlines(novelId));
  }, [novelId]);

  useEffect(() => { load(); }, [load]);

  const performSave = useCallback(async () => {
    if (!selectedChapter) return;
    const { json, text, wordCount } = chapterContentRef.current;
    setSaveStatus('saving');
    await updateChapter(selectedChapter.id, { content: json, wordCount });
    setSaveStatus('saved');
    setSelectedChapter((prev) => prev ? { ...prev, content: json, wordCount } : null);
  }, [selectedChapter]);

  const handleEditorUpdate = useCallback((json: string, text: string, wc: number) => {
    chapterContentRef.current = { json, text, wordCount: wc };
    setSaveStatus('unsaved');
    performSave();
  }, [performSave]);

  // Chapter handlers
  const handleSelectChapter = async (ch: Chapter) => {
    setSelectedChapter(ch);
    chapterContentRef.current = { json: ch.content, text: '', wordCount: ch.wordCount };
  };

  const handleCreateChapter = async () => {
    if (!novelId) return;
    const title = prompt('章节标题（可选）');
    if (title === null) return;
    const ch = await createChapter(novelId, title || '');
    setChapters(await listChapters(novelId));
    handleSelectChapter(ch);
  };

  const handleDeleteChapter = async (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定删除此章节？')) return;
    await deleteChapter(chapterId);
    setChapters(await listChapters(novelId!));
    if (selectedChapter?.id === chapterId) setSelectedChapter(null);
  };

  // Outline handlers
  const handleCreateOutline = async () => {
    if (!novelId || !outlineTitle.trim()) return;
    await createOutline(novelId, outlineTitle.trim(), outlineContent, outlineType);
    setShowNewOutline(false);
    setOutlineTitle('');
    setOutlineContent('');
    setOutlineType('plot');
    setOutlines(await listOutlines(novelId));
  };

  const handleSaveOutline = async () => {
    if (!editingOutline || !outlineTitle.trim()) return;
    await updateOutline(editingOutline.id, { title: outlineTitle.trim(), content: outlineContent, type: outlineType });
    setEditingOutline(null);
    setOutlines(await listOutlines(novelId!));
  };

  const handleDeleteOutline = async (id: string) => {
    if (!confirm('确定删除此大纲？')) return;
    await deleteOutline(id);
    setOutlines(await listOutlines(novelId!));
  };

  // Map handlers
  const handleSelectMap = (projectId: string) => {
    openProject(projectId);
  };

  const handleCloseMap = () => {
    closeProject();
  };

  const handleExport = useCallback(() => {
    const text = editorRef.current?.getText() || chapterContentRef.current.text;
    const title = selectedChapter?.title || '未命名章节';
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedChapter]);

  if (!novel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/studio')}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title="返回"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-0.5"
            title={showLeftPanel ? '隐藏左侧面板' : '显示左侧面板'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {showLeftPanel ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              )}
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-800">{novel.title}</span>
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">{novel.genre || '未分类'}</span>
          <span className="text-sm text-gray-400">{novel.wordCount.toLocaleString()} 字</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {selectedChapter && (
            <>
              <span className={`${saveStatus === 'saved' ? 'text-green-600' : saveStatus === 'saving' ? 'text-gray-400' : 'text-orange-500'}`}>
                {saveStatus === 'saved' ? '✓ 已保存' : saveStatus === 'saving' ? '○ 保存中...' : '⚠ 未保存'}
              </span>
              <span className="text-gray-300">|</span>
              <button onClick={handleExport} className="hover:text-gray-600 cursor-pointer">导出</button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        {showLeftPanel && (
        <div className="flex-1 max-w-[50%] border-r border-gray-200 flex flex-col flex-shrink-0 bg-gray-50">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setLeftTab('outline')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                leftTab === 'outline' ? 'bg-white text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              大纲
            </button>
            <button
              onClick={() => setLeftTab('map')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                leftTab === 'map' ? 'bg-white text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              地图
            </button>
          </div>

          {/* Outline tab */}
          {leftTab === 'outline' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {outlines.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center mt-8">暂无大纲</p>
                ) : (
                  outlines.map((o) => (
                    <div key={o.id}>
                      <button
                        onClick={() => {
                          setEditingOutline(o);
                          setOutlineTitle(o.title);
                          setOutlineContent(o.content);
                          setOutlineType(o.type);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {OUTLINE_TYPES.find((t) => t.value === o.type)?.label || o.type}
                          </span>
                          <span className="font-medium text-gray-800 truncate">{o.title}</span>
                        </div>
                        {o.content && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{o.content}</p>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-gray-200">
                <button
                  onClick={() => setShowNewOutline(true)}
                  className="w-full px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  + 新建大纲
                </button>
              </div>
            </div>
          )}

          {/* Map tab */}
          {leftTab === 'map' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {!useMapStore.getState().currentProjectId ? (
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center space-y-3 w-full">
                    <p className="text-xs text-gray-500">选择关联的地图</p>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {projects.length === 0 ? (
                        <p className="text-xs text-gray-400">暂无地图</p>
                      ) : (
                        projects.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleSelectMap(p.id)}
                            className="block w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 text-xs cursor-pointer"
                          >
                            {p.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 relative">
                  <MapContainer />
                  <DrawingOverlay />
                  <Toolbar />
                  <ZoomControl />
                  <ElementsPanel />
                  <button
                    onClick={handleCloseMap}
                    className="absolute top-2 left-2 z-10 px-2 py-1 text-xs bg-white rounded shadow hover:bg-gray-50 cursor-pointer"
                  >
                    ← 取消关联
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* Right panel */}
        <div className="flex-1 flex overflow-hidden">
          {selectedChapter ? (
            <>
              {/* Chapter sidebar within right panel */}
              <div className="w-44 border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200 flex items-center justify-between">
                  <span>目录</span>
                  <button
                    onClick={() => setSelectedChapter(null)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    title="返回列表"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {chapters.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => handleSelectChapter(ch)}
                      className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 hover:bg-gray-100 cursor-pointer ${
                        ch.id === selectedChapter.id ? 'bg-amber-50 text-amber-800 font-medium border-l-2 border-l-amber-400' : 'text-gray-700'
                      }`}
                    >
                      <div className="truncate">{ch.title || `第${ch.order}章`}</div>
                      <div className="text-xs text-gray-400">{ch.wordCount?.toLocaleString()} 字</div>
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-gray-200">
                  <button
                    onClick={handleCreateChapter}
                    className="w-full px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
                  >
                    + 新建章节
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 flex flex-col">
                <NovelEditor
                  ref={editorRef}
                  content={selectedChapter.content}
                  chapterTitle={selectedChapter.title || `第${selectedChapter.order}章`}
                  saveStatus={saveStatus}
                  onUpdate={handleEditorUpdate}
                  onSave={performSave}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium text-gray-700">
                  章节目录 ({chapters.length})
                </h2>
                <button
                  onClick={handleCreateChapter}
                  className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  + 新建章节
                </button>
              </div>

              {chapters.length === 0 ? (
                <div className="text-center mt-16 text-gray-400">
                  <p>还没有章节</p>
                  <p className="text-sm mt-1">点击"新建章节"开始写作</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chapters.map((ch) => (
                    <div
                      key={ch.id}
                      onClick={() => handleSelectChapter(ch)}
                      className="bg-white rounded-lg px-4 py-3 border border-gray-100 shadow-sm hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-6 text-right">{ch.order}</span>
                        <div>
                          <span className="text-gray-800">{ch.title || '未命名章节'}</span>
                          <span className="text-xs text-gray-400 ml-2">{ch.wordCount?.toLocaleString()} 字</span>
                          {ch.status === 'draft' && <span className="text-xs text-orange-500 ml-2">草稿</span>}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteChapter(ch.id, e)}
                        className="text-gray-300 hover:text-red-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Outline Dialog */}
      {showNewOutline && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setShowNewOutline(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-medium">新建大纲</h2>
            <select
              value={outlineType}
              onChange={(e) => setOutlineType(e.target.value as Outline['type'])}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            >
              {OUTLINE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input
              value={outlineTitle}
              onChange={(e) => setOutlineTitle(e.target.value)}
              placeholder="标题 *"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateOutline()}
            />
            <textarea
              value={outlineContent}
              onChange={(e) => setOutlineContent(e.target.value)}
              placeholder="内容（可选）"
              rows={5}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNewOutline(false)} className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">取消</button>
              <button onClick={handleCreateOutline} disabled={!outlineTitle.trim()} className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Outline Dialog */}
      {editingOutline && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setEditingOutline(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-medium">编辑大纲</h2>
            <select
              value={outlineType}
              onChange={(e) => setOutlineType(e.target.value as Outline['type'])}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            >
              {OUTLINE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input
              value={outlineTitle}
              onChange={(e) => setOutlineTitle(e.target.value)}
              placeholder="标题 *"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveOutline()}
            />
            <textarea
              value={outlineContent}
              onChange={(e) => setOutlineContent(e.target.value)}
              placeholder="内容（可选）"
              rows={5}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="flex gap-2 justify-between">
              <button
                onClick={async () => {
                  await handleDeleteOutline(editingOutline.id);
                  setEditingOutline(null);
                }}
                className="px-4 py-1.5 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50 cursor-pointer"
              >
                删除
              </button>
              <div className="flex gap-2">
                <button onClick={() => setEditingOutline(null)} className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">取消</button>
                <button onClick={handleSaveOutline} disabled={!outlineTitle.trim()} className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
