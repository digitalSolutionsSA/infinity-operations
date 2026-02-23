import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useStore } from '../store';
import { Task } from '../types';

interface WorkspaceModalProps {
  projectId: string;
  noteId: string;
  task: Task;
  onClose: () => void;
}

export default function WorkspaceModal({ projectId, noteId, task, onClose }: WorkspaceModalProps) {
  const { updateTaskWorkspace, addNote, notes } = useStore();
  const [content, setContent] = useState(task.workspaceContent || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateTaskWorkspace(projectId, noteId, task.id, content);
    // Also save to global notes
    const existingNote = notes.find((n) => n.title === `Task: ${task.title}`);
    if (existingNote) {
      useStore.getState().updateNote(existingNote.id, { content, linkedProjectId: projectId });
    } else {
      addNote({ title: `Task: ${task.title}`, content, linkedProjectId: projectId });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [content]);

  return (
    <div className="workspace-overlay" onClick={onClose}>
      <div className="workspace-modal" onClick={(e) => e.stopPropagation()}>
        <div className="workspace-header">
          <div>
            <span className="workspace-title">📝 {task.title}</span>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
              Workspace · Write notes with your Apple Pencil or keyboard
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary"
              style={{ fontSize: 12 }}
              onClick={handleSave}
            >
              <Save size={13} />
              {saved ? 'Saved!' : 'Save to Notes'}
            </button>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="workspace-area">
          <textarea
            className="notebook-lines"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing... (⌘S to save)"
            spellCheck
          />
        </div>
      </div>
    </div>
  );
}
