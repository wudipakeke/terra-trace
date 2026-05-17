import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import type { NovelMeta, Chapter, SaveStatus } from '../types/novel';
import { getNovel, getChapter, listChapters, updateChapter, getStorageInfo } from '../dexie/novelRepo';
import { NovelEditor, type NovelEditorHandle } from '../components/editor/NovelEditor';
import { SaveStatusBar } from '../components/editor/SaveStatusBar';

// Reuse existing map components
import { MapContainer } from '../components/MapContainer';
import { DrawingOverlay } from '../components/DrawingOverlay';
import { Toolbar } from '../components/Toolbar';
import { ElementsPanel } from '../components/ElementsPanel';
import { ZoomControl } from '../components/ZoomControl';
import { useMapStore } from '../store/useMapStore';

export function CreativeStudio() {
  const { id: novelId, chapterId } = useParams<{ id: string; chapterId: string }>();
  const navigate = useNavigate();

  // Novel state
  const [novel, setNovel] = useState<NovelMeta | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [storageUsed, setStorageUsed] = useState('--');
  const [storagePercent, setStoragePercent] = useState('--');
  const [currentMapProjectId, setCurrentMapProjectId] = useState<string | null>(null);

  // Refs for save
  const chapterContentRef = useRef({ json: '', text: '', wordCount: 0 });
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Map store
  const projects = useMapStore((s) => s.projects);
  const openProject = useMapStore((s) => s.openProject);
  const closeProject = useMapStore((s) => s.closeProject);

  const load = useCallback(async () => {
    if (!novelId) return;
    const n = await getNovel(novelId);
    setNovel(n ?? null);
    const chs = await listChapters(novelId);
    setChapters(chs);
    if (chapterId) {
      const ch = await getChapter(chapterId);
      if (ch) {
        setChapter(ch);
        chapterContentRef.current = {
          json: ch.content,
          text: '',
          wordCount: ch.wordCount,
        };
      }
    }
    const info = await getStorageInfo();
    setStorageUsed(info.used);
    setStoragePercent(info.percent);
  }, [novelId, chapterId]);

  useEffect(() => { load(); }, [load]);

  // Load storage info periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      const info = await getStorageInfo();
      setStorageUsed(info.used);
      setStoragePercent(info.percent);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto save
  const performSave = useCallback(async () => {
    if (!chapterId) return;
    const { json, text, wordCount } = chapterContentRef.current;
    setSaveStatus('saving');
    await updateChapter(chapterId, {
      content: json,
      wordCount,
    });
    setSaveStatus('saved');
    setLastSavedAt(new Date());
  }, [chapterId]);

  const handleEditorUpdate = useCallback((json: string, text: string, wc: number) => {
    chapterContentRef.current = { json, text, wordCount: wc };
    setSaveStatus('unsaved');
    if (chapter) {
      setChapter({ ...chapter, content: json, wordCount: wc });
    }
    // Auto-save debounce is in the editor component,
    // this function is called after the debounce timeout
    performSave();
  }, [chapter, performSave]);

  const handleChapterSelect = useCallback((chId: string) => {
    navigate(`/novel/${novelId}/write/${chId}`);
  }, [novelId, navigate]);

  const editorRef = useRef<NovelEditorHandle>(null);

  const handleExport = useCallback(() => {
    const text = editorRef.current?.getText() || chapterContentRef.current.text;
    const title = chapter?.title || '未命名章节';
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [chapter]);

  if (!novel || (chapterId && !chapter)) {
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
            onClick={() => {
              closeProject();
              navigate('/studio');
            }}
            className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
          >
            ← 退出
          </button>
          <span className="text-sm font-medium text-gray-800">{novel.title}</span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-sm text-gray-500">
            {chapter?.title || '未选择章节'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/novel/${novelId}/map`)}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer"
          >
            🗺️ 全屏地图
          </button>
        </div>
      </div>

      {/* Main content: split pane */}
      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal" autoSaveId="creative-studio">
          {/* Left: Map */}
          <Panel defaultSize={45} minSize={20} maxSize={70}>
            <div className="h-full flex flex-col">
              {/* Map project selector or editor */}
              {!useMapStore.getState().currentProjectId ? (
                <div className="flex-1 flex items-center justify-center bg-gray-100">
                  <div className="text-center space-y-3">
                    <p className="text-sm text-gray-500">选择关联的世界观地图</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {projects.length === 0 ? (
                        <p className="text-xs text-gray-400">暂无地图项目</p>
                      ) : (
                        projects.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setCurrentMapProjectId(p.id);
                              openProject(p.id);
                            }}
                            className="block w-full text-left px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 text-sm cursor-pointer"
                          >
                            {p.name}
                          </button>
                        ))
                      )}
                    </div>
                    <button
                      onClick={() => navigate('/map')}
                      className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      + 创建新地图
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 relative">
                  <MapContainer />
                  <DrawingOverlay />
                  <Toolbar />
                  <ZoomControl />
                  <ElementsPanel />
                </div>
              )}
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-400 transition-colors cursor-col-resize" />

          {/* Right: Novel Editor */}
          <Panel defaultSize={55} minSize={30}>
            <div className="h-full flex overflow-hidden">
              {/* Chapter sidebar */}
              <div className="w-48 border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200">
                  目录
                </div>
                <div className="flex-1 overflow-y-auto">
                  {chapters.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => handleChapterSelect(ch.id)}
                      className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 hover:bg-gray-100 cursor-pointer ${
                        ch.id === chapterId ? 'bg-amber-50 text-amber-800 font-medium border-l-2 border-l-amber-400' : 'text-gray-700'
                      }`}
                    >
                      <div className="truncate">{ch.title || `第${ch.order}章`}</div>
                      <div className="text-xs text-gray-400">{ch.wordCount.toLocaleString()} 字</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 flex flex-col">
                {chapter ? (
                  <NovelEditor
                    ref={editorRef}
                    content={chapter.content}
                    chapterTitle={chapter.title || `第${chapter.order}章`}
                    saveStatus={saveStatus}
                    onUpdate={handleEditorUpdate}
                    onSave={performSave}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    请从左侧目录选择章节
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Bottom status bar */}
      <SaveStatusBar
        wordCount={chapter?.wordCount || 0}
        saveStatus={saveStatus}
        storageUsed={storageUsed}
        storagePercent={storagePercent}
        onSave={performSave}
        onExport={handleExport}
      />
    </div>
  );
}
