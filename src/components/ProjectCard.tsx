import { useState } from 'react';
import type { TracingProject } from '../types';
import { useMapStore } from '../store/useMapStore';
import { EditProjectDialog } from './EditProjectDialog';

interface Props {
  project: TracingProject;
  onEdit: () => void;
}

export function ProjectCard({ project, onEdit }: Props) {
  const openProject = useMapStore((s) => s.openProject);
  const deleteProject = useMapStore((s) => s.deleteProject);
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const MAP_LABEL = 'MapTiler Outdoor';

  const handleDelete = () => {
    deleteProject(project.id);
    setConfirmDelete(false);
  };

  const elementCount = project.elements.length;

  return (
    <>
      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'transform 0.15s, box-shadow 0.15s',
          position: 'relative',
        }}
        onClick={() => openProject(project.id)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
      >
        {/* Thumbnail */}
        <div
          style={{
            height: 130,
            background: project.backgroundColor === 'transparent'
              ? 'repeating-conic-gradient(#e8e8e8 0% 25%, transparent 0% 50%) 50% / 12px 12px'
              : project.backgroundColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Mini preview of elements */}
          {elementCount > 0 ? (
            <div style={{ opacity: 0.6 }}>
              <svg width="100%" height="100%" viewBox="0 0 200 130" style={{ position: 'absolute', inset: 0 }}>
                {project.elements.slice(0, 20).map((el) => {
                  if (el.points.length === 0) return null;
                  const pts = el.points.map((p) => ({
                    x: ((p.lng + 180) / 360) * 200,
                    y: ((90 - p.lat) / 180) * 130,
                  }));
                  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
                  return (
                    <path
                      key={el.id}
                      d={d}
                      fill="none"
                      stroke={el.style.color}
                      strokeWidth={Math.max(1, el.style.width * 0.5)}
                      opacity={0.6}
                    />
                  );
                })}
              </svg>
            </div>
          ) : (
            <div style={{ fontSize: 32, opacity: 0.3 }}>🗺️</div>
          )}

          {/* Map type badge */}
          <span
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              fontSize: 10,
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            {MAP_LABEL}
          </span>

          {/* Element count */}
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              fontSize: 10,
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            {elementCount} 元素
          </span>
        </div>

        {/* Info */}
        <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>{project.name}</div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
              {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
            </div>
          </div>

          {/* Action menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 18,
                color: '#888',
                padding: '4px 8px',
                borderRadius: 4,
              }}
            >
              ⋯
            </button>
            {showMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  background: '#fff',
                  borderRadius: 6,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  zIndex: 10,
                  minWidth: 100,
                  overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { setShowEdit(true); setShowMenu(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 14px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#333',
                    textAlign: 'left',
                  }}
                >
                  编辑
                </button>
                <button
                  onClick={() => { setConfirmDelete(true); setShowMenu(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 14px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#e53935',
                    textAlign: 'left',
                  }}
                >
                  删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <EditProjectDialog
          project={project}
          onClose={() => setShowEdit(false)}
          onSave={(name, bgColor) => {
            useMapStore.getState().updateProject(project.id, { name, backgroundColor: bgColor });
            onEdit();
          }}
        />
      )}

      {confirmDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={(e) => e.target === e.currentTarget && setConfirmDelete(false)}
        >
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            width: 320,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              确认删除
            </div>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
              确定要删除「{project.name}」吗？此操作不可撤销。
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 6,
                  border: '1px solid #ddd',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 20px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#e53935',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
