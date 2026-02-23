import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useStore } from '../store';
import { CalendarEvent, EventCategory } from '../types';
import { EVENT_CATEGORY_COLORS, EVENT_CATEGORY_LABELS } from '../utils/constants';
import { v4 as uuid } from 'uuid';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthDays(date: Date) {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  return eachDayOfInterval({ start, end });
}

function generateRecurringEvents(events: CalendarEvent[], year: number, month: number): CalendarEvent[] {
  const result: CalendarEvent[] = [];
  for (const e of events) {
    if (e.recurring === 'monthly') {
      const originalDate = new Date(e.date);
      const day = originalDate.getDate();
      const newDate = new Date(year, month, day);
      if (!isNaN(newDate.getTime())) {
        result.push({ ...e, id: e.id + `-${year}-${month}`, date: format(newDate, 'yyyy-MM-dd') });
      }
    }
  }
  return result;
}

interface EventFormData {
  title: string;
  date: string;
  time: string;
  endTime: string;
  category: EventCategory;
  description: string;
  recurring: '' | 'monthly';
  customerName: string;
  amount: string;
}

const defaultForm: EventFormData = {
  title: '',
  date: '',
  time: '',
  endTime: '',
  category: 'event',
  description: '',
  recurring: '',
  customerName: '',
  amount: '',
};

export default function CalendarView() {
  const { events, addEvent, deleteEvent } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [form, setForm] = useState<EventFormData>(defaultForm);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const days = getMonthDays(currentDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const recurringEvents = generateRecurringEvents(
    events.filter((e) => e.recurring === 'monthly'),
    year,
    month
  );

  const allEvents = [
    ...events.filter((e) => !e.recurring),
    ...recurringEvents,
  ];

  const getEventsForDay = (day: Date) =>
    allEvents.filter((e) => isSameDay(new Date(e.date + 'T00:00:00'), day));

  const handleCellClick = (day: Date) => {
    setSelectedDate(day);
    setForm({ ...defaultForm, date: format(day, 'yyyy-MM-dd') });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.title || !form.date) return;
    addEvent({
      title: form.title,
      date: form.date,
      time: form.time || undefined,
      endTime: form.endTime || undefined,
      category: form.category,
      description: form.description || undefined,
      recurring: form.recurring === 'monthly' ? 'monthly' : undefined,
      customerName: form.customerName || undefined,
      amount: form.amount ? parseFloat(form.amount) : undefined,
    });
    setShowForm(false);
    setForm(defaultForm);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft size={16} />
          </button>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight size={16} />
          </button>
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {(Object.entries(EVENT_CATEGORY_COLORS) as [EventCategory, string][]).map(([cat, color]) => (
            <span key={cat} className="badge" style={{ background: color + '22', color }}>
              <span className="dot" style={{ background: color }} />
              {EVENT_CATEGORY_LABELS[cat]}
            </span>
          ))}
          <button className="btn btn-primary" onClick={() => { setForm(defaultForm); setShowForm(true); }}>
            <Plus size={14} /> Add Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid" style={{ flex: 1 }}>
        {DAYS.map((d) => (
          <div key={d} className="cal-header-cell">{d}</div>
        ))}
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          return (
            <div
              key={day.toString()}
              className={`cal-cell ${!isSameMonth(day, currentDate) ? 'other-month' : ''} ${isToday(day) ? 'today' : ''}`}
              onClick={() => handleCellClick(day)}
            >
              <div className="cal-day-num">{format(day, 'd')}</div>
              {dayEvents.slice(0, 4).map((ev) => (
                <div
                  key={ev.id}
                  className="cal-event-chip"
                  style={{
                    background: EVENT_CATEGORY_COLORS[ev.category] + '33',
                    color: EVENT_CATEGORY_COLORS[ev.category],
                    borderLeft: `2px solid ${EVENT_CATEGORY_COLORS[ev.category]}`,
                  }}
                  onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                >
                  {ev.customerName ? `${ev.customerName}: ${ev.title}` : ev.title}
                  {ev.amount ? ` · R${ev.amount}` : ''}
                </div>
              ))}
              {dayEvents.length > 4 && (
                <div style={{ fontSize: 10, color: 'var(--text3)', paddingLeft: 4 }}>
                  +{dayEvents.length - 4} more
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Event Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">New Event</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input className="form-input" type="date" value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as EventCategory })}>
                    {Object.entries(EVENT_CATEGORY_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input className="form-input" type="time" value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input className="form-input" type="time" value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Recurring</label>
                <select className="form-input" value={form.recurring}
                  onChange={(e) => setForm({ ...form, recurring: e.target.value as '' | 'monthly' })}>
                  <option value="">One-time</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              {(form.category === 'invoice' || form.recurring === 'monthly') && (
                <>
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input className="form-input" value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Customer name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (R)</label>
                    <input className="form-input" type="number" value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                  </div>
                </>
              )}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Notes..." />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit}>Save Event</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', align: 'center', gap: 8, alignItems: 'center' }}>
                <span className="dot" style={{ background: EVENT_CATEGORY_COLORS[selectedEvent.category] }} />
                <span className="modal-title">{selectedEvent.title}</span>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedEvent(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div className="form-label" style={{ marginBottom: 4 }}>Date</div>
                  <div>{format(new Date(selectedEvent.date + 'T00:00:00'), 'PPP')}</div>
                </div>
                <div>
                  <div className="form-label" style={{ marginBottom: 4 }}>Category</div>
                  <span className="badge" style={{
                    background: EVENT_CATEGORY_COLORS[selectedEvent.category] + '22',
                    color: EVENT_CATEGORY_COLORS[selectedEvent.category],
                  }}>
                    {EVENT_CATEGORY_LABELS[selectedEvent.category]}
                  </span>
                </div>
                {selectedEvent.time && (
                  <div>
                    <div className="form-label" style={{ marginBottom: 4 }}>Time</div>
                    <div>{selectedEvent.time}{selectedEvent.endTime ? ` – ${selectedEvent.endTime}` : ''}</div>
                  </div>
                )}
                {selectedEvent.customerName && (
                  <div>
                    <div className="form-label" style={{ marginBottom: 4 }}>Customer</div>
                    <div>{selectedEvent.customerName}</div>
                  </div>
                )}
                {selectedEvent.amount && (
                  <div>
                    <div className="form-label" style={{ marginBottom: 4 }}>Amount</div>
                    <div style={{ color: 'var(--green)', fontWeight: 600 }}>R{selectedEvent.amount}</div>
                  </div>
                )}
                {selectedEvent.recurring && (
                  <div>
                    <div className="form-label" style={{ marginBottom: 4 }}>Recurring</div>
                    <div style={{ textTransform: 'capitalize' }}>{selectedEvent.recurring}</div>
                  </div>
                )}
              </div>
              {selectedEvent.description && (
                <div>
                  <div className="form-label" style={{ marginBottom: 4 }}>Description</div>
                  <div style={{ color: 'var(--text2)' }}>{selectedEvent.description}</div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-danger" onClick={() => {
                  const baseId = selectedEvent.id.split('-').slice(0, 5).join('-');
                  deleteEvent(baseId);
                  setSelectedEvent(null);
                }}>
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
