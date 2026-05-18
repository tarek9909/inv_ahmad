import React, { useEffect, useState } from 'react';
import { Plus, Edit, Archive, RotateCcw, Trash2 } from 'lucide-react';
import DataTable, { ActionButton, StatusBadge } from '../../components/DataTable.jsx';
import Modal, { ConfirmModal } from '../../components/Modal.jsx';
import FormField, { FormInput, FormSelect, FormTextarea, SubmitButton } from '../../components/FormField.jsx';
import { toast } from '../../components/Toast.jsx';
import { authStore, inventoryStores } from '../../state/index.js';
import { useStore } from '../../hooks/useStore.js';
import { ACTIVE_STATUSES } from '../../domain/index.js';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
];

export default function SuppliersTab() {
  const { rows, meta, loading, error } = useStore(inventoryStores.suppliers);
  const { user } = useStore(authStore);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '', status: 'active' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { inventoryStores.suppliers.load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', address: '', notes: '', status: 'active' });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name || '', phone: row.phone || '', email: row.email || '', address: row.address || '', notes: row.notes || '', status: row.status || 'active' });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.name.length > 150) errs.name = 'Max 150 characters';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      if (editing) {
        await inventoryStores.suppliers.update(editing.id, form);
        toast.success('Supplier updated');
      } else {
        await inventoryStores.suppliers.create(form);
        toast.success('Supplier created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleArchive = async (row) => {
    try {
      await inventoryStores.suppliers.update(row.id, { status: row.status === 'inactive' ? 'active' : 'inactive' });
      toast.success(row.status === 'inactive' ? 'Supplier restored' : 'Supplier archived');
      inventoryStores.suppliers.load();
    } catch (err) {
      toast.error(err?.message || 'Failed to update supplier');
    }
  };

  const confirmDelete = async () => {
    try {
      await inventoryStores.suppliers.delete(deleteTarget.id);
      toast.success('Supplier permanently deleted');
    } catch (err) {
      toast.error(err?.message || 'Delete failed');
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        meta={meta}
        loading={loading}
        error={error}
        onLoad={(filters) => inventoryStores.suppliers.load(filters)}
        toolbar={
          <button className="glass-button" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={openCreate}>
            <Plus size={16} /> Add Supplier
          </button>
        }
        actions={(row) => (
          <>
            <ActionButton icon={Edit} label="Edit" onClick={() => openEdit(row)} />
            <ActionButton icon={row.status === 'inactive' ? RotateCcw : Archive} label={row.status === 'inactive' ? 'Restore' : 'Archive'} onClick={() => toggleArchive(row)} color="var(--accent-purple)" />
            {user?.role?.code === 'admin' && <ActionButton icon={Trash2} label="Delete Permanently" onClick={() => setDeleteTarget(row)} color="var(--accent-red)" />}
          </>
        )}
      />

      <Modal open={modalOpen} title={editing ? 'Edit Supplier' : 'Add Supplier'} onClose={() => setModalOpen(false)} width="520px">
        <form onSubmit={handleSubmit}>
          <FormField label="Name" required error={errors.name}>
            <FormInput value={form.name} onChange={(v) => { setForm({ ...form, name: v }); setErrors({ ...errors, name: null }); }} placeholder="Supplier name" />
          </FormField>
          <FormField label="Phone">
            <FormInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="Phone number" />
          </FormField>
          <FormField label="Email">
            <FormInput type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="Email address" />
          </FormField>
          <FormField label="Address">
            <FormTextarea value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="Address" rows={2} />
          </FormField>
          <FormField label="Notes">
            <FormTextarea value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Notes" rows={2} />
          </FormField>
          <FormField label="Status">
            <FormSelect value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={ACTIVE_STATUSES.map((s) => ({ value: s, label: s }))} />
          </FormField>
          <SubmitButton loading={saving}>{editing ? 'Update' : 'Create'}</SubmitButton>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Permanently Delete Supplier"
        message={`Delete ${deleteTarget?.name}? Suppliers linked to items, stock entries, or purchase orders cannot be permanently deleted.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
