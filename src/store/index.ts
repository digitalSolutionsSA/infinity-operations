import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import {
  CalendarEvent,
  Project,
  InvoiceReminder,
  Bill,
  PricelistItem,
  AppNote,
  ProjectNote,
  Task,
  ActiveView,
} from '../types';

interface AppState {
  activeView: ActiveView;
  events: CalendarEvent[];
  projects: Project[];
  invoiceReminders: InvoiceReminder[];
  bills: Bill[];
  pricelistItems: PricelistItem[];
  notes: AppNote[];

  setActiveView: (view: ActiveView) => void;

  // Events
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // Projects
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'notes'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Project Notes
  addProjectNote: (projectId: string, note: Omit<ProjectNote, 'id' | 'projectId' | 'createdAt' | 'tasks'>) => void;
  updateProjectNote: (projectId: string, noteId: string, data: Partial<ProjectNote>) => void;
  deleteProjectNote: (projectId: string, noteId: string) => void;

  // Tasks under notes
  addTaskToNote: (projectId: string, noteId: string, title: string) => void;
  toggleTask: (projectId: string, noteId: string, taskId: string) => void;
  deleteTask: (projectId: string, noteId: string, taskId: string) => void;
  updateTaskWorkspace: (projectId: string, noteId: string, taskId: string, content: string) => void;

  // Invoices
  addInvoiceReminder: (inv: Omit<InvoiceReminder, 'id'>) => void;
  updateInvoiceReminder: (id: string, inv: Partial<InvoiceReminder>) => void;
  deleteInvoiceReminder: (id: string) => void;

  // Bills
  addBill: (bill: Omit<Bill, 'id'>) => void;
  updateBill: (id: string, bill: Partial<Bill>) => void;
  deleteBill: (id: string) => void;

  // Pricelist
  addPricelistItem: (item: Omit<PricelistItem, 'id'>) => void;
  updatePricelistItem: (id: string, item: Partial<PricelistItem>) => void;
  deletePricelistItem: (id: string) => void;

  // Notes
  addNote: (note: Omit<AppNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<AppNote>) => void;
  deleteNote: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      activeView: 'calendar',
      events: [],
      projects: [],
      invoiceReminders: [],
      bills: [],
      pricelistItems: [],
      notes: [],

      setActiveView: (view) => set({ activeView: view }),

      addEvent: (event) =>
        set((s) => ({ events: [...s.events, { ...event, id: uuid() }] })),
      updateEvent: (id, event) =>
        set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...event } : e)) })),
      deleteEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      addProject: (project) =>
        set((s) => ({
          projects: [
            ...s.projects,
            { ...project, id: uuid(), createdAt: new Date().toISOString(), notes: [] },
          ],
        })),
      updateProject: (id, project) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...project } : p)),
        })),
      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      addProjectNote: (projectId, note) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  notes: [
                    ...p.notes,
                    { ...note, id: uuid(), projectId, tasks: [], createdAt: new Date().toISOString() },
                  ],
                }
              : p
          ),
        })),
      updateProjectNote: (projectId, noteId, data) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, notes: p.notes.map((n) => (n.id === noteId ? { ...n, ...data } : n)) }
              : p
          ),
        })),
      deleteProjectNote: (projectId, noteId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, notes: p.notes.filter((n) => n.id !== noteId) } : p
          ),
        })),

      addTaskToNote: (projectId, noteId, title) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  notes: p.notes.map((n) =>
                    n.id === noteId
                      ? { ...n, tasks: [...n.tasks, { id: uuid(), title, completed: false }] }
                      : n
                  ),
                }
              : p
          ),
        })),
      toggleTask: (projectId, noteId, taskId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  notes: p.notes.map((n) =>
                    n.id === noteId
                      ? {
                          ...n,
                          tasks: n.tasks.map((t) =>
                            t.id === taskId ? { ...t, completed: !t.completed } : t
                          ),
                        }
                      : n
                  ),
                }
              : p
          ),
        })),
      deleteTask: (projectId, noteId, taskId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  notes: p.notes.map((n) =>
                    n.id === noteId
                      ? { ...n, tasks: n.tasks.filter((t) => t.id !== taskId) }
                      : n
                  ),
                }
              : p
          ),
        })),
      updateTaskWorkspace: (projectId, noteId, taskId, content) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  notes: p.notes.map((n) =>
                    n.id === noteId
                      ? {
                          ...n,
                          tasks: n.tasks.map((t) =>
                            t.id === taskId ? { ...t, workspaceContent: content } : t
                          ),
                        }
                      : n
                  ),
                }
              : p
          ),
        })),

      addInvoiceReminder: (inv) =>
        set((s) => ({ invoiceReminders: [...s.invoiceReminders, { ...inv, id: uuid() }] })),
      updateInvoiceReminder: (id, inv) =>
        set((s) => ({
          invoiceReminders: s.invoiceReminders.map((i) => (i.id === id ? { ...i, ...inv } : i)),
        })),
      deleteInvoiceReminder: (id) =>
        set((s) => ({ invoiceReminders: s.invoiceReminders.filter((i) => i.id !== id) })),

      addBill: (bill) =>
        set((s) => ({ bills: [...s.bills, { ...bill, id: uuid() }] })),
      updateBill: (id, bill) =>
        set((s) => ({ bills: s.bills.map((b) => (b.id === id ? { ...b, ...bill } : b)) })),
      deleteBill: (id) =>
        set((s) => ({ bills: s.bills.filter((b) => b.id !== id) })),

      addPricelistItem: (item) =>
        set((s) => ({ pricelistItems: [...s.pricelistItems, { ...item, id: uuid() }] })),
      updatePricelistItem: (id, item) =>
        set((s) => ({
          pricelistItems: s.pricelistItems.map((i) => (i.id === id ? { ...i, ...item } : i)),
        })),
      deletePricelistItem: (id) =>
        set((s) => ({ pricelistItems: s.pricelistItems.filter((i) => i.id !== id) })),

      addNote: (note) =>
        set((s) => ({
          notes: [
            ...s.notes,
            {
              ...note,
              id: uuid(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateNote: (id, note) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...note, updatedAt: new Date().toISOString() } : n
          ),
        })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
    }),
    { name: 'infinity-ops-storage' }
  )
);
