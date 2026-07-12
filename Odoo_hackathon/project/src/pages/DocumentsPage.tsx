import { useEffect, useState } from 'react';
import { Plus, Search, FileText, Trash2, Upload, FileCheck } from 'lucide-react';
import { fetchDocuments, createDocument, deleteDocument, fetchVehicles } from '../lib/api';
import type { VehicleDocument, Vehicle, DocumentType } from '../types';
import { useTable } from '../hooks/usePagination';
import { Loading, EmptyState } from '../components/ui/Feedback';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination, SortableHeader } from '../components/ui/Pagination';
import { useToast } from '../context/ToastContext';

const documentTypes: DocumentType[] = ['Registration Certificate', 'Insurance', 'Pollution Certificate'];

export function DocumentsPage() {
  const { toast } = useToast();
  const [docs, setDocs] = useState<(VehicleDocument & { vehicle: Pick<Vehicle, 'id' | 'registration_number' | 'name'> | null })[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const table = useTable(docs as unknown as Record<string, unknown>[] as (VehicleDocument & { vehicle: Pick<Vehicle, 'id' | 'registration_number' | 'name'> | null })[], 10);

  const load = async () => {
    setLoading(true);
    try {
      const [d, v] = await Promise.all([fetchDocuments(), fetchVehicles()]);
      setDocs(d);
      setVehicles(v);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form: { vehicle_id: string; document_type: DocumentType; file_path: string; file_name: string }) => {
    setSaving(true);
    try {
      await createDocument(form);
      toast('Document uploaded', 'success');
      setModalOpen(false);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to upload', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDocument(deleteId);
      toast('Document deleted', 'success');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    }
  };

  if (loading) return <Loading message="Loading documents..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vehicle Documents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage registration, insurance, and pollution certificates</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Upload Document
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={table.search}
              onChange={(e) => { table.setSearch(e.target.value); table.setPage(1); }}
              placeholder="Search documents..."
              className="input pl-9"
            />
          </div>
          <select value={table.filters.document_type ?? ''} onChange={(e) => table.setFilter('document_type', e.target.value)} className="input w-auto">
            <option value="">All Types</option>
            {documentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {table.paginated.length === 0 ? (
          <EmptyState icon={FileText} title="No documents found" message="Upload a document to get started" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="table-header">Vehicle</th>
                  <SortableHeader sortable sortKey="document_type" currentSort={table.sortConfig} onSort={table.toggleSort}>Document Type</SortableHeader>
                  <th className="table-header">File Name</th>
                  <SortableHeader sortable sortKey="uploaded_at" currentSort={table.sortConfig} onSort={table.toggleSort}>Uploaded</SortableHeader>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {table.paginated.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="table-cell font-medium text-slate-800 dark:text-slate-100">{d.vehicle?.registration_number ?? '—'}</td>
                    <td className="table-cell">
                      <span className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-primary-500" />
                        {d.document_type}
                      </span>
                    </td>
                    <td className="table-cell">{d.file_name ?? d.file_path}</td>
                    <td className="table-cell">{new Date(d.uploaded_at).toLocaleDateString()}</td>
                    <td className="table-cell text-right">
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
        <DocumentForm vehicles={vehicles} saving={saving} onSave={handleSave} onClose={() => setModalOpen(false)} />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document record?"
        confirmText="Delete"
      />
    </div>
  );
}

function DocumentForm({ vehicles, saving, onSave, onClose }: {
  vehicles: Vehicle[];
  saving: boolean;
  onSave: (form: { vehicle_id: string; document_type: DocumentType; file_path: string; file_name: string }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    vehicle_id: '',
    document_type: 'Registration Certificate' as DocumentType,
    file_path: '',
    file_name: '',
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, file_path: `/docs/${file.name}`, file_name: file.name });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file_path) {
      return;
    }
    onSave(form);
  };

  return (
    <Modal open onClose={onClose} title="Upload Document" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Vehicle *</label>
          <select value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} className="input" required>
            <option value="">Select vehicle</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Document Type *</label>
          <select value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value as DocumentType })} className="input">
            {documentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">File *</label>
          <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
            <Upload className="mx-auto h-8 w-8 text-slate-400" />
            <input type="file" onChange={handleFile} className="mt-2 text-sm text-slate-500" />
            {form.file_name && <p className="mt-2 text-xs text-success-600">{form.file_name} selected</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving || !form.file_path} className="btn-primary">{saving ? 'Uploading...' : 'Upload'}</button>
        </div>
      </form>
    </Modal>
  );
}
