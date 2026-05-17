import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NovelMeta } from '../types/novel';
import { NOVEL_GENRES } from '../types/novel';
import { listNovels, createNovel, deleteNovel } from '../dexie/novelRepo';

export function NovelList() {
  const navigate = useNavigate();
  const [novels, setNovels] = useState<NovelMeta[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('玄幻');

  useEffect(() => {
    listNovels().then(setNovels);
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    const novel = await createNovel(title.trim(), '未知作者', genre);
    setNovels(await listNovels());
    setShowCreate(false);
    setTitle('');
    navigate(`/novel/${novel.id}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定删除这本小说吗？所有章节将永久丢失。')) return;
    await deleteNovel(id);
    setNovels(await listNovels());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Top bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium text-gray-800">我的小说</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer shadow-sm"
          >
            + 新建小说
          </button>
        </div>
      </div>

      {/* Create dialog */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl space-y-4">
            <h2 className="text-lg font-medium">创建新小说</h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="小说标题"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              {NOVEL_GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Novel grid */}
      <div className="max-w-5xl mx-auto p-6">
        {novels.length === 0 ? (
          <div className="text-center mt-32 text-gray-400">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-lg">还没有小说</p>
            <p className="text-sm mt-1">点击右上角"新建小说"开始创作</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {novels.map((novel) => (
              <div
                key={novel.id}
                onClick={() => navigate(`/novel/${novel.id}`)}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800">{novel.title}</h3>
                  <button
                    onClick={(e) => handleDelete(novel.id, e)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {novel.genre || '未分类'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  {novel.wordCount.toLocaleString()} 字
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
