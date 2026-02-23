import React, { useState } from 'react';
import { Plus, X, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useStore } from '../store';
import { InvoiceReminder } from '../types';

interface FormData {
  customerName: string;
  amount: string;
  dayOfMonth: string;
  description: string;
}

const defaultForm: FormData = {
  customerName: '',
  amount: '',
  dayOfMonth: '1',
  description: '',
};

export default function InvoicesView() {
  const { invoiceReminders, addInvoiceReminder, updateInvoiceReminder, deleteInvoiceReminder } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [editing, setEditing] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.customerName || !form.amount) return;
    const data: Omit<InvoiceReminder, 'id'> = {
      customerName: form.customerName,
      amount: parseFloat(form.amount),
      dayOfMonth: parseInt(form.dayOfMonth) || 1,
      description: form.description,
      active: true,
    };
    if (editing) {
      updateInvoiceReminder(editing, data);
      setEditing(null);
    } else {
      addInvoiceReminder(data);
    }
    setForm(defaultForm);
    setShowForm(false);
  };

  const startEdit = (inv: InvoiceReminder) => {
    setForm({
      customerName: inv.customerName,
      amount: inv.amount.toString(),
      dayOfMonth: inv.dayOfMonth.toString(),
      description: inv.description || '',
    });
    setEditing(inv.id);
    setShowForm(true);
  };

  const totalMonthly = invoiceReminders.filter((i) => i.active).reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Invoice Reminders</h2>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
            Recurring monthly invoices — total active: <span style={{ color: 'var(--green)', fontWeight: 600 }}>R{totalMonthly.toLocaleString()}/mo</span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(defaultForm); setEditing(null); setShowForm(true); }}>
          <Plus size={14} /> New Reminder
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {invoiceReminders.length === 0 ? (
          <div className="empty-state">
            <p>No invoice reminders yet.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>Day of Month</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {invoiceReminders.map((inv) => (
                <tr key={inv.id} style={{ cursor: 'pointer', opacity: inv.active ? 1 : 0.5 }} onClick={() => startEdit(inv)}>
                  <td style={{ fontWeight: 600 }}>{inv.customerName}</td>
                  <td style={{ color: 'var(--green)', fontWeight: 600 }}>R{inv.amount.toLocaleString()}</td>
                  <td>Day {inv.dayOfMonth}</td>
                  <td style={{ color: 'var(--text2)' }}>{inv.description || '—'}</td>
                  <td>
                    <span className="badge" style={{
                      background: inv.active ? 'rgba(16,185,129,0.15)' : 'var(--bg5)',
                      color: inv.active ? '#10B981' : 'var(--text3)',
                    }}>
                      {inv.active ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={(e) => { e.stopPropagation(); updateInvoiceReminder(inv.id, { active: !inv.active }); }}
                        title="Toggle active"
                      >
                        {inv.active ? <ToggleRight size={16} style={{ color: 'var(--green)' }} /> : <ToggleLeft size={16} style={{ color: 'var(--text3)' }} />}
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={(e) => { e.stopPropagation(); deleteInvoiceReminder(inv.id); }}
                      >
                        <Trash2 size={14} style={{ color: 'var(--red)' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Reminder' : 'New Invoice Reminder'}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input className="form-input" value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Customer name" />
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
                <label className="form-label">Description</label>
                <input className="form-input" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Monthly retainer" />
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
