import React, { useState } from 'react';
import { Plus, X, Trash2, Save, Link } from 'lucide-react';
import { useStore } from '../store';
import { AppNote } from '../types';
import { format } from 'date-fns';

interface FormData {
  title: string;
  content: string;
}

export default function NotesView() {
  const { notes, events, projects, addNote, updateNote, deleteNote } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>({ title: '', content: '' });
  const [selected, setSelected] = useState<AppNote | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAdd = () => {
    if (!form.title) return;
    addNote(form);
    setForm({ title: '', content: '' });
    setShowForm(false);
  };

  const openNote = (note: AppNote) => {
    setSelected(note);
    setEditContent(note.content);
  };

  const saveNote = () => {
    if (!selected) return;
    updateNote(selected.id, { content: editContent });
    setSelected({ ...selected, content: editContent });
  };

  const linkedEvent = selected?.linkedEventId
    ? events.find((e) => e.id === selected.linkedEventId)
    : null;
  const linkedProject = selected?.linkedProjectId
    ? projects.find((p) => p.id === selected.linkedProjectId)
    : null;

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Notes</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={14} /> New Note
        </button>
      </div>

      {notes.length === 0 && (
        <div className="empty-state"><p>No notes yet. Notes saved from workspaces will appear here.</p></div>
      )}

      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note.id} className="note-card" onClick={() => openNote(note)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
              <div className="note-card-title">{note.title}</div>
              <button
                className="btn btn-ghost btn-icon"
                style={{ padding: 2 }}
                onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
              >
                <Trash2 size={12} style={{ color: 'var(--red)' }} />
              </button>
            </div>
            <div className="note-card-content">{note.content || 'Empty note...'}</div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                {format(new Date(note.updatedAt), 'MMM d, yyyy')}
              </span>
              {(note.linkedEventId || note.linkedProjectId) && (
                <span style={{ fontSize: 10, color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Link size={10} /> Linked
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Note editor modal */}
      {selected && (
        <div className="workspace-overlay" onClick={() => { saveNote(); setSelected(null); }}>
          <div className="workspace-modal" onClick={(e) => e.stopPropagation()}>
            <div className="workspace-header">
              <div>
                <input
                  style={{ background: 'transparent', border: 'none', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text)', outline: 'none', width: 400 }}
                  value={selected.title}
                  onChange={(e) => {
                    setSelected({ ...selected, title: e.target.value });
                    updateNote(selected.id, { title: e.target.value });
                  }}
                />
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                  {linkedProject && <span style={{ color: 'var(--cyan)' }}>↗ {linkedProject.title}</span>}
                  {linkedEvent && <span style={{ color: 'var(--purple)' }}>↗ {linkedEvent.title}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={saveNote}>
                  <Save size={13} /> Save
                </button>
                <button className="btn btn-ghost btn-icon" onClick={() => { saveNote(); setSelected(null); }}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="workspace-area">
              <textarea
                className="notebook-lines"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write your note here..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Add note modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">New Note</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Note title" />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea className="form-input" rows={5} value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Start writing..." />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd}>Save Note</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
