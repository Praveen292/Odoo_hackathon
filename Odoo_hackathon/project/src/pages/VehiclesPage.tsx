import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Truck } from 'lucide-react';
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from '../lib/api';
import type { Vehicle, VehicleStatus, VehicleType } from '../types';
import { useTable } from '../hooks/usePagination';
import { Loading, EmptyState, Badge } from '../components/ui/Feedback';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination, SortableHeader } from '../components/ui/Pagination';
import { useToast } from '../context/ToastContext';

const vehicleTypes: VehicleType[] = ['Truck', 'Trailer', 'Van', 'Bus', 'Car', 'Tanker', 'Refrigerated'];
const vehicleStatuses: VehicleStatus[] = ['Available', 'On Trip', 'In Shop', 'Retired'];
const regions = ['North', 'South', 'East', 'West', 'Central'];

export function VehiclesPage() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const table = useTable<Vehicle>(vehicles as unknown as Record<string, unknown>[] as Vehicle[], 10);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchVehicles();
      setVehicles(data);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to load vehicles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
    setSaving(true);
    try {
      if (editing) {
        await updateVehicle(editing.id, form);
        toast('Vehicle updated successfully', 'success');
      } else {
        await createVehicle(form);
        toast('Vehicle created successfully', 'success');
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to save vehicle', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVehicle(deleteId);
      toast('Vehicle deleted', 'success');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    }
  };

  if (loading) return <Loading message="Loading vehicles..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vehicle Registry</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your fleet inventory</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Vehicle
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={table.search}
              onChange={(e) => { table.setSearch(e.target.value); table.setPage(1); }}
              placeholder="Search vehicles..."
              className="input pl-9"
            />
          </div>
          <select value={table.filters.type ?? ''} onChange={(e) => table.setFilter('type', e.target.value)} className="input w-auto">
            <option value="">All Types</option>
            {vehicleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={table.filters.status ?? ''} onChange={(e) => table.setFilter('status', e.target.value)} className="input w-auto">
            <option value="">All Status</option>
            {vehicleStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={table.filters.region ?? ''} onChange={(e) => table.setFilter('region', e.target.value)} className="input w-auto">
            <option value="">All Regions</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {table.paginated.length === 0 ? (
          <EmptyState icon={Truck} title="No vehicles found" message="Try adjusting filters or add a new vehicle" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <SortableHeader sortable sortKey="registration_number" currentSort={table.sortConfig} onSort={table.toggleSort}>Reg. Number</SortableHeader>
                  <SortableHeader sortable sortKey="name" currentSort={table.sortConfig} onSort={table.toggleSort}>Name</SortableHeader>
                  <SortableHeader sortable sortKey="type" currentSort={table.sortConfig} onSort={table.toggleSort}>Type</SortableHeader>
                  <SortableHeader sortable sortKey="max_load_capacity" currentSort={table.sortConfig} onSort={table.toggleSort}>Capacity (kg)</SortableHeader>
                  <SortableHeader sortable sortKey="current_odometer" currentSort={table.sortConfig} onSort={table.toggleSort}>Odometer</SortableHeader>
                  <SortableHeader sortable sortKey="acquisition_cost" currentSort={table.sortConfig} onSort={table.toggleSort}>Acq. Cost</SortableHeader>
                  <SortableHeader sortable sortKey="status" currentSort={table.sortConfig} onSort={table.toggleSort}>Status</SortableHeader>
                  <SortableHeader sortable sortKey="region" currentSort={table.sortConfig} onSort={table.toggleSort}>Region</SortableHeader>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {table.paginated.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="table-cell font-medium text-primary-600">{v.registration_number}</td>
                    <td className="table-cell">{v.name}</td>
                    <td className="table-cell">{v.type}</td>
                    <td className="table-cell">{Number(v.max_load_capacity).toLocaleString()}</td>
                    <td className="table-cell">{Number(v.current_odometer).toLocaleString()}</td>
                    <td className="table-cell">${Number(v.acquisition_cost).toLocaleString()}</td>
                    <td className="table-cell"><Badge status={v.status}>{v.status}</Badge></td>
                    <td className="table-cell">{v.region}</td>
                    <td className="table-cell text-right">
                      <button onClick={() => { setEditing(v); setModalOpen(true); }} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(v.id)} className="rounded-md p-1.5 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20">
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
        <VehicleForm
          vehicle={editing}
          saving={saving}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}

function VehicleForm({ vehicle, saving, onSave, onClose }: {
  vehicle: Vehicle | null;
  saving: boolean;
  onSave: (form: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    registration_number: vehicle?.registration_number ?? '',
    name: vehicle?.name ?? '',
    model: vehicle?.model ?? '',
    type: vehicle?.type ?? 'Truck' as VehicleType,
    max_load_capacity: vehicle?.max_load_capacity ?? 0,
    current_odometer: vehicle?.current_odometer ?? 0,
    acquisition_cost: vehicle?.acquisition_cost ?? 0,
    status: vehicle?.status ?? 'Available' as VehicleStatus,
    region: vehicle?.region ?? 'Central',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal open onClose={onClose} title={vehicle ? 'Edit Vehicle' : 'Add Vehicle'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Registration Number *</label>
            <input value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Vehicle Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Model *</label>
            <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Vehicle Type *</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as VehicleType })} className="input">
              {vehicleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Max Load Capacity (kg) *</label>
            <input type="number" value={form.max_load_capacity} onChange={(e) => setForm({ ...form, max_load_capacity: Number(e.target.value) })} className="input" required />
          </div>
          <div>
            <label className="label">Current Odometer *</label>
            <input type="number" value={form.current_odometer} onChange={(e) => setForm({ ...form, current_odometer: Number(e.target.value) })} className="input" required />
          </div>
          <div>
            <label className="label">Acquisition Cost ($) *</label>
            <input type="number" value={form.acquisition_cost} onChange={(e) => setForm({ ...form, acquisition_cost: Number(e.target.value) })} className="input" required />
          </div>
          <div>
            <label className="label">Status *</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as VehicleStatus })} className="input">
              {vehicleStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Region *</label>
            <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="input">
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
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
