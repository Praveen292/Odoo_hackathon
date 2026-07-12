import { useEffect, useState } from 'react';
import { Plus, Search, Route, Trash2, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { fetchTrips, createTrip, deleteTrip, fetchVehicles, fetchDrivers } from '../lib/api';
import { dispatchTrip, completeTrip, cancelTrip } from '../lib/businessLogic';
import type { Trip, Vehicle, Driver, TripStatus } from '../types';
import { useTable } from '../hooks/usePagination';
import { Loading, EmptyState, Badge } from '../components/ui/Feedback';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination, SortableHeader } from '../components/ui/Pagination';
import { useToast } from '../context/ToastContext';

const tripStatuses: TripStatus[] = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

export function TripsPage() {
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [completeTripId, setCompleteTripId] = useState<string | null>(null);
  const [cancelTripId, setCancelTripId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[] | null>(null);
  const [dispatching, setDispatching] = useState<string | null>(null);

  const table = useTable<Trip>(trips as unknown as Record<string, unknown>[] as Trip[], 10);

  const load = async () => {
    setLoading(true);
    try {
      const [t, v, d] = await Promise.all([fetchTrips(), fetchVehicles(), fetchDrivers()]);
      setTrips(t);
      setVehicles(v);
      setDrivers(d);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to load trips', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (form: Omit<Trip, 'id' | 'created_at' | 'updated_at' | 'vehicle' | 'driver' | 'status' | 'final_odometer' | 'fuel_consumed' | 'completion_date'>) => {
    setSaving(true);
    try {
      await createTrip({ ...form, status: 'Draft' });
      toast('Trip created as Draft', 'success');
      setCreateOpen(false);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to create trip', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDispatch = async (tripId: string) => {
    setDispatching(tripId);
    setValidationErrors(null);
    try {
      const result = await dispatchTrip(tripId);
      if (result.success) {
        toast('Trip dispatched successfully', 'success');
        load();
      } else {
        setValidationErrors(result.errors);
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to dispatch', 'error');
    } finally {
      setDispatching(null);
    }
  };

  const handleComplete = async (data: { finalOdometer: number; fuelConsumed: number; completionDate: string }) => {
    if (!completeTripId) return;
    setSaving(true);
    try {
      const result = await completeTrip(completeTripId, data);
      if (result.success) {
        toast('Trip completed successfully', 'success');
        setCompleteTripId(null);
        load();
      } else {
        result.errors.forEach((e) => toast(e, 'error'));
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to complete trip', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTripId) return;
    try {
      const result = await cancelTrip(cancelTripId);
      if (result.success) {
        toast('Trip cancelled', 'warning');
        load();
      } else {
        result.errors.forEach((e) => toast(e, 'error'));
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to cancel', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTrip(deleteId);
      toast('Trip deleted', 'success');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    }
  };

  if (loading) return <Loading message="Loading trips..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trip Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Plan, dispatch, and track trips</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> New Trip
        </button>
      </div>

      {validationErrors && (
        <div className="rounded-xl border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-error-600" />
            <div>
              <p className="font-medium text-error-800 dark:text-error-400">Dispatch Validation Failed</p>
              <ul className="mt-1 list-disc pl-4 text-sm text-error-600 dark:text-error-400">
                {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={table.search}
              onChange={(e) => { table.setSearch(e.target.value); table.setPage(1); }}
              placeholder="Search trips..."
              className="input pl-9"
            />
          </div>
          <select value={table.filters.status ?? ''} onChange={(e) => table.setFilter('status', e.target.value)} className="input w-auto">
            <option value="">All Status</option>
            {tripStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {table.paginated.length === 0 ? (
          <EmptyState icon={Route} title="No trips found" message="Create a new trip to get started" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <SortableHeader sortable sortKey="source" currentSort={table.sortConfig} onSort={table.toggleSort}>Source</SortableHeader>
                  <SortableHeader sortable sortKey="destination" currentSort={table.sortConfig} onSort={table.toggleSort}>Destination</SortableHeader>
                  <th className="table-header">Vehicle</th>
                  <th className="table-header">Driver</th>
                  <SortableHeader sortable sortKey="cargo_weight" currentSort={table.sortConfig} onSort={table.toggleSort}>Cargo (kg)</SortableHeader>
                  <SortableHeader sortable sortKey="planned_distance" currentSort={table.sortConfig} onSort={table.toggleSort}>Distance</SortableHeader>
                  <SortableHeader sortable sortKey="revenue" currentSort={table.sortConfig} onSort={table.toggleSort}>Revenue</SortableHeader>
                  <SortableHeader sortable sortKey="status" currentSort={table.sortConfig} onSort={table.toggleSort}>Status</SortableHeader>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {table.paginated.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="table-cell font-medium text-slate-800 dark:text-slate-100">{t.source}</td>
                    <td className="table-cell">{t.destination}</td>
                    <td className="table-cell">{t.vehicle?.registration_number ?? '—'}</td>
                    <td className="table-cell">{t.driver?.name ?? '—'}</td>
                    <td className="table-cell">{Number(t.cargo_weight).toLocaleString()}</td>
                    <td className="table-cell">{Number(t.planned_distance).toLocaleString()} km</td>
                    <td className="table-cell">${Number(t.revenue).toLocaleString()}</td>
                    <td className="table-cell"><Badge status={t.status}>{t.status}</Badge></td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        {t.status === 'Draft' && (
                          <button
                            onClick={() => handleDispatch(t.id)}
                            disabled={dispatching === t.id}
                            title="Dispatch"
                            className="rounded-md p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {t.status === 'Dispatched' && (
                          <>
                            <button onClick={() => setCompleteTripId(t.id)} title="Complete" className="rounded-md p-1.5 text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button onClick={() => setCancelTripId(t.id)} title="Cancel" className="rounded-md p-1.5 text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-900/20">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {t.status === 'Draft' && (
                          <button onClick={() => setCancelTripId(t.id)} title="Cancel" className="rounded-md p-1.5 text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-900/20">
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => setDeleteId(t.id)} className="rounded-md p-1.5 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20">
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
        <TripForm vehicles={vehicles} drivers={drivers} saving={saving} onSave={handleCreate} onClose={() => setCreateOpen(false)} />
      )}

      {completeTripId && (
        <CompleteTripForm saving={saving} onSave={handleComplete} onClose={() => setCompleteTripId(null)} />
      )}

      <ConfirmDialog
        open={!!cancelTripId}
        onClose={() => setCancelTripId(null)}
        onConfirm={handleCancel}
        title="Cancel Trip"
        message="Cancelling this trip will restore vehicle and driver to Available status. Continue?"
        confirmText="Cancel Trip"
        variant="warning"
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Trip"
        message="Are you sure you want to permanently delete this trip?"
        confirmText="Delete"
      />
    </div>
  );
}

function TripForm({ vehicles, drivers, saving, onSave, onClose }: {
  vehicles: Vehicle[];
  drivers: Driver[];
  saving: boolean;
  onSave: (form: Omit<Trip, 'id' | 'created_at' | 'updated_at' | 'vehicle' | 'driver' | 'status' | 'final_odometer' | 'fuel_consumed' | 'completion_date'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    source: '',
    destination: '',
    vehicle_id: '',
    driver_id: '',
    cargo_weight: 0,
    planned_distance: 0,
    revenue: 0,
  });

  const availableVehicles = vehicles.filter((v) => v.status === 'Available');
  const availableDrivers = drivers.filter((d) => d.status === 'Available' && new Date(d.license_expiry) > new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      vehicle_id: form.vehicle_id || null,
      driver_id: form.driver_id || null,
    });
  };

  return (
    <Modal open onClose={onClose} title="New Trip" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Source *</label>
            <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Destination *</label>
            <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Vehicle</label>
            <select value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} className="input">
              <option value="">Select vehicle</option>
              {availableVehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number} — {v.name} (Cap: {v.max_load_capacity}kg)</option>)}
            </select>
            {availableVehicles.length === 0 && <p className="mt-1 text-xs text-warning-600">No available vehicles</p>}
          </div>
          <div>
            <label className="label">Driver</label>
            <select value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })} className="input">
              <option value="">Select driver</option>
              {availableDrivers.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.license_number}</option>)}
            </select>
            {availableDrivers.length === 0 && <p className="mt-1 text-xs text-warning-600">No available drivers with valid license</p>}
          </div>
          <div>
            <label className="label">Cargo Weight (kg) *</label>
            <input type="number" value={form.cargo_weight} onChange={(e) => setForm({ ...form, cargo_weight: Number(e.target.value) })} className="input" required />
          </div>
          <div>
            <label className="label">Planned Distance (km) *</label>
            <input type="number" value={form.planned_distance} onChange={(e) => setForm({ ...form, planned_distance: Number(e.target.value) })} className="input" required />
          </div>
          <div>
            <label className="label">Revenue ($) *</label>
            <input type="number" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: Number(e.target.value) })} className="input" required />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Trip'}</button>
        </div>
      </form>
    </Modal>
  );
}

function CompleteTripForm({ saving, onSave, onClose }: {
  saving: boolean;
  onSave: (data: { finalOdometer: number; fuelConsumed: number; completionDate: string }) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState({
    finalOdometer: 0,
    fuelConsumed: 0,
    completionDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <Modal open onClose={onClose} title="Complete Trip" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Final Odometer Reading *</label>
          <input type="number" value={data.finalOdometer} onChange={(e) => setData({ ...data, finalOdometer: Number(e.target.value) })} className="input" required />
        </div>
        <div>
          <label className="label">Fuel Consumed (Liters) *</label>
          <input type="number" step="0.01" value={data.fuelConsumed} onChange={(e) => setData({ ...data, fuelConsumed: Number(e.target.value) })} className="input" required />
        </div>
        <div>
          <label className="label">Completion Date *</label>
          <input type="date" value={data.completionDate} onChange={(e) => setData({ ...data, completionDate: e.target.value })} className="input" required />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-success">{saving ? 'Completing...' : 'Complete Trip'}</button>
        </div>
      </form>
    </Modal>
  );
}
