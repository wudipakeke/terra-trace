import { useState } from 'react';
import { useMapStore } from '../store/useMapStore';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectDialog } from '../components/CreateProjectDialog';

export function LandingPage() {
  const projects = useMapStore((s) => s.projects);
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background: '#f5f0e8',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🗺️</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#333', margin: 0 }}>
            仙侠世界观地图
          </h1>
          <span style={{ fontSize: 12, color: '#999', marginLeft: 4 }}>
            — 地图临摹工具
          </span>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: '#fff',
            color: '#333',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f0e8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
        >
          + 新建项目
        </button>
      </div>

      {/* Project Grid */}
      <div style={{ padding: '24px 32px' }}>
        {projects.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 20px',
              color: '#999',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.4 }}>🏔️</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#666', marginBottom: 8 }}>
              还没有世界观地图
            </div>
            <div style={{ fontSize: 14, color: '#999', marginBottom: 24, textAlign: 'center', maxWidth: 400 }}>
              以 MapTiler Outdoor 地形图为底图，绘制属于你的仙侠世界
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: '12px 28px',
                borderRadius: 8,
                border: '1px solid #ccc',
                background: '#fff',
                color: '#333',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + 创建第一个项目
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 20,
            }}
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => setRefreshKey((k) => k + 1)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateProjectDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
