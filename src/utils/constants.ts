import { ProjectCategory, ProjectStatus, EventCategory } from '../types';

export const CATEGORY_COLORS: Record<ProjectCategory, string> = {
  'web-development': '#00E5FF',
  'app-development': '#FF6B35',
  'software': '#A855F7',
  'brand-design': '#F59E0B',
  'social-media-marketing': '#EC4899',
};

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  'web-development': 'Web Development',
  'app-development': 'App Development',
  'software': 'Software',
  'brand-design': 'Brand & Design',
  'social-media-marketing': 'Social Media Marketing',
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  'not-started': '#6B7280',
  'in-progress': '#F59E0B',
  'overdue': '#EF4444',
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  'overdue': 'Overdue',
};

export const EVENT_CATEGORY_COLORS: Record<EventCategory, string> = {
  task: '#EF4444',
  reminder: '#8B5CF6',
  event: '#00E5FF',
  invoice: '#10B981',
};

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  task: 'Task',
  reminder: 'Reminder',
  event: 'Event',
  invoice: 'Invoice',
};

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
}
