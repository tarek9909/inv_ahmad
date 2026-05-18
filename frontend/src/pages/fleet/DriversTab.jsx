import React, { useEffect, useState } from 'react';
import { Plus, Edit, Archive, RotateCcw, Trash2, Wallet } from 'lucide-react';
import DataTable, { ActionButton, StatusBadge } from '../../components/DataTable.jsx';
import Modal, { ConfirmModal } from '../../components/Modal.jsx';
import FormField, { FormInput, FormSelect, FormTextarea, SubmitButton } from '../../components/FormField.jsx';
import { toast } from '../../components/Toast.jsx';
import { accountantStores, authStore } from '../../state/index.js';
import { useStore } from '../../hooks/useStore.js';
import { USER_STATUSES } from '../../domain/index.js';

const columns = [
  { key: 'full_name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'vehicle_plate_number', label: 'Plate #' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
];

export default function DriversTab() {
  const { rows, meta, loading, error } = useStore(accountantStores.drivers);
  const { user } = useStore(authStore);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [balanceModal, setBalanceModal] = useState(null);

  useEffect(() => { accountantStores.drivers.load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ full_name: '', phone: '', address: '', id_number: '', vehicle_type: '', vehicle_plate_number: '', notes: '', status: 'active' });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ full_name: row.full_name || '', phone: row.phone || '', address: row.address || '', id_number: row.id_number || '', vehicle_type: row.vehicle_type || '', vehicle_plate_number: row.vehicle_plate_number || '', notes: row.notes || '', status: row.status || 'active' });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.full_name.trim()) { setErrors({ full_name: 'Name is required' }); return; }

    setSaving(true);
    try {
      if (editing) {
        await accountantStores.drivers.update(editing.id, form);
        toast.success('Driver updated');
      } else {
        await accountantStores.drivers.create(form);
        toast.success('Driver created');
      }
      setModalOpen(false);
      accountantStores.drivers.load();
    } catch (err) {
      toast.error(err?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleArchive = async (row) => {
    const newStatus = row.status === 'active' ? 'inactive' : 'active';
    try {
      await accountantStores.drivers.setStatus(row.id, newStatus);
      toast.success(newStatus === 'active' ? 'Driver restored' : 'Driver archived');
      accountantStores.drivers.load();
    } catch (err) {
      toast.error(err?.message || 'Failed to update status');
    }
  };

  const openBalance = async (row) => {
    try {
      const result = await accountantStores.drivers.loadBalance(row.id);
      setBalanceModal(result.data);
    } catch (err) {
      toast.error(err?.message || 'Failed to load balance');
    }
  };

  const confirmDelete = async () => {
    try {
      await accountantStores.drivers.delete(deleteTarget.id);
      toast.success('Driver permanently deleted');
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
        onLoad={(filters) => accountantStores.drivers.load(filters)}
        toolbar={
          <button className="glass-button" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={openCreate}>
            <Plus size={16} /> Add Driver
          </button>
        }
        actions={(row) => (
          <>
            <ActionButton icon={Wallet} label="Balance" onClick={() => openBalance(row)} color="var(--accent-green)" />
            <ActionButton icon={Edit} label="Edit" onClick={() => openEdit(row)} />
            <ActionButton icon={row.status === 'active' ? Archive : RotateCcw} label={row.status === 'active' ? 'Archive' : 'Restore'} onClick={() => toggleArchive(row)} color="var(--accent-purple)" />
            {user?.role?.code === 'admin' && <ActionButton icon={Trash2} label="Delete Permanently" onClick={() => setDeleteTarget(row)} color="var(--accent-red)" />}
          </>
        )}
      />

      <Modal open={modalOpen} title={editing ? 'Edit Driver' : 'Add Driver'} onClose={() => setModalOpen(false)} width="520px">
        <form onSubmit={handleSubmit}>
          <FormField label="Full Name" required error={errors.full_name}>
            <FormInput value={form.full_name} onChange={(v) => { setForm({ ...form, full_name: v }); setErrors({}); }} placeholder="Driver name" />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Phone">
              <FormInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="Phone" />
            </FormField>
            <FormField label="ID Number">
              <FormInput value={form.id_number} onChange={(v) => setForm({ ...form, id_number: v })} placeholder="ID number" />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Vehicle Type">
              <FormInput value={form.vehicle_type} onChange={(v) => setForm({ ...form, vehicle_type: v })} placeholder="e.g. Truck" />
            </FormField>
            <FormField label="Plate Number">
              <FormInput value={form.vehicle_plate_number} onChange={(v) => setForm({ ...form, vehicle_plate_number: v })} placeholder="Plate #" />
            </FormField>
          </div>
          <FormField label="Address">
            <FormTextarea value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="Address" rows={2} />
          </FormField>
          <FormField label="Notes">
            <FormTextarea value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Notes" rows={2} />
          </FormField>
          <FormField label="Status">
            <FormSelect value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={USER_STATUSES.map((status) => ({ value: status, label: status }))} />
          </FormField>
          <SubmitButton loading={saving}>{editing ? 'Update' : 'Create'}</SubmitButton>
        </form>
      </Modal>

      <Modal open={!!balanceModal} title={`Balance - ${balanceModal?.driver?.full_name || ''}`} onClose={() => setBalanceModal(null)} width="380px">
        <div style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Open Balance</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: Number(balanceModal?.balance || 0) > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
            ${Number(balanceModal?.balance || 0).toFixed(2)}
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Permanently Delete Driver"
        message={`Delete ${deleteTarget?.full_name}? Drivers linked to stock requests or payments cannot be permanently deleted.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
