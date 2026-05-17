import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  sales: number;
  tags: string[];
  category: 'physical' | 'digital';
  details: string;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Terra-Trace 限定帆布包',
    description: '世界观主题限量帆布包，简约设计，日常百搭',
    price: 8900,
    originalPrice: 12900,
    sales: 328,
    tags: ['实体', '限量'],
    category: 'physical',
    details: '采用 16 安纯棉帆布，精致刺绣 LOGO，容量可容纳 15 寸笔记本电脑。限量 500 个，售完即止。',
  },
  {
    id: '2',
    name: '世界观设定集（电子版）',
    description: '精选平台优秀世界观设定，收录 50 位创作者的精华',
    price: 3900,
    originalPrice: null,
    sales: 2156,
    tags: ['电子'],
    category: 'digital',
    details: 'PDF 格式，包含 50 位优秀创作者的世界观设定文档，涵盖奇幻、仙侠、科幻等多种题材。购买后永久有效。',
  },
  {
    id: '3',
    name: '仙侠世界主题鼠标垫',
    description: '800x300mm 大尺寸鼠标垫，仙侠风格插画',
    price: 4900,
    originalPrice: 6900,
    sales: 867,
    tags: ['实体'],
    category: 'physical',
    details: '高密度橡胶底，顺滑织物表面。仙侠风格全彩印刷，为你的桌面增添一份仙气。',
  },
  {
    id: '4',
    name: '创作加速器 - 月卡',
    description: 'AI 写作助手月度会员，无限次使用 AI 功能',
    price: 29900,
    originalPrice: 49900,
    sales: 3421,
    tags: ['数字', '会员'],
    category: 'digital',
    details: '月卡有效期内可无限次使用 AI 续写、改写、扩写等功能。包含 100 万字符的 AI 生成额度。',
  },
  {
    id: '5',
    name: '世界观地图挂画',
    description: '平台精选世界观地图艺术微喷，装裱成品',
    price: 15900,
    originalPrice: null,
    sales: 234,
    tags: ['实体', '限量'],
    category: 'physical',
    details: '艺术微喷工艺，museum 级装裱。50x70cm 尺寸，含实木框。限量 200 幅，每幅带独立编号。',
  },
  {
    id: '6',
    name: '写作素材包 - 仙侠卷',
    description: '500+ 仙侠题材写作素材：地名、功法、丹药等',
    price: 1900,
    originalPrice: 3900,
    sales: 4521,
    tags: ['电子'],
    category: 'digital',
    details: 'Excel 表格 + PDF 文档，包含 500+ 仙侠题材写作素材。涵盖地名生成、功法体系、丹药炼制、宗门设定等模块。',
  },
];

export default function ShopPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [category, setCategory] = useState<'all' | 'physical' | 'digital'>('all');
  const [selected, setSelected] = useState<Product | null>(null);

  const filtered = category === 'all'
    ? mockProducts
    : mockProducts.filter((p) => p.category === category);

  const formatPrice = (cents: number) => `¥${(cents / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-200 rounded-full" />
          <h1 className="text-3xl font-bold text-gray-900">周边商场</h1>
        </div>
        <p className="text-gray-500 ml-4">文创周边、数字商品，让你的创作更有价值</p>
      </div>

      {/* Filter */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="flex gap-2">
          {(['all', 'physical', 'digital'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setCategory(f)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                category === f
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'physical' ? '实体周边' : '数字商品'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500">暂无商品</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelected(product)}
                className="text-left p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-yellow-200 transition-all hover:-translate-y-1"
              >
                {/* Image placeholder */}
                <div className="w-full h-40 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-5xl">
                    {product.category === 'physical' ? '🎁' : '📦'}
                  </span>
                </div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs border border-gray-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-yellow-500">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">已售 {product.sales}</span>
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
            <div className="w-full h-48 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl mb-6 flex items-center justify-center">
              <span className="text-6xl">
                {selected.category === 'physical' ? '🎁' : '📦'}
              </span>
            </div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{selected.name}</h2>
                <div className="flex gap-2 flex-wrap">
                  {selected.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs border border-gray-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm mb-6">{selected.details}</p>
            <div className="flex items-center justify-between py-4 border-t border-white/10">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-yellow-500">
                  {formatPrice(selected.price)}
                </span>
                {selected.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(selected.originalPrice)}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">已售 {selected.sales}</span>
            </div>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/auth');
                } else {
                  alert('购买功能待对接支付');
                }
              }}
              className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              立即购买
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
