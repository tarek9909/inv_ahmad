import React, { useState } from 'react';
import { User, Lock, AlertCircle } from 'lucide-react';
import FormField, { FormInput, SubmitButton } from '../components/FormField.jsx';
import { toast } from '../components/Toast.jsx';
import { authStore } from '../state/index.js';
import { useStore } from '../hooks/useStore.js';

export default function ProfilePage() {
  const { user, loading } = useStore(authStore);
  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const saveProfile = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!profile.full_name.trim()) errors.full_name = 'Name is required';
    if (!profile.email.trim()) errors.email = 'Email is required';
    if (Object.keys(errors).length) { setProfileErrors(errors); return; }

    try {
      await authStore.updateProfile(profile);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error?.message || 'Failed to update profile');
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!passwords.current_password) errors.current_password = 'Current password is required';
    if (!passwords.new_password || passwords.new_password.length < 6) errors.new_password = 'Min 6 characters';
    if (passwords.new_password !== passwords.confirm_password) errors.confirm_password = 'Passwords do not match';
    if (Object.keys(errors).length) { setPasswordErrors(errors); return; }

    try {
      await authStore.changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password
      });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Password changed');
    } catch (error) {
      toast.error(error?.message || 'Failed to change password');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
      <section className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <User size={20} color="var(--accent-blue)" />
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Profile</h2>
        </div>
        <form onSubmit={saveProfile}>
          <FormField label="Full Name" required error={profileErrors.full_name}>
            <FormInput value={profile.full_name} onChange={(value) => { setProfile({ ...profile, full_name: value }); setProfileErrors({ ...profileErrors, full_name: null }); }} />
          </FormField>
          <FormField label="Email" required error={profileErrors.email}>
            <FormInput type="email" value={profile.email} onChange={(value) => { setProfile({ ...profile, email: value }); setProfileErrors({ ...profileErrors, email: null }); }} />
          </FormField>
          <FormField label="Phone">
            <FormInput value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} />
          </FormField>
          <SubmitButton loading={loading}>Save Profile</SubmitButton>
        </form>
      </section>

      <section className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Lock size={20} color="var(--accent-purple)" />
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Password</h2>
        </div>
        <form onSubmit={changePassword}>
          <FormField label="Current Password" required error={passwordErrors.current_password}>
            <FormInput type="password" value={passwords.current_password} onChange={(value) => { setPasswords({ ...passwords, current_password: value }); setPasswordErrors({ ...passwordErrors, current_password: null }); }} />
          </FormField>
          <FormField label="New Password" required error={passwordErrors.new_password}>
            <FormInput type="password" value={passwords.new_password} onChange={(value) => { setPasswords({ ...passwords, new_password: value }); setPasswordErrors({ ...passwordErrors, new_password: null }); }} />
          </FormField>
          <FormField label="Confirm New Password" required error={passwordErrors.confirm_password}>
            <FormInput type="password" value={passwords.confirm_password} onChange={(value) => { setPasswords({ ...passwords, confirm_password: value }); setPasswordErrors({ ...passwordErrors, confirm_password: null }); }} />
          </FormField>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>
            <AlertCircle size={14} />
            Password changes apply immediately.
          </div>
          <SubmitButton loading={loading}>Change Password</SubmitButton>
        </form>
      </section>
    </div>
  );
}
