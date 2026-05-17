import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { NovelMeta, Chapter } from '../types/novel';
import { getNovel, listChapters, createChapter, deleteChapter } from '../dexie/novelRepo';

export function NovelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [novel, setNovel] = useState<NovelMeta | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setNovel(await getNovel(id) ?? null);
    setChapters(await listChapters(id));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleCreateChapter = async () => {
    if (!id || !chapterTitle.trim()) return;
    await createChapter(id, chapterTitle.trim());
    setChapterTitle('');
    setShowNewChapter(false);
    load();
  };

  const handleDeleteChapter = async (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定删除此章节？')) return;
    await deleteChapter(chapterId);
    load();
  };

  if (!novel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Top bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium text-gray-800">{novel.title}</h1>
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">
            {novel.genre || '未分类'}
          </span>
          <span className="text-sm text-gray-400">
            {novel.wordCount.toLocaleString()} 字
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/novel/${id}/map`)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer shadow-sm"
          >
            🗺️ 世界观地图
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Chapter list */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-gray-700">
            章节目录 ({chapters.length})
          </h2>
          <button
            onClick={() => setShowNewChapter(true)}
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
                onClick={() => navigate(`/novel/${id}/write/${ch.id}`)}
                className="bg-white rounded-lg px-4 py-3 border border-gray-100 shadow-sm hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-6 text-right">
                    {ch.order}
                  </span>
                  <div>
                    <span className="text-gray-800">{ch.title || '未命名章节'}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {ch.wordCount.toLocaleString()} 字
                    </span>
                    {ch.status === 'draft' && (
                      <span className="text-xs text-orange-500 ml-2">草稿</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDeleteChapter(ch.id, e)}
                    className="text-gray-300 hover:text-red-500 text-sm cursor-pointer"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New chapter dialog */}
      {showNewChapter && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl space-y-4">
            <h2 className="text-lg font-medium">新建章节</h2>
            <input
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="章节标题（可选）"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateChapter()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNewChapter(false)}
                className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleCreateChapter}
                className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
