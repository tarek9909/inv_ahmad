import React, { useEffect, useState } from 'react';
import { Plus, Edit, Shield } from 'lucide-react';
import DataTable, { ActionButton, StatusBadge } from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import FormField, { FormInput, FormSelect, SubmitButton } from '../components/FormField.jsx';
import { toast } from '../components/Toast.jsx';
import { adminStores } from '../state/index.js';
import { useStore } from '../hooks/useStore.js';
import { USER_STATUSES } from '../domain/index.js';

const columns = [
  { key: 'full_name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', render: (row) => row.role?.name || '—' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
];

export default function TeamPage() {
  const { rows, meta, loading, error } = useStore(adminStores.users);
  const rolesState = useStore(adminStores.roles);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [statusModal, setStatusModal] = useState(null);

  useEffect(() => {
    adminStores.users.load();
    adminStores.roles.load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ full_name: '', email: '', password: '', role_id: '' });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ full_name: row.full_name || '', email: row.email || '', role_id: row.role_id || '' });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!editing && (!form.password || form.password.length < 6)) errs.password = 'Min 6 characters';
    if (!form.role_id) errs.role_id = 'Role is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      if (editing) {
        await adminStores.users.update(editing.id, { full_name: form.full_name, email: form.email, role_id: form.role_id });
        toast.success('User updated');
      } else {
        await adminStores.users.create(form);
        toast.success('User created');
      }
      setModalOpen(false);
      adminStores.users.load();
    } catch (err) {
      toast.error(err?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await adminStores.users.setStatus(statusModal.id, status);
      toast.success(`User status changed to ${status}`);
      adminStores.users.load();
    } catch (err) {
      toast.error(err?.message || 'Failed to change status');
    }
    setStatusModal(null);
  };

  const roleOptions = (rolesState.rows || []).map((r) => ({ value: r.id, label: r.name }));

  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        meta={meta}
        loading={loading}
        error={error}
        onLoad={(filters) => adminStores.users.load(filters)}
        toolbar={
          <button className="glass-button" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={openCreate}>
            <Plus size={16} /> Add User
          </button>
        }
        actions={(row) => (
          <>
            <ActionButton icon={Edit} label="Edit" onClick={() => openEdit(row)} />
            <ActionButton icon={Shield} label="Change Status" onClick={() => setStatusModal(row)} color="var(--accent-purple)" />
          </>
        )}
      />

      {/* Create/Edit User Modal */}
      <Modal open={modalOpen} title={editing ? 'Edit User' : 'Add User'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <FormField label="Full Name" required error={errors.full_name}>
            <FormInput value={form.full_name} onChange={(v) => { setForm({ ...form, full_name: v }); setErrors({ ...errors, full_name: null }); }} placeholder="Full name" />
          </FormField>
          <FormField label="Email" required error={errors.email}>
            <FormInput type="email" value={form.email} onChange={(v) => { setForm({ ...form, email: v }); setErrors({ ...errors, email: null }); }} placeholder="Email" />
          </FormField>
          {!editing && (
            <FormField label="Password" required error={errors.password}>
              <FormInput type="password" value={form.password} onChange={(v) => { setForm({ ...form, password: v }); setErrors({ ...errors, password: null }); }} placeholder="Min 6 characters" />
            </FormField>
          )}
          <FormField label="Role" required error={errors.role_id}>
            <FormSelect value={form.role_id} onChange={(v) => { setForm({ ...form, role_id: v }); setErrors({ ...errors, role_id: null }); }} options={roleOptions} placeholder="Select role" />
          </FormField>
          <SubmitButton loading={saving}>{editing ? 'Update' : 'Create'}</SubmitButton>
        </form>
      </Modal>

      {/* Status Change Modal */}
      <Modal open={!!statusModal} title={`Change Status — ${statusModal?.full_name}`} onClose={() => setStatusModal(null)} width="360px">
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>Select new status:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {USER_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={statusModal?.status === status}
              style={{
                background: statusModal?.status === status ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                padding: '10px 16px',
                borderRadius: '10px',
                cursor: statusModal?.status === status ? 'default' : 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                textTransform: 'capitalize',
                opacity: statusModal?.status === status ? 0.5 : 1
              }}
            >
              {status} {statusModal?.status === status && '(current)'}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
