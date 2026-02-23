import React from 'react';
import {
  Calendar,
  FolderKanban,
  FileText,
  Receipt,
  ShoppingBag,
  StickyNote,
  Infinity,
} from 'lucide-react';
import { useStore } from '../store';
import { ActiveView } from '../types';

const navItems: { view: ActiveView; label: string; icon: React.ReactNode }[] = [
  { view: 'calendar', label: 'Calendar', icon: <Calendar size={16} /> },
  { view: 'projects', label: 'Projects', icon: <FolderKanban size={16} /> },
  { view: 'invoices', label: 'Invoice Reminders', icon: <Receipt size={16} /> },
  { view: 'bills', label: 'Bills', icon: <FileText size={16} /> },
  { view: 'pricelist', label: 'Price List', icon: <ShoppingBag size={16} /> },
  { view: 'notes', label: 'Notes', icon: <StickyNote size={16} /> },
];

export default function Sidebar() {
  const { activeView, setActiveView } = useStore();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: '#000',
          border: '1px solid #222',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Infinity size={20} style={{ color: '#00E5FF' }} />
        </div>
        <span className="sidebar-logo-text">Infinity Ops</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.view}
            className={`nav-item ${activeView === item.view ? 'active' : ''}`}
            onClick={() => setActiveView(item.view)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
