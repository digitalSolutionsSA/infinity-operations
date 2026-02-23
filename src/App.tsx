import React from 'react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import CalendarView from './pages/CalendarView';
import ProjectsView from './pages/ProjectsView';
import InvoicesView from './pages/InvoicesView';
import BillsView from './pages/BillsView';
import PricelistView from './pages/PricelistView';
import NotesView from './pages/NotesView';

const VIEW_TITLES: Record<string, string> = {
  calendar: 'Calendar',
  projects: 'Projects',
  invoices: 'Invoice Reminders',
  bills: 'Recurring Bills',
  pricelist: 'Price List',
  notes: 'Notes',
};

export default function App() {
  const { activeView } = useStore();

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <h1 className="topbar-title">{VIEW_TITLES[activeView]}</h1>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="content">
          {activeView === 'calendar' && <CalendarView />}
          {activeView === 'projects' && <ProjectsView />}
          {activeView === 'invoices' && <InvoicesView />}
          {activeView === 'bills' && <BillsView />}
          {activeView === 'pricelist' && <PricelistView />}
          {activeView === 'notes' && <NotesView />}
        </div>
      </main>
    </div>
  );
}
