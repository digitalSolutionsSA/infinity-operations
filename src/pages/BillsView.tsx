import React, { useState } from 'react';
import { Plus, X, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useStore } from '../store';
import { Bill, ProjectCategory } from '../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/constants';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProjectCategory[];

interface FormData {
  name: string;
  amount: string;
  dayOfMonth: string;
  category: ProjectCategory;
  description: string;
}

const defaultForm: FormData = {
  name: '',
  amount: '',
  dayOfMonth: '1',
  category: 'software',
  description: '',
};

export default function BillsView() {
  const { bills, addBill, updateBill, deleteBill } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [editing, setEditing] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.name || !form.amount) return;
    const data: Omit<Bill, 'id'> = {
      name: form.name,
      amount: parseFloat(form.amount),
      dayOfMonth: parseInt(form.dayOfMonth) || 1,
      category: form.category,
      description: form.description,
      active: true,
    };
    if (editing) {
      updateBill(editing, data);
      setEditing(null);
    } else {
      addBill(data);
    }
    setForm(defaultForm);
    setShowForm(false);
  };

  const startEdit = (bill: Bill) => {
    setForm({
      name: bill.name,
      amount: bill.amount.toString(),
      dayOfMonth: bill.dayOfMonth.toString(),
      category: bill.category,
      description: bill.description || '',
    });
    setEditing(bill.id);
    setShowForm(true);
  };

  const totalMonthly = bills.filter((b) => b.active).reduce((s, b) => s + b.amount, 0);

  const grouped: Record<ProjectCategory, Bill[]> = {} as any;
  for (const cat of CATEGORIES) grouped[cat] = bills.filter((b) => b.category === cat);

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Recurring Bills</h2>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
            Total active monthly: <span style={{ color: 'var(--red)', fontWeight: 600 }}>R{totalMonthly.toLocaleString()}/mo</span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(defaultForm); setEditing(null); setShowForm(true); }}>
          <Plus size={14} /> New Bill
        </button>
      </div>

      {bills.length === 0 && (
        <div className="empty-state"><p>No recurring bills yet.</p></div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {CATEGORIES.filter((cat) => grouped[cat].length > 0).map((cat) => (
          <div key={cat}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span className="dot" style={{ background: CATEGORY_COLORS[cat] }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: CATEGORY_COLORS[cat] }}>
                {CATEGORY_LABELS[cat]}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                · R{grouped[cat].filter(b => b.active).reduce((s, b) => s + b.amount, 0).toLocaleString()}/mo
              </span>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Day</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[cat].map((bill) => (
                    <tr key={bill.id} style={{ cursor: 'pointer', opacity: bill.active ? 1 : 0.5 }} onClick={() => startEdit(bill)}>
                      <td style={{ fontWeight: 600 }}>{bill.name}</td>
                      <td style={{ color: 'var(--red)', fontWeight: 600 }}>R{bill.amount.toLocaleString()}</td>
                      <td>Day {bill.dayOfMonth}</td>
                      <td style={{ color: 'var(--text2)' }}>{bill.description || '—'}</td>
                      <td>
                        <span className="badge" style={{
                          background: bill.active ? 'rgba(16,185,129,0.15)' : 'var(--bg5)',
                          color: bill.active ? '#10B981' : 'var(--text3)',
                        }}>
                          {bill.active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); updateBill(bill.id, { active: !bill.active }); }}>
                            {bill.active ? <ToggleRight size={16} style={{ color: 'var(--green)' }} /> : <ToggleLeft size={16} />}
                          </button>
                          <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); deleteBill(bill.id); }}>
                            <Trash2 size={14} style={{ color: 'var(--red)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Bill' : 'New Recurring Bill'}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Adobe Creative Cloud" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount (R) *</label>
                  <input className="form-input" type="number" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Day of Month</label>
                  <input className="form-input" type="number" min="1" max="31" value={form.dayOfMonth}
                    onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ProjectCategory })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional notes" />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
