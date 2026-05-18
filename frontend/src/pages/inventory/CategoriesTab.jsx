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
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
];

export default function CategoriesTab() {
  const { rows, meta, loading, error } = useStore(inventoryStores.categories);
  const { user } = useStore(authStore);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'active' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { inventoryStores.categories.load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', status: 'active' });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name || '', description: row.description || '', status: row.status || 'active' });
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
        await inventoryStores.categories.update(editing.id, form);
        toast.success('Category updated');
      } else {
        await inventoryStores.categories.create(form);
        toast.success('Category created');
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
      await inventoryStores.categories.update(row.id, { status: row.status === 'inactive' ? 'active' : 'inactive' });
      toast.success(row.status === 'inactive' ? 'Category restored' : 'Category archived');
      inventoryStores.categories.load();
    } catch (err) {
      toast.error(err?.message || 'Failed to update category');
    }
  };

  const confirmDelete = async () => {
    try {
      await inventoryStores.categories.delete(deleteTarget.id);
      toast.success('Category permanently deleted');
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
        onLoad={(filters) => inventoryStores.categories.load(filters)}
        toolbar={
          <button className="glass-button" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={openCreate}>
            <Plus size={16} /> Add Category
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

      <Modal open={modalOpen} title={editing ? 'Edit Category' : 'Add Category'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <FormField label="Name" required error={errors.name}>
            <FormInput value={form.name} onChange={(v) => { setForm({ ...form, name: v }); setErrors({ ...errors, name: null }); }} placeholder="Category name" />
          </FormField>
          <FormField label="Description">
            <FormTextarea value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Optional description" />
          </FormField>
          <FormField label="Status">
            <FormSelect value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={ACTIVE_STATUSES.map((s) => ({ value: s, label: s }))} />
          </FormField>
          <SubmitButton loading={saving}>{editing ? 'Update' : 'Create'}</SubmitButton>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Permanently Delete Category"
        message={`Delete ${deleteTarget?.name}? Categories linked to items cannot be permanently deleted.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
