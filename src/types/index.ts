export type CategoryColor =
  | 'cyan'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'blue';

export type ProjectCategory =
  | 'web-development'
  | 'app-development'
  | 'software'
  | 'brand-design'
  | 'social-media-marketing';

export type ProjectStatus = 'not-started' | 'in-progress' | 'overdue';

export type EventCategory = 'task' | 'reminder' | 'event' | 'invoice';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  time?: string;
  endTime?: string;
  category: EventCategory;
  description?: string;
  recurring?: 'monthly';
  customerName?: string;
  amount?: number;
  noteId?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  noteId?: string;
  workspaceContent?: string;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  title: string;
  content: string;
  tasks: Task[];
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
  description?: string;
  steps: string[];
  notes: ProjectNote[];
  createdAt: string;
}

export interface InvoiceReminder {
  id: string;
  customerName: string;
  amount: number;
  dayOfMonth: number;
  description?: string;
  active: boolean;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  category: ProjectCategory;
  description?: string;
  active: boolean;
}

export interface PricelistItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: ProjectCategory;
  description?: string;
}

export interface AppNote {
  id: string;
  title: string;
  content: string;
  linkedEventId?: string;
  linkedProjectId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActiveView =
  | 'calendar'
  | 'projects'
  | 'invoices'
  | 'bills'
  | 'pricelist'
  | 'notes';
