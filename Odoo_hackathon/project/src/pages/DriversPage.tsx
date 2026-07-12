import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Users, Phone, ShieldAlert } from 'lucide-react';
import { fetchDrivers, createDriver, updateDriver, deleteDriver } from '../lib/api';
import type { Driver, DriverStatus } from '../types';
import { useTable } from '../hooks/usePagination';
import { Loading, EmptyState, Badge } from '../components/ui/Feedback';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination, SortableHeader } from '../components/ui/Pagination';
import { useToast } from '../context/ToastContext';

const driverStatuses: DriverStatus[] = ['Available', 'On Trip', 'Off Duty', 'Suspended'];
const licenseCategories = ['A', 'B', 'C', 'D', 'E'];

export function DriversPage() {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const table = useTable<Driver>(drivers as unknown as Record<string, unknown>[] as Driver[], 10);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchDrivers();
      setDrivers(data);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to load drivers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form: Omit<Driver, 'id' | 'created_at' | 'updated_at'>) => {
    setSaving(true);
    try {
      if (editing) {
        await updateDriver(editing.id, form);
        toast('Driver updated successfully', 'success');
      } else {
        await createDriver(form);
        toast('Driver created successfully', 'success');
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to save driver', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDriver(deleteId);
      toast('Driver deleted', 'success');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();
  const isExpiringSoon = (date: string) => {
    const diff = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30;
  };

  if (loading) return <Loading message="Loading drivers..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Driver Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage driver roster and licenses</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Driver
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={table.search}
              onChange={(e) => { table.setSearch(e.target.value); table.setPage(1); }}
              placeholder="Search drivers..."
              className="input pl-9"
            />
          </div>
          <select value={table.filters.status ?? ''} onChange={(e) => table.setFilter('status', e.target.value)} className="input w-auto">
            <option value="">All Status</option>
            {driverStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={table.filters.license_category ?? ''} onChange={(e) => table.setFilter('license_category', e.target.value)} className="input w-auto">
            <option value="">All Categories</option>
            {licenseCategories.map((c) => <option key={c} value={c}>Category {c}</option>)}
          </select>
        </div>

        {table.paginated.length === 0 ? (
          <EmptyState icon={Users} title="No drivers found" message="Try adjusting filters or add a new driver" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <SortableHeader sortable sortKey="name" currentSort={table.sortConfig} onSort={table.toggleSort}>Name</SortableHeader>
                  <SortableHeader sortable sortKey="license_number" currentSort={table.sortConfig} onSort={table.toggleSort}>License #</SortableHeader>
                  <SortableHeader sortable sortKey="license_category" currentSort={table.sortConfig} onSort={table.toggleSort}>Category</SortableHeader>
                  <SortableHeader sortable sortKey="license_expiry" currentSort={table.sortConfig} onSort={table.toggleSort}>License Expiry</SortableHeader>
                  <SortableHeader sortable sortKey="phone_number" currentSort={table.sortConfig} onSort={table.toggleSort}>Phone</SortableHeader>
                  <SortableHeader sortable sortKey="safety_score" currentSort={table.sortConfig} onSort={table.toggleSort}>Safety Score</SortableHeader>
                  <SortableHeader sortable sortKey="status" currentSort={table.sortConfig} onSort={table.toggleSort}>Status</SortableHeader>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {table.paginated.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="table-cell font-medium text-slate-800 dark:text-slate-100">{d.name}</td>
                    <td className="table-cell">{d.license_number}</td>
                    <td className="table-cell">{d.license_category}</td>
                    <td className="table-cell">
                      <span className={isExpired(d.license_expiry) ? 'text-error-600 font-medium' : isExpiringSoon(d.license_expiry) ? 'text-warning-600 font-medium' : ''}>
                        {d.license_expiry}
                        {isExpired(d.license_expiry) && <ShieldAlert className="ml-1 inline h-3.5 w-3.5 text-error-500" />}
                        {isExpiringSoon(d.license_expiry) && <ShieldAlert className="ml-1 inline h-3.5 w-3.5 text-warning-500" />}
                      </span>
                    </td>
                    <td className="table-cell">{d.phone_number ? <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" />{d.phone_number}</span> : '—'}</td>
                    <td className="table-cell">
                      <span className={Number(d.safety_score) >= 85 ? 'text-success-600 font-medium' : Number(d.safety_score) >= 70 ? 'text-warning-600 font-medium' : 'text-error-600 font-medium'}>
                        {d.safety_score}
                      </span>
                    </td>
                    <td className="table-cell"><Badge status={d.status}>{d.status}</Badge></td>
                    <td className="table-cell text-right">
                      <button onClick={() => { setEditing(d); setModalOpen(true); }} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(d.id)} className="rounded-md p-1.5 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20">
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
        <DriverForm driver={editing} saving={saving} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Driver"
        message="Are you sure you want to delete this driver? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}

function DriverForm({ driver, saving, onSave, onClose }: {
  driver: Driver | null;
  saving: boolean;
  onSave: (form: Omit<Driver, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: driver?.name ?? '',
    license_number: driver?.license_number ?? '',
    license_category: driver?.license_category ?? 'B',
    license_expiry: driver?.license_expiry ?? '',
    phone_number: driver?.phone_number ?? '',
    safety_score: driver?.safety_score ?? 100,
    status: driver?.status ?? 'Available' as DriverStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal open onClose={onClose} title={driver ? 'Edit Driver' : 'Add Driver'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">License Number *</label>
            <input value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">License Category *</label>
            <select value={form.license_category} onChange={(e) => setForm({ ...form, license_category: e.target.value })} className="input">
              {licenseCategories.map((c) => <option key={c} value={c}>Category {c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">License Expiry Date *</label>
            <input type="date" value={form.license_expiry} onChange={(e) => setForm({ ...form, license_expiry: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Safety Score (0-100) *</label>
            <input type="number" min="0" max="100" value={form.safety_score} onChange={(e) => setForm({ ...form, safety_score: Number(e.target.value) })} className="input" required />
          </div>
          <div>
            <label className="label">Status *</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DriverStatus })} className="input">
              {driverStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}
