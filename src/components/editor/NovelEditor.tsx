import { useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import type { SaveStatus } from '../../types/novel';

export interface NovelEditorHandle {
  getText: () => string;
  getTitle: () => string;
}

interface NovelEditorProps {
  content: string;
  chapterTitle: string;
  saveStatus: SaveStatus;
  onUpdate: (json: string, text: string, wordCount: number) => void;
  onSave: () => void;
}

export const NovelEditor = forwardRef<NovelEditorHandle, NovelEditorProps>(function NovelEditor({ content, chapterTitle, saveStatus, onUpdate, onSave }, ref) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Placeholder.configure({
        placeholder: '开始写作...',
      }),
      CharacterCount,
    ],
    content: content ? JSON.parse(content) : '',
    onUpdate: ({ editor: ed }) => {
      if (skipNextUpdate.current) {
        skipNextUpdate.current = false;
        return;
      }
      const json = JSON.stringify(ed.getJSON());
      const text = ed.getText();
      const wc = text.replace(/\s/g, '').length;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdate(json, text, wc);
      }, 1000);
    },
    editorProps: {
      attributes: {
        class: 'novel-editor prose prose-lg max-w-none focus:outline-none min-h-[60vh] px-8 py-4',
      },
    },
    autofocus: 'end',
  });

  // Save on Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const json = JSON.stringify(editor?.getJSON() || {});
        const text = editor?.getText() || '';
        const wc = text.replace(/\s/g, '').length;
        onUpdate(json, text, wc);
        onSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, onUpdate, onSave]);

  // Update content when chapter changes
  useEffect(() => {
    if (!editor || !content) return;
    const currentJson = JSON.stringify(editor.getJSON());
    const newJson = content;
    if (currentJson !== newJson && newJson) {
      skipNextUpdate.current = true;
      editor.commands.setContent(JSON.parse(newJson));
    }
  }, [content, chapterTitle, editor]);

  useImperativeHandle(ref, () => ({
    getText: () => editor?.getText() || '',
    getTitle: () => chapterTitle,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-shrink-0 bg-white">
        <span className="text-sm font-medium text-gray-700">{chapterTitle || '未命名章节'}</span>
        <span className="text-xs text-gray-400">|</span>
        <span className={`text-xs ${
          saveStatus === 'saved' ? 'text-green-600' :
          saveStatus === 'saving' ? 'text-gray-400' :
          'text-orange-500'
        }`}>
          {saveStatus === 'saved' ? '✓ 已保存' :
           saveStatus === 'saving' ? '○ 保存中...' :
           '⚠ 未保存'}
        </span>
        <span className="text-xs text-gray-400 ml-auto">
          {editor?.storage.characterCount?.characters?.()?.toLocaleString() || 0} 字
        </span>
      </div>
      <div className="flex-1 overflow-y-auto bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});
