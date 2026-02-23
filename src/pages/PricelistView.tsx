import React, { useState } from 'react';
import { Plus, X, Trash2, Search } from 'lucide-react';
import { useStore } from '../store';
import { PricelistItem, ProjectCategory } from '../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/constants';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProjectCategory[];

interface FormData {
  name: string;
  sku: string;
  price: string;
  category: ProjectCategory;
  description: string;
}

const defaultForm: FormData = {
  name: '',
  sku: '',
  price: '',
  category: 'web-development',
  description: '',
};

export default function PricelistView() {
  const { pricelistItems, addPricelistItem, updatePricelistItem, deletePricelistItem } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<ProjectCategory | 'all'>('all');

  const handleSubmit = () => {
    if (!form.name || !form.price) return;
    const data: Omit<PricelistItem, 'id'> = {
      name: form.name,
      sku: form.sku,
      price: parseFloat(form.price),
      category: form.category,
      description: form.description,
    };
    if (editing) {
      updatePricelistItem(editing, data);
      setEditing(null);
    } else {
      addPricelistItem(data);
    }
    setForm(defaultForm);
    setShowForm(false);
  };

  const startEdit = (item: PricelistItem) => {
    setForm({
      name: item.name,
      sku: item.sku,
      price: item.price.toString(),
      category: item.category,
      description: item.description || '',
    });
    setEditing(item.id);
    setShowForm(true);
  };

  const filtered = pricelistItems.filter((item) => {
    const matchSearch = !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || item.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Price List</h2>
        <button className="btn btn-primary" onClick={() => { setForm(defaultForm); setEditing(null); setShowForm(true); }}>
          <Plus size={14} /> Add Item
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32, width: '100%' }}
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-input" style={{ width: 220 }} value={filterCat}
          onChange={(e) => setFilterCat(e.target.value as any)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No items found.</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Description</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => startEdit(item)}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text2)' }}>{item.sku}</td>
                  <td>
                    <span className="badge" style={{ background: CATEGORY_COLORS[item.category] + '22', color: CATEGORY_COLORS[item.category], fontSize: 10 }}>
                      {CATEGORY_LABELS[item.category]}
                    </span>
                  </td>
                  <td style={{ color: 'var(--green)', fontWeight: 600 }}>R{item.price.toLocaleString()}</td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>{item.description || '—'}</td>
                  <td>
                    <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); deletePricelistItem(item.id); }}>
                      <Trash2 size={14} style={{ color: 'var(--red)' }} />
                    </button>
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
              <span className="modal-title">{editing ? 'Edit Item' : 'New Price List Item'}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Service / Product Name *</label>
                <input className="form-input" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Website Design Package" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">SKU Code</label>
                  <input className="form-input" value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="WEB-001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (R) *</label>
                  <input className="form-input" type="number" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
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
                <textarea className="form-input" rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What's included..." />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Add Item'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
