import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  author: string;
  content: string;
}

const mockTutorials: Tutorial[] = [
  {
    id: '1',
    title: '如何开始你的第一篇小说',
    description: '从零开始，学习小说创作的基本流程和方法',
    category: '小说创作',
    difficulty: 'beginner',
    duration: '20 分钟',
    author: 'Terra-Trace 编辑部',
    content: `## 第一步：确定主题

在开始写作之前，先想清楚你要写什么类型的故事。仙侠？玄幻？都市？选择一个你感兴趣且熟悉的方向。

## 第二步：构建世界观

即使是短篇小说，也需要一个基本的世界设定。这个世界的地理、历史、规则是什么？用 Terra-Trace 的地图工具，你可以先绘制出故事发生的地图。

## 第三步：设计角色

好的角色是故事的灵魂。给你的主角设计：
- 明确的动机和目标
- 独特的性格特征
- 成长弧线

## 第四步：规划情节

建议先写一个简单的提纲：
1. 开头：引入主角和世界
2. 发展：冲突逐步升级
3. 高潮：最紧张的时刻
4. 结尾：解决冲突

## 第五步：开始写作

不要追求完美，先写下第一稿。记住：好文章是改出来的。`,
  },
  {
    id: '2',
    title: '世界观构建指南',
    description: '系统学习如何构建一个完整可信的虚构世界',
    category: '世界观设定',
    difficulty: 'intermediate',
    duration: '30 分钟',
    author: '资深作者 · 青山',
    content: `## 世界观的三个层次

### 1. 物理层
- 地理环境：大陆、海洋、山脉、河流
- 气候系统：季节变化、特殊天气
- 生物体系：动植物、奇幻生物

### 2. 社会层
- 政治结构：帝国、王国、宗门
- 经济体系：货币、贸易、资源
- 文化传统：节日、习俗、禁忌

### 3. 超自然层
- 力量体系：魔法、灵力、真气
- 规则约束：代价、限制、平衡
- 神秘组织：隐藏在世界背后的力量

## 使用地图工具

打开 Terra-Trace 的地图编辑器，以真实地形为底图，勾勒出你世界的大陆轮廓。然后逐步添加标注和纹理。`,
  },
  {
    id: '3',
    title: '角色塑造的十种方法',
    description: '让你的角色栩栩如生，读者过目不忘',
    category: '小说创作',
    difficulty: 'intermediate',
    duration: '25 分钟',
    author: '人气作家 · 明月',
    content: `## 1. 赋予缺陷

完美的角色没有魅力。给角色添加真实的缺点。

## 2. 独特语言

每个角色说话的方式应该不一样。

## 3. 身体特征

一个容易记住的外貌特征。

## 4. 背景故事

过去的经历塑造了现在的性格。

## 5. 内心矛盾

让角色在两种价值观之间挣扎。

## 6. 成长空间

故事结束时，角色应该和开始时不一样。`,
  },
  {
    id: '4',
    title: '如何使用地图编辑器',
    description: 'Terra-Trace 地图绘制工具完整教程',
    category: '地图绘制',
    difficulty: 'beginner',
    duration: '15 分钟',
    author: 'Terra-Trace 团队',
    content: `## 地图编辑器入门

### 基本操作
- 选择底图：从多种真实地形图中选择
- 绘制工具：画笔、纹理、图标、文字
- 图层管理：管理多个绘制图层

### 绘制技巧
1. 先用画笔勾勒大陆轮廓
2. 用纹理填充地形区域
3. 添加图标标注重要地点
4. 用文字添加地名标注`,
  },
  {
    id: '5',
    title: '从地图到故事：场景描写技巧',
    description: '学会将地图上的场景转化为生动的文字描写',
    category: '世界观设定',
    difficulty: 'advanced',
    duration: '35 分钟',
    author: '编辑 · 流云',
    content: `## 场景描写的层次

### 宏观视角
站在高处俯瞰，给出场景的整体印象。

### 微观细节
聚焦于某个具体的物体或细节。

### 感官描写
不只是视觉，还有声音、气味、触感。

### 情感投射
让场景反映角色的情绪状态。`,
  },
  {
    id: '7',
    title: '情节设计的黄金法则',
    description: '掌握情节设计的基本原则，让故事环环相扣',
    category: '小说创作',
    difficulty: 'advanced',
    duration: '40 分钟',
    author: '资深编辑 · 老猫',
    content: `## 情节设计的核心

### 因果关系
每一个事件都应有其原因和后果。

### 伏笔与呼应
前期埋下伏笔，后期巧妙呼应。

### 节奏控制
张弛有度，高潮和低谷交替。

### 反转设计
意料之外，情理之中。`,
  },
  {
    id: '8',
    title: '仙侠题材创作入门',
    description: '仙侠小说的核心要素和创作技巧',
    category: '世界观设定',
    difficulty: 'intermediate',
    duration: '30 分钟',
    author: '仙侠作家 · 凌霄',
    content: `## 仙侠世界的核心要素

### 修炼体系
境界划分、修炼方法、突破契机。

### 宗门设定
宗门等级、门派特色、资源分布。

### 法宝丹药
法宝种类、丹药功效、炼制方法。

### 地图绘制
用 Terra-Trace 绘制你的仙侠世界地图，标注灵脉、秘境、宗门位置。`,
  },
];

const categoryColors: Record<string, string> = {
  '小说创作': 'border-blue-500/50 hover:border-blue-400',
  '世界观设定': 'border-purple-500/50 hover:border-purple-400',
  '地图绘制': 'border-green-500/50 hover:border-green-400',
};

const difficultyLabels: Record<string, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-500/20 text-green-400',
  intermediate: 'bg-yellow-500/20 text-yellow-400',
  advanced: 'bg-red-500/20 text-red-400',
};

export default function TutorialsPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<Tutorial | null>(null);
  const [freePreviewUsed, setFreePreviewUsed] = useState(false);

  const categories = ['all', '小说创作', '世界观设定', '地图绘制'];

  const filtered = category === 'all'
    ? mockTutorials
    : mockTutorials.filter((t) => t.category === category);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-6 bg-gradient-to-b from-violet-400 to-violet-200 rounded-full" />
          <h1 className="text-3xl font-bold text-gray-900">创作教程</h1>
        </div>
        <p className="text-gray-500 ml-4">从入门到精通，系统学习世界观创作技巧</p>
      </div>

      {/* Category Filter */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                category === c
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200'
              }`}
            >
              {c === 'all' ? '全部' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500">暂无教程</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((tutorial) => (
              <button
                key={tutorial.id}
                onClick={() => {
                  if (freePreviewUsed) {
                    navigate('/auth');
                  } else {
                    setFreePreviewUsed(true);
                    setSelected(tutorial);
                  }
                }}
                className="text-left p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all hover:-translate-y-1"
                style={{
                  borderColor: category === 'all'
                    ? 'rgba(255,255,255,0.1)'
                    : undefined,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs border border-gray-100">
                    {tutorial.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${difficultyColors[tutorial.difficulty]}`}>
                    {difficultyLabels[tutorial.difficulty]}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tutorial.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{tutorial.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{tutorial.author}</span>
                  <span>{tutorial.duration}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 pt-12 overflow-y-auto"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-xl p-8 mb-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex gap-2 mb-3">
                  <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs border border-gray-100">
                    {selected.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${difficultyColors[selected.difficulty]}`}>
                    {difficultyLabels[selected.difficulty]}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{selected.title}</h2>
                <p className="text-sm text-gray-500">{selected.author} · {selected.duration}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
              {selected.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
