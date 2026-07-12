import { useEffect, useState } from 'react';
import { Plus, Search, Wrench, CheckCircle, Trash2 } from 'lucide-react';
import { fetchMaintenance, deleteMaintenance, fetchVehicles } from '../lib/api';
import { createMaintenanceRecord, completeMaintenance } from '../lib/businessLogic';
import type { Maintenance, Vehicle, MaintenanceType, MaintenanceStatus } from '../types';
import { useTable } from '../hooks/usePagination';
import { Loading, EmptyState, Badge } from '../components/ui/Feedback';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination, SortableHeader } from '../components/ui/Pagination';
import { useToast } from '../context/ToastContext';

const maintenanceTypes: MaintenanceType[] = ['Preventive', 'Corrective', 'Inspection', 'Major Overhaul', 'Tire Replacement', 'Oil Change'];
const maintenanceStatuses: MaintenanceStatus[] = ['Active', 'Completed'];

export function MaintenancePage() {
  const { toast } = useToast();
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const table = useTable<Maintenance>(records as unknown as Record<string, unknown>[] as Maintenance[], 10);

  const load = async () => {
    setLoading(true);
    try {
      const [m, v] = await Promise.all([fetchMaintenance(), fetchVehicles()]);
      setRecords(m);
      setVehicles(v);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to load maintenance', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (form: { vehicle_id: string; type: string; description?: string; cost: number; start_date: string }) => {
    setSaving(true);
    try {
      const result = await createMaintenanceRecord(form);
      if (result.success) {
        toast('Maintenance record created — vehicle set to In Shop', 'success');
        setCreateOpen(false);
        load();
      } else {
        result.errors.forEach((e) => toast(e, 'error'));
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to create', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!completingId) return;
    try {
      const result = await completeMaintenance(completingId);
      if (result.success) {
        toast('Maintenance completed — vehicle restored to Available', 'success');
        load();
      } else {
        result.errors.forEach((e) => toast(e, 'error'));
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to complete', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMaintenance(deleteId);
      toast('Maintenance record deleted', 'success');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    }
  };

  if (loading) return <Loading message="Loading maintenance..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track vehicle maintenance and repairs</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> New Record
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={table.search}
              onChange={(e) => { table.setSearch(e.target.value); table.setPage(1); }}
              placeholder="Search maintenance..."
              className="input pl-9"
            />
          </div>
          <select value={table.filters.status ?? ''} onChange={(e) => table.setFilter('status', e.target.value)} className="input w-auto">
            <option value="">All Status</option>
            {maintenanceStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={table.filters.type ?? ''} onChange={(e) => table.setFilter('type', e.target.value)} className="input w-auto">
            <option value="">All Types</option>
            {maintenanceTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {table.paginated.length === 0 ? (
          <EmptyState icon={Wrench} title="No maintenance records" message="Create a new maintenance record to get started" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="table-header">Vehicle</th>
                  <SortableHeader sortable sortKey="type" currentSort={table.sortConfig} onSort={table.toggleSort}>Type</SortableHeader>
                  <th className="table-header">Description</th>
                  <SortableHeader sortable sortKey="cost" currentSort={table.sortConfig} onSort={table.toggleSort}>Cost</SortableHeader>
                  <SortableHeader sortable sortKey="start_date" currentSort={table.sortConfig} onSort={table.toggleSort}>Start Date</SortableHeader>
                  <SortableHeader sortable sortKey="end_date" currentSort={table.sortConfig} onSort={table.toggleSort}>End Date</SortableHeader>
                  <SortableHeader sortable sortKey="status" currentSort={table.sortConfig} onSort={table.toggleSort}>Status</SortableHeader>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {table.paginated.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="table-cell font-medium text-slate-800 dark:text-slate-100">{m.vehicle?.registration_number ?? '—'}</td>
                    <td className="table-cell">{m.type}</td>
                    <td className="table-cell max-w-[200px] truncate">{m.description ?? '—'}</td>
                    <td className="table-cell">${Number(m.cost).toLocaleString()}</td>
                    <td className="table-cell">{m.start_date}</td>
                    <td className="table-cell">{m.end_date ?? '—'}</td>
                    <td className="table-cell"><Badge status={m.status}>{m.status}</Badge></td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        {m.status === 'Active' && (
                          <button onClick={() => setCompletingId(m.id)} title="Complete" className="rounded-md p-1.5 text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => setDeleteId(m.id)} className="rounded-md p-1.5 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

      {createOpen && (
        <MaintenanceForm vehicles={vehicles} saving={saving} onSave={handleCreate} onClose={() => setCreateOpen(false)} />
      )}

      <ConfirmDialog
        open={!!completingId}
        onClose={() => setCompletingId(null)}
        onConfirm={handleComplete}
        title="Complete Maintenance"
        message="This will mark the maintenance as completed and restore the vehicle to Available (unless retired). Continue?"
        confirmText="Complete"
        variant="info"
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Record"
        message="Are you sure you want to delete this maintenance record?"
        confirmText="Delete"
      />
    </div>
  );
}

function MaintenanceForm({ vehicles, saving, onSave, onClose }: {
  vehicles: Vehicle[];
  saving: boolean;
  onSave: (form: { vehicle_id: string; type: string; description?: string; cost: number; start_date: string }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    vehicle_id: '',
    type: 'Preventive' as MaintenanceType,
    description: '',
    cost: 0,
    start_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal open onClose={onClose} title="New Maintenance Record" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Vehicle *</label>
          <select value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} className="input" required>
            <option value="">Select vehicle</option>
            {vehicles.filter((v) => v.status !== 'Retired').map((v) => (
              <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Maintenance Type *</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as MaintenanceType })} className="input">
            {maintenanceTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Cost ($) *</label>
            <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} className="input" required />
          </div>
          <div>
            <label className="label">Start Date *</label>
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="input" required />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Create Record'}</button>
        </div>
      </form>
    </Modal>
  );
}
