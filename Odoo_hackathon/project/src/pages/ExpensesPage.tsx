import { useEffect, useState } from 'react';
import { Plus, Search, Receipt, Trash2, Pencil, Download } from 'lucide-react';
import { fetchExpenses, createExpense, updateExpense, deleteExpense, fetchVehicles } from '../lib/api';
import type { Expense, Vehicle, ExpenseType } from '../types';
import { useTable } from '../hooks/usePagination';
import { Loading, EmptyState } from '../components/ui/Feedback';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination, SortableHeader } from '../components/ui/Pagination';
import { useToast } from '../context/ToastContext';
import Papa from 'papaparse';

const expenseTypes: ExpenseType[] = ['Maintenance', 'Repair', 'Toll', 'Parking', 'Insurance', 'Other'];

export function ExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const table = useTable<Expense>(expenses as unknown as Record<string, unknown>[] as Expense[], 10);

  const load = async () => {
    setLoading(true);
    try {
      const [e, v] = await Promise.all([fetchExpenses(), fetchVehicles()]);
      setExpenses(e);
      setVehicles(v);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form: Omit<Expense, 'id' | 'created_at' | 'vehicle'>) => {
    setSaving(true);
    try {
      const payload = { ...form, vehicle_id: form.vehicle_id || null };
      if (editing) {
        await updateExpense(editing.id, payload);
        toast('Expense updated', 'success');
      } else {
        await createExpense(payload);
        toast('Expense created', 'success');
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteExpense(deleteId);
      toast('Expense deleted', 'success');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    }
  };

  const handleExport = () => {
    const csv = Papa.parse(table.filtered.map((e) => ({
      Vehicle: e.vehicle?.registration_number ?? '',
      Type: e.type,
      Date: e.expense_date,
      Amount: e.amount,
      Description: e.description ?? '',
    })), { header: true });
    const blob = new Blob([csv.data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV exported', 'success');
  };

  const totalAmount = table.filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  if (loading) return <Loading message="Loading expenses..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expense Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track operational costs per vehicle</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {expenseTypes.map((type) => {
          const total = expenses.filter((e) => e.type === type).reduce((s, e) => s + Number(e.amount), 0);
          return (
            <div key={type} className="card p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">{type}</p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">${total.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={table.search}
              onChange={(e) => { table.setSearch(e.target.value); table.setPage(1); }}
              placeholder="Search expenses..."
              className="input pl-9"
            />
          </div>
          <select value={table.filters.type ?? ''} onChange={(e) => table.setFilter('type', e.target.value)} className="input w-auto">
            <option value="">All Types</option>
            {expenseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Total: ${totalAmount.toLocaleString()}
          </div>
        </div>

        {table.paginated.length === 0 ? (
          <EmptyState icon={Receipt} title="No expenses found" message="Add an expense to start tracking costs" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="table-header">Vehicle</th>
                  <SortableHeader sortable sortKey="type" currentSort={table.sortConfig} onSort={table.toggleSort}>Type</SortableHeader>
                  <SortableHeader sortable sortKey="expense_date" currentSort={table.sortConfig} onSort={table.toggleSort}>Date</SortableHeader>
                  <SortableHeader sortable sortKey="amount" currentSort={table.sortConfig} onSort={table.toggleSort}>Amount</SortableHeader>
                  <th className="table-header">Description</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {table.paginated.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="table-cell font-medium text-slate-800 dark:text-slate-100">{e.vehicle?.registration_number ?? '—'}</td>
                    <td className="table-cell">{e.type}</td>
                    <td className="table-cell">{e.expense_date}</td>
                    <td className="table-cell font-medium">${Number(e.amount).toLocaleString()}</td>
                    <td className="table-cell max-w-[200px] truncate">{e.description ?? '—'}</td>
                    <td className="table-cell text-right">
                      <button onClick={() => { setEditing(e); setModalOpen(true); }} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(e.id)} className="rounded-md p-1.5 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={table.page}
          totalPages={table.totalPages}
          total={table.total}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
        />
      </div>

      {modalOpen && (
        <ExpenseForm expense={editing} vehicles={vehicles} saving={saving} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
        confirmText="Delete"
      />
    </div>
  );
}

function ExpenseForm({ expense, vehicles, saving, onSave, onClose }: {
  expense: Expense | null;
  vehicles: Vehicle[];
  saving: boolean;
  onSave: (form: Omit<Expense, 'id' | 'created_at' | 'vehicle'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    vehicle_id: expense?.vehicle_id ?? '',
    type: expense?.type ?? 'Other' as ExpenseType,
    expense_date: expense?.expense_date ?? new Date().toISOString().split('T')[0],
    amount: expense?.amount ?? 0,
    description: expense?.description ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal open onClose={onClose} title={expense ? 'Edit Expense' : 'Add Expense'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Vehicle *</label>
          <select value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} className="input" required>
            <option value="">Select vehicle</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Expense Type *</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ExpenseType })} className="input">
            {expenseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Amount ($) *</label>
            <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="input" required />
          </div>
          <div>
            <label className="label">Date *</label>
            <input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="input" required />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}
