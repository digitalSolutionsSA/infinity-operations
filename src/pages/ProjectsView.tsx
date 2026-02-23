import React, { useState } from 'react';
import {
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Check,
  Trash2,
  BookOpen,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../store';
import { Project, ProjectCategory, ProjectStatus, ProjectNote, Task } from '../types';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  daysUntil,
} from '../utils/constants';
import WorkspaceModal from '../components/WorkspaceModal';
import { format } from 'date-fns';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProjectCategory[];
const STATUSES = Object.keys(STATUS_LABELS) as ProjectStatus[];

interface ProjectFormData {
  title: string;
  category: ProjectCategory;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
  description: string;
}

const defaultForm: ProjectFormData = {
  title: '',
  category: 'web-development',
  status: 'not-started',
  startDate: '',
  dueDate: '',
  description: '',
};

function CountdownPill({ dueDate, status }: { dueDate: string; status: ProjectStatus }) {
  const days = daysUntil(dueDate);
  if (days > 0) {
    return (
      <span className="countdown-pill" style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--cyan)' }}>
        <Clock size={11} /> {days}d left
      </span>
    );
  } else if (days === 0) {
    return (
      <span className="countdown-pill" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--amber)' }}>
        <Clock size={11} /> Due today
      </span>
    );
  } else {
    return (
      <span className="countdown-pill" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)' }}>
        <AlertTriangle size={11} /> {Math.abs(days)}d overdue
      </span>
    );
  }
}

function TaskItem({
  task,
  projectId,
  noteId,
}: {
  task: Task;
  projectId: string;
  noteId: string;
}) {
  const { toggleTask, deleteTask } = useStore();
  const [showWorkspace, setShowWorkspace] = useState(false);

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 0',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <button
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            border: `2px solid ${task.completed ? 'var(--green)' : 'var(--border2)'}`,
            background: task.completed ? 'var(--green)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
          }}
          onClick={() => toggleTask(projectId, noteId, task.id)}
        >
          {task.completed && <Check size={10} color="#000" strokeWidth={3} />}
        </button>
        <span
          style={{
            flex: 1,
            fontSize: 13,
            color: task.completed ? 'var(--text3)' : 'var(--text)',
            textDecoration: task.completed ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </span>
        <button
          className="btn btn-ghost btn-icon"
          title="Open Notebook"
          onClick={() => setShowWorkspace(true)}
        >
          <BookOpen size={13} />
        </button>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => deleteTask(projectId, noteId, task.id)}
        >
          <Trash2 size={13} style={{ color: 'var(--red)' }} />
        </button>
      </div>
      {showWorkspace && (
        <WorkspaceModal
          projectId={projectId}
          noteId={noteId}
          task={task}
          onClose={() => setShowWorkspace(false)}
        />
      )}
    </>
  );
}

function NoteItem({
  note,
  projectId,
}: {
  note: ProjectNote;
  projectId: string;
}) {
  const { addTaskToNote, deleteProjectNote } = useStore();
  const [expanded, setExpanded] = useState(true);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    addTaskToNote(projectId, note.id, newTask.trim());
    setNewTask('');
  };

  const completedCount = note.tasks.filter((t) => t.completed).length;

  return (
    <div
      style={{
        background: 'var(--bg4)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          cursor: 'pointer',
          background: 'var(--bg5)',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{note.title}</span>
        {note.tasks.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>
            {completedCount}/{note.tasks.length}
          </span>
        )}
        <button
          className="btn btn-ghost btn-icon"
          onClick={(e) => {
            e.stopPropagation();
            deleteProjectNote(projectId, note.id);
          }}
        >
          <Trash2 size={12} style={{ color: 'var(--red)' }} />
        </button>
      </div>
      {expanded && (
        <div style={{ padding: '8px 12px 12px' }}>
          {note.content && (
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8, lineHeight: 1.6 }}>
              {note.content}
            </p>
          )}
          <div>
            {note.tasks.map((task) => (
              <TaskItem key={task.id} task={task} projectId={projectId} noteId={note.id} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <input
              className="form-input"
              style={{ flex: 1, padding: '6px 10px', fontSize: 12 }}
              placeholder="Add a task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }}
            />
            <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: 12 }} onClick={handleAddTask}>
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  const { addProjectNote, updateProject } = useStore();
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const days = daysUntil(project.dueDate);
  const catColor = CATEGORY_COLORS[project.category];

  const handleAddNote = () => {
    if (!newNoteTitle.trim()) return;
    addProjectNote(project.id, { title: newNoteTitle, content: newNoteContent });
    setNewNoteTitle('');
    setNewNoteContent('');
    setShowNoteForm(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 680, maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="dot" style={{ width: 10, height: 10, background: catColor }} />
            <span className="modal-title">{project.title}</span>
            <span
              className="badge"
              style={{
                background: STATUS_COLORS[project.status] + '22',
                color: STATUS_COLORS[project.status],
              }}
            >
              {STATUS_LABELS[project.status]}
            </span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body" style={{ maxHeight: 'calc(90vh - 80px)', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <div className="form-label" style={{ marginBottom: 4 }}>Category</div>
              <span className="badge" style={{ background: catColor + '22', color: catColor }}>
                {CATEGORY_LABELS[project.category]}
              </span>
            </div>
            <div>
              <div className="form-label" style={{ marginBottom: 4 }}>Start Date</div>
              <div style={{ fontSize: 13 }}>{format(new Date(project.startDate + 'T00:00:00'), 'MMM d, yyyy')}</div>
            </div>
            <div>
              <div className="form-label" style={{ marginBottom: 4 }}>Due Date</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13 }}>{format(new Date(project.dueDate + 'T00:00:00'), 'MMM d, yyyy')}</span>
                <CountdownPill dueDate={project.dueDate} status={project.status} />
              </div>
            </div>
          </div>
          <div>
            <div className="form-label" style={{ marginBottom: 4 }}>Status</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className="badge"
                  style={{
                    background: project.status === s ? STATUS_COLORS[s] + '33' : 'var(--bg4)',
                    color: project.status === s ? STATUS_COLORS[s] : 'var(--text2)',
                    border: `1px solid ${project.status === s ? STATUS_COLORS[s] : 'var(--border)'}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => updateProject(project.id, { status: s })}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          {project.description && (
            <div>
              <div className="form-label" style={{ marginBottom: 4 }}>Description</div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{project.description}</p>
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="form-label">Notes & Tasks</div>
              <button className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => setShowNoteForm(!showNoteForm)}>
                <Plus size={12} /> Add Note
              </button>
            </div>
            {showNoteForm && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, padding: 12, background: 'var(--bg4)', borderRadius: 8 }}>
                <input
                  className="form-input"
                  style={{ padding: '7px 10px' }}
                  placeholder="Note title..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                />
                <textarea
                  className="form-input"
                  style={{ padding: '7px 10px' }}
                  rows={2}
                  placeholder="Note content (optional)..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                />
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => setShowNoteForm(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={handleAddNote}>Save Note</button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {project.notes.length === 0 && (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <p>No notes yet. Add a note to start tracking tasks.</p>
                </div>
              )}
              {project.notes.map((note) => (
                <NoteItem key={note.id} note={note} projectId={project.id} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsView() {
  const { projects, addProject, deleteProject } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProjectFormData>(defaultForm);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  const handleSubmit = () => {
    if (!form.title || !form.startDate || !form.dueDate) return;
    addProject({ ...form, steps: [] });
    setForm(defaultForm);
    setShowForm(false);
  };

  // Keep selected project in sync with store
  const currentSelected = selectedProject
    ? projects.find((p) => p.id === selectedProject.id) || null
    : null;

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Projects</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 12, color: filter === 'all' ? 'var(--cyan)' : 'var(--text2)' }}
              onClick={() => setFilter('all')}
            >All</button>
            {STATUSES.map((s) => (
              <button
                key={s}
                className="btn btn-ghost"
                style={{ fontSize: 12, color: filter === s ? STATUS_COLORS[s] : 'var(--text2)' }}
                onClick={() => setFilter(s)}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={14} /> New Project
          </button>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 15a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z" />
          </svg>
          <p>No projects yet. Create your first project.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map((project) => {
          const catColor = CATEGORY_COLORS[project.category];
          const totalTasks = project.notes.reduce((acc, n) => acc + n.tasks.length, 0);
          const completedTasks = project.notes.reduce((acc, n) => acc + n.tasks.filter((t) => t.completed).length, 0);
          const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return (
            <div
              key={project.id}
              className="project-card"
              style={{ '--cat-color': catColor } as React.CSSProperties}
              onClick={() => setSelectedProject(project)}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: catColor,
                  borderRadius: '3px 0 0 3px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                    {project.title}
                  </h3>
                  <span className="badge" style={{ background: catColor + '22', color: catColor, fontSize: 10 }}>
                    {CATEGORY_LABELS[project.category]}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span
                    className="badge"
                    style={{
                      background: STATUS_COLORS[project.status] + '22',
                      color: STATUS_COLORS[project.status],
                      fontSize: 10,
                    }}
                  >
                    {STATUS_LABELS[project.status]}
                  </span>
                  <CountdownPill dueDate={project.dueDate} status={project.status} />
                </div>
              </div>
              {project.description && (
                <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description}
                </p>
              )}
              {totalTasks > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
                    <span>Progress</span>
                    <span>{completedTasks}/{totalTasks} tasks</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg5)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg, ${catColor}, var(--green))`, borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {format(new Date(project.startDate + 'T00:00:00'), 'MMM d')} → {format(new Date(project.dueDate + 'T00:00:00'), 'MMM d, yyyy')}
                </span>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                >
                  <Trash2 size={12} style={{ color: 'var(--red)' }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Project Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">New Project</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input className="form-input" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="My awesome project" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ProjectCategory })}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input className="form-input" type="date" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input className="form-input" type="date" value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Project overview..." />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit}>Create Project</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {currentSelected && (
        <ProjectDetail project={currentSelected} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
