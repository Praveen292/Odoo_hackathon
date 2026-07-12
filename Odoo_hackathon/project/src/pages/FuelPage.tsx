import { useEffect, useState } from 'react';
import { Plus, Search, Fuel, Trash2, Pencil } from 'lucide-react';
import { fetchFuelLogs, createFuelLog, updateFuelLog, deleteFuelLog, fetchVehicles, fetchTrips } from '../lib/api';
import type { FuelLog, Vehicle, Trip } from '../types';
import { useTable } from '../hooks/usePagination';
import { Loading, EmptyState } from '../components/ui/Feedback';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination, SortableHeader } from '../components/ui/Pagination';
import { useToast } from '../context/ToastContext';

export function FuelPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FuelLog | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const table = useTable<FuelLog>(logs as unknown as Record<string, unknown>[] as FuelLog[], 10);

  const load = async () => {
    setLoading(true);
    try {
      const [f, v, t] = await Promise.all([fetchFuelLogs(), fetchVehicles(), fetchTrips()]);
      setLogs(f);
      setVehicles(v);
      setTrips(t);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to load fuel logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form: Omit<FuelLog, 'id' | 'created_at' | 'vehicle' | 'trip'>) => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        vehicle_id: form.vehicle_id || null,
        trip_id: form.trip_id || null,
        efficiency: form.liters > 0 ? Math.round((form.liters * 10) / form.liters * 100) / 100 : null,
      };
      if (editing) {
        await updateFuelLog(editing.id, payload);
        toast('Fuel log updated', 'success');
      } else {
        await createFuelLog(payload);
        toast('Fuel log created', 'success');
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
      await deleteFuelLog(deleteId);
      toast('Fuel log deleted', 'success');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    }
  };

  if (loading) return <Loading message="Loading fuel logs..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fuel Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track fuel consumption and efficiency</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Fuel Log
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={table.search}
              onChange={(e) => { table.setSearch(e.target.value); table.setPage(1); }}
              placeholder="Search fuel logs..."
              className="input pl-9"
            />
          </div>
        </div>

        {table.paginated.length === 0 ? (
          <EmptyState icon={Fuel} title="No fuel logs" message="Add a fuel log to start tracking consumption" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="table-header">Vehicle</th>
                  <th className="table-header">Trip</th>
                  <SortableHeader sortable sortKey="liters" currentSort={table.sortConfig} onSort={table.toggleSort}>Liters</SortableHeader>
                  <SortableHeader sortable sortKey="cost" currentSort={table.sortConfig} onSort={table.toggleSort}>Cost</SortableHeader>
                  <SortableHeader sortable sortKey="fuel_date" currentSort={table.sortConfig} onSort={table.toggleSort}>Date</SortableHeader>
                  <th className="table-header">Station</th>
                  <SortableHeader sortable sortKey="efficiency" currentSort={table.sortConfig} onSort={table.toggleSort}>Efficiency (km/L)</SortableHeader>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {table.paginated.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="table-cell font-medium text-slate-800 dark:text-slate-100">{f.vehicle?.registration_number ?? '—'}</td>
                    <td className="table-cell">{f.trip ? `${f.trip.source} → ${f.trip.destination}` : '—'}</td>
                    <td className="table-cell">{f.liters}</td>
                    <td className="table-cell">${Number(f.cost).toLocaleString()}</td>
                    <td className="table-cell">{f.fuel_date}</td>
                    <td className="table-cell">{f.station ?? '—'}</td>
                    <td className="table-cell">{f.efficiency ?? '—'}</td>
                    <td className="table-cell text-right">
                      <button onClick={() => { setEditing(f); setModalOpen(true); }} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(f.id)} className="rounded-md p-1.5 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20">
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
        <FuelForm log={editing} vehicles={vehicles} trips={trips} saving={saving} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Fuel Log"
        message="Are you sure you want to delete this fuel log?"
        confirmText="Delete"
      />
    </div>
  );
}

function FuelForm({ log, vehicles, trips, saving, onSave, onClose }: {
  log: FuelLog | null;
  vehicles: Vehicle[];
  trips: Trip[];
  saving: boolean;
  onSave: (form: Omit<FuelLog, 'id' | 'created_at' | 'vehicle' | 'trip'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    vehicle_id: log?.vehicle_id ?? '',
    trip_id: log?.trip_id ?? '',
    liters: log?.liters ?? 0,
    cost: log?.cost ?? 0,
    fuel_date: log?.fuel_date ?? new Date().toISOString().split('T')[0],
    station: log?.station ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal open onClose={onClose} title={log ? 'Edit Fuel Log' : 'Add Fuel Log'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Vehicle *</label>
          <select value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} className="input" required>
            <option value="">Select vehicle</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Trip (optional)</label>
          <select value={form.trip_id} onChange={(e) => setForm({ ...form, trip_id: e.target.value })} className="input">
            <option value="">No associated trip</option>
            {trips.map((t) => <option key={t.id} value={t.id}>{t.source} → {t.destination}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Liters *</label>
            <input type="number" step="0.01" value={form.liters} onChange={(e) => setForm({ ...form, liters: Number(e.target.value) })} className="input" required />
          </div>
          <div>
            <label className="label">Cost ($) *</label>
            <input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} className="input" required />
          </div>
        </div>
        <div>
          <label className="label">Fuel Date *</label>
          <input type="date" value={form.fuel_date} onChange={(e) => setForm({ ...form, fuel_date: e.target.value })} className="input" required />
        </div>
        <div>
          <label className="label">Station</label>
          <input value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} className="input" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}
