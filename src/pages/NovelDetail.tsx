import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { NovelMeta, Chapter, Outline, CharacterCard, Note, SaveStatus } from '../types/novel';
import { getNovel, listChapters, createChapter, deleteChapter, updateChapter, listOutlines, createOutline, updateOutline, deleteOutline, reorderOutlines, listCharacters, createCharacter, deleteCharacter, listNotes, createNote, deleteNote, updateNovel } from '../dexie/novelRepo';
import { NovelEditor, type NovelEditorHandle } from '../components/editor/NovelEditor';
import { useMapStore } from '../store/useMapStore';
import { CreateProjectDialog } from '../components/CreateProjectDialog';
import { MapContainer } from '../components/MapContainer';
import { message } from 'antd';
import { uploadSync, downloadSync, restoreFromSync } from '../utils/sync';
import { DrawingOverlay } from '../components/DrawingOverlay';
import { Toolbar } from '../components/Toolbar';
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
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [leftTopPanel, setLeftTopPanel] = useState<'map' | 'outline'>('map');
  const [leftMode, setLeftMode] = useState<'split' | 'map' | 'outline'>('split');
  const [showChapters, setShowChapters] = useState(true);

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

  // Collapsible sections
  const [settingExpanded, setSettingExpanded] = useState(true);
  const [inspirationExpanded, setInspirationExpanded] = useState(false);
  const [outlineExpanded, setOutlineExpanded] = useState(true);

  // Characters
  const [characters, setCharacters] = useState<CharacterCard[]>([]);

  // Notes / inspiration
  const [notes, setNotes] = useState<Note[]>([]);

  // Create project dialog
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Dialog states
  const [showSettingDialog, setShowSettingDialog] = useState(false);
  const [settingBackground, setSettingBackground] = useState('');
  const [newCharName, setNewCharName] = useState('');
  const [newCharRole, setNewCharRole] = useState('');
  const [showNewChapterDialog, setShowNewChapterDialog] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  const handleSync = async () => {
    const hide = message.loading('同步中...', 0);
    try {
      await uploadSync();
      hide();
      message.success('同步成功');
    } catch (e: any) {
      hide();
      message.error(`同步失败: ${e?.message || '未知错误'}`);
    }
  };

  // Drag state
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!novelId) return;
    setNovel(await getNovel(novelId) ?? null);
    setChapters(await listChapters(novelId));
    setOutlines(await listOutlines(novelId));
    setCharacters(await listCharacters(novelId));
    setNotes(await listNotes(novelId));
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

  const handleCreateChapter = async (title: string) => {
    if (!novelId) return;
    const ch = await createChapter(novelId, title || '');
    setNewChapterTitle('');
    setShowNewChapterDialog(false);
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

  // Reusable panel renderers
  const renderMapPanel = () => (
    <>
      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-200 bg-white flex-shrink-0">
        <span className="text-xs font-medium text-gray-500">地图</span>
        {showChapters && (
          <button onClick={() => setLeftMode(leftMode === 'map' ? 'split' : 'map')}
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-indigo-600 cursor-pointer"
            title={leftMode === 'map' ? '退出全屏' : '地图全屏'}>
            {leftMode === 'map' ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="flex-1 relative">
        <MapContainer />
      {useMapStore.getState().currentProjectId ? (
        <>
          <DrawingOverlay />
          <Toolbar />
          <ZoomControl />
          <button onClick={handleCloseMap}
            className="absolute top-2 left-2 z-10 px-2 py-1 text-xs bg-white rounded shadow hover:bg-gray-50 cursor-pointer">
            ← 取消关联
          </button>
        </>
      ) : (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-xl max-w-xs w-full pointer-events-auto">
            <p className="text-xs text-gray-500 mb-3 text-center">选择关联的地图</p>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {projects.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">暂无地图</p>
              ) : (
                projects.map((p) => (
                  <button key={p.id} onClick={() => handleSelectMap(p.id)}
                    className="block w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 text-xs cursor-pointer">
                    {p.name}
                  </button>
                ))
              )}
            </div>
            <button onClick={() => setShowCreateProject(true)}
              className="w-full mt-3 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
              + 新建地图
            </button>
          </div>
        </div>
      )}
      {showCreateProject && <CreateProjectDialog onClose={() => setShowCreateProject(false)} />}
    </div>
    </>
  );

  const renderOutlinePanel = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex gap-1.5 p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0 items-center">
        <button onClick={() => { setShowSettingDialog(true); setSettingBackground(novel!.description); }}
          className="flex-1 px-2 py-1.5 text-[11px] bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all cursor-pointer">+ 设定</button>
        <button onClick={() => setShowNewOutline(true)}
          className="flex-1 px-2 py-1.5 text-[11px] bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all cursor-pointer">+ 大纲</button>
        <button onClick={() => setShowNewNoteDialog(true)}
          className="flex-1 px-2 py-1.5 text-[11px] bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all cursor-pointer">+ 灵感</button>
        <button
          onClick={() => {
            if (!showChapters) {
              setShowLeftPanel(!showLeftPanel);
            } else {
              setLeftMode(leftMode === 'outline' ? 'split' : 'outline');
            }
          }}
          className="w-[26px] h-[26px] flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer flex-shrink-0"
          title={(!showChapters && !showLeftPanel) || leftMode === 'outline' ? '退出全屏' : '大纲全屏'}
        >
          {(!showChapters && !showLeftPanel) || leftMode === 'outline' ? (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex-shrink-0 border-b border-gray-200">
        <button onClick={() => setSettingExpanded(!settingExpanded)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100/50 cursor-pointer">
          <svg className={`w-3 h-3 transition-transform ${settingExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          设定
        </button>
        {settingExpanded && (
          <div className="px-3 pb-2 space-y-2">
            <div>
              <div className="text-[10px] text-gray-400 mb-0.5">小说背景</div>
              <p className="text-[11px] text-gray-600 leading-relaxed bg-white rounded px-2.5 py-1.5 border border-gray-100 min-h-[2rem]">
                {novel!.description || '暂无背景设定'}
              </p>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 mb-0.5">角色 ({characters.length})</div>
              {characters.length === 0 ? (
                <p className="text-[11px] text-gray-400">暂无角色</p>
              ) : (
                <div className="space-y-0.5">
                  {characters.map((c) => (
                    <div key={c.id} className="flex items-center gap-1.5 bg-white rounded px-2 py-1 border border-gray-100">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-medium flex-shrink-0">{c.name[0]}</div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-gray-700 truncate">{c.name}</div>
                        <div className="text-[9px] text-gray-400">{c.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className={`${outlineExpanded ? 'flex-1' : 'flex-shrink-0'} flex flex-col min-h-0 border-b border-gray-200`}>
        <button onClick={() => setOutlineExpanded(!outlineExpanded)}
          className="flex-shrink-0 w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100/50 cursor-pointer">
          <svg className={`w-3 h-3 transition-transform ${outlineExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          大纲
          {outlines.length > 0 && <span className="ml-auto text-xs text-gray-400">{outlines.length} 项</span>}
        </button>
        {outlineExpanded && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="pb-2">
              {outlines.length === 0 ? (
                <div className="px-3 py-4"><p className="text-xs text-gray-400 text-center">暂无大纲</p></div>
              ) : (
                <div className="relative px-3">
                  <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-indigo-200" />
                  {outlines.map((o, index) => (
                    <div key={o.id} draggable
                      onDragStart={(e) => { e.dataTransfer.setData('text/plain', index.toString()); e.dataTransfer.effectAllowed = 'move'; }}
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverIndex(index); }}
                      onDragLeave={() => setDragOverIndex(null)}
                      onDrop={async (e) => {
                        e.preventDefault(); setDragOverIndex(null);
                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        if (fromIndex === index) return;
                        const reordered = [...outlines]; const [moved] = reordered.splice(fromIndex, 1);
                        reordered.splice(index, 0, moved);
                        await reorderOutlines(novelId!, reordered.map((x) => x.id));
                        setOutlines(await listOutlines(novelId!));
                      }}
                      onDragEnd={() => setDragOverIndex(null)}
                      className={`relative flex items-start gap-3 pb-3 last:pb-0 cursor-grab active:cursor-grabbing transition-opacity ${dragOverIndex === index ? 'opacity-70' : ''}`}>
                      <div className="relative z-10 mt-1 w-[30px] flex justify-center flex-shrink-0">
                        <div className={`w-[13px] h-[13px] rounded-full border-2 ${dragOverIndex === index ? 'border-indigo-500 bg-indigo-100' : 'border-indigo-400 bg-white'}`} />
                      </div>
                      <div onClick={() => { setEditingOutline(o); setOutlineTitle(o.title); setOutlineContent(o.content); setOutlineType(o.type); }}
                        className={`flex-1 bg-white rounded-lg px-2.5 py-2 border cursor-pointer transition-all hover:shadow-sm ${dragOverIndex === index ? 'border-indigo-400 shadow-sm' : 'border-gray-200 hover:border-indigo-300'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-indigo-500 w-4 flex-shrink-0">{o.order}</span>
                          <span className="text-xs font-medium text-gray-800 truncate">{o.title}</span>
                        </div>
                        {o.content && <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 ml-6">{o.content}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        <button onClick={() => setInspirationExpanded(!inspirationExpanded)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100/50 cursor-pointer">
          <svg className={`w-3 h-3 transition-transform ${inspirationExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          灵感
          {notes.length > 0 && <span className="ml-auto text-xs text-gray-400">{notes.length}</span>}
        </button>
        {inspirationExpanded && (
          <div className="px-3 pb-2 space-y-1">
            {notes.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">暂无灵感</p>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="group bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-gray-700">{n.title}</div>
                      {n.content && <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{n.content}</p>}
                    </div>
                    <button onClick={async () => { await deleteNote(n.id); setNotes(await listNotes(novelId!)); }}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );

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
          <span className="text-sm font-medium text-gray-800">{novel.title}</span>
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">{novel.genre || '未分类'}</span>
          <span className="text-sm text-gray-400">{novel.wordCount.toLocaleString()} 字</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <button onClick={handleSync}
            className="text-gray-400 hover:text-gray-600 cursor-pointer flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            title="同步所有数据至服务器">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            同步
          </button>
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
        {/* Left sidebar — supports split / map-full / outline-full modes */}
        {showLeftPanel && (
        <div className="flex-1 max-w-[50%] border-r border-gray-200 flex flex-col flex-shrink-0 bg-gray-50">
          {(() => {
            const mode = showChapters ? leftMode : 'map';
            if (mode === 'split') {
              return (
                <>
                  <div className="flex-1 flex flex-col min-h-0 border-b border-gray-200">
                    {leftTopPanel === 'map' ? renderMapPanel() : renderOutlinePanel()}
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-center h-5 bg-gray-50 border-y border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                       onClick={() => setLeftTopPanel(leftTopPanel === 'map' ? 'outline' : 'map')}
                       title={leftTopPanel === 'map' ? '交换：大纲到上方' : '交换：地图到上方'}>
                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <div className="flex-1 flex flex-col min-h-0">
                    {leftTopPanel === 'map' ? renderOutlinePanel() : renderMapPanel()}
                  </div>
                </>
              );
            } else if (mode === 'map') {
              return (
                <div className="flex-1 flex flex-col min-h-0">
                  {renderMapPanel()}
                </div>
              );
            } else {
              return (
                <div className="flex-1 flex flex-col min-h-0">
                  {renderOutlinePanel()}
                </div>
              );
            }
          })()}
        </div>
        )}

        {/* Right panel — chapters or outline */}
        {showChapters ? (
        <div className="flex-1 flex overflow-hidden">
          {selectedChapter ? (
            <>
              <div className="w-44 border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200 flex items-center justify-between">
                  <span>目录</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setShowLeftPanel(!showLeftPanel)}
                      className="text-gray-400 hover:text-indigo-600 cursor-pointer"
                      title={showLeftPanel ? '小说全屏' : '退出全屏'}>
                      {showLeftPanel ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                        </svg>
                      )}
                    </button>
                    <button onClick={() => setShowChapters(!showChapters)}
                      className="text-gray-400 hover:text-indigo-600 cursor-pointer"
                      title={showChapters ? '隐藏章节面板' : '显示章节面板'}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button onClick={() => setSelectedChapter(null)}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer" title="返回列表">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {chapters.map((ch) => (
                    <button key={ch.id} onClick={() => handleSelectChapter(ch)}
                      className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 hover:bg-gray-100 cursor-pointer ${ch.id === selectedChapter.id ? 'bg-amber-50 text-amber-800 font-medium border-l-2 border-l-amber-400' : 'text-gray-700'}`}>
                      <div className="truncate">{ch.title || `第${ch.order}章`}</div>
                      <div className="text-xs text-gray-400">{ch.wordCount?.toLocaleString()} 字</div>
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-gray-200">
                  <button onClick={() => { setNewChapterTitle(''); setShowNewChapterDialog(true); }}
                    className="w-full px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer">
                    + 新建章节
                  </button>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <NovelEditor ref={editorRef} content={selectedChapter.content}
                  chapterTitle={selectedChapter.title || `第${selectedChapter.order}章`}
                  saveStatus={saveStatus} onUpdate={handleEditorUpdate} onSave={performSave} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium text-gray-700">章节目录 ({chapters.length})</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowLeftPanel(!showLeftPanel)}
                    className="text-gray-400 hover:text-indigo-600 cursor-pointer p-1"
                    title={showLeftPanel ? '小说全屏' : '退出全屏'}>
                    {showLeftPanel ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                      </svg>
                    )}
                  </button>
                  <button onClick={() => setShowChapters(!showChapters)}
                    className="text-gray-400 hover:text-indigo-600 cursor-pointer p-1"
                    title={showChapters ? '隐藏章节面板' : '显示章节面板'}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button onClick={() => { setNewChapterTitle(''); setShowNewChapterDialog(true); }}
                    className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
                    + 新建章节
                  </button>
                </div>
              </div>
              {chapters.length === 0 ? (
                <div className="text-center mt-16 text-gray-400">
                  <p>还没有章节</p>
                  <p className="text-sm mt-1">点击"新建章节"开始写作</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chapters.map((ch) => (
                    <div key={ch.id} onClick={() => handleSelectChapter(ch)}
                      className="bg-white rounded-lg px-4 py-3 border border-gray-100 shadow-sm hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-6 text-right">{ch.order}</span>
                        <div>
                          <span className="text-gray-800">{ch.title || '未命名章节'}</span>
                          <span className="text-xs text-gray-400 ml-2">{ch.wordCount?.toLocaleString()} 字</span>
                          {ch.status === 'draft' && <span className="text-xs text-orange-500 ml-2">草稿</span>}
                        </div>
                      </div>
                      <button onClick={(e) => handleDeleteChapter(ch.id, e)}
                        className="text-gray-300 hover:text-red-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">删除</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        ) : (
        <div className="flex-1 overflow-y-auto">
          {renderOutlinePanel()}
        </div>
        )}
      </div>

      {/* New Chapter Dialog */}
      {showNewChapterDialog && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setShowNewChapterDialog(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-medium">新建章节</h2>
            <input
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              placeholder="章节标题（可选）"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateChapter(newChapterTitle)}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNewChapterDialog(false)} className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">取消</button>
              <button onClick={() => handleCreateChapter(newChapterTitle)} className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setting Dialog — background + characters */}
      {showSettingDialog && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setShowSettingDialog(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl space-y-4 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-medium">编辑设定</h2>

            <div className="flex-1 overflow-y-auto space-y-4">
              {/* 小说背景 */}
              <div>
                <div className="text-xs text-gray-400 mb-1">小说背景</div>
                <textarea
                  value={settingBackground}
                  onChange={(e) => setSettingBackground(e.target.value)}
                  placeholder="描述小说的世界观、背景设定..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  autoFocus
                />
              </div>

              {/* 角色 */}
              <div>
                <div className="text-xs text-gray-400 mb-2">角色 ({characters.length})</div>
                {/* Existing characters */}
                <div className="space-y-1 mb-2">
                  {characters.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {c.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-gray-700">{c.name}</div>
                        <div className="text-[10px] text-gray-400">{c.role || '未设定'}</div>
                      </div>
                      <button
                        onClick={async () => {
                          await deleteCharacter(c.id);
                          setCharacters(await listCharacters(novelId!));
                        }}
                        className="text-gray-300 hover:text-red-500 cursor-pointer flex-shrink-0"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                {/* Add character inline */}
                <div className="flex items-center gap-2">
                  <input
                    value={newCharName}
                    onChange={(e) => setNewCharName(e.target.value)}
                    placeholder="角色名"
                    className="flex-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                    onKeyDown={(e) => e.key === 'Enter' && document.getElementById('char-role')?.focus()}
                  />
                  <input
                    id="char-role"
                    value={newCharRole}
                    onChange={(e) => setNewCharRole(e.target.value)}
                    placeholder="定位"
                    className="flex-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        document.getElementById('add-char-btn')?.click();
                      }
                    }}
                  />
                  <button
                    id="add-char-btn"
                    onClick={async () => {
                      if (!novelId || !newCharName.trim()) return;
                      await createCharacter(novelId, newCharName.trim(), newCharRole.trim());
                      setNewCharName('');
                      setNewCharRole('');
                      setCharacters(await listCharacters(novelId));
                    }}
                    disabled={!newCharName.trim()}
                    className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer flex-shrink-0"
                  >
                    + 添加
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end flex-shrink-0 border-t border-gray-100 pt-4">
              <button onClick={() => { setShowSettingDialog(false); setNewCharName(''); setNewCharRole(''); }} className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">取消</button>
              <button
                onClick={async () => {
                  if (!novelId) return;
                  await updateNovel(novelId, { description: settingBackground });
                  setNovel(await getNovel(novelId) ?? null);
                  setShowSettingDialog(false);
                  setNewCharName('');
                  setNewCharRole('');
                }}
                className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Note Dialog */}
      {showNewNoteDialog && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setShowNewNoteDialog(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-medium">新增灵感</h2>
            <input
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="标题 *"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && document.getElementById('note-content')?.focus()}
            />
            <textarea
              id="note-content"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="内容（可选）"
              rows={5}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowNewNoteDialog(false); setNewNoteTitle(''); setNewNoteContent(''); }}
                className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  if (!novelId || !newNoteTitle.trim()) return;
                  await createNote(novelId, newNoteTitle.trim(), newNoteContent);
                  setShowNewNoteDialog(false);
                  setNewNoteTitle('');
                  setNewNoteContent('');
                  setNotes(await listNotes(novelId));
                }}
                disabled={!newNoteTitle.trim()}
                className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

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
