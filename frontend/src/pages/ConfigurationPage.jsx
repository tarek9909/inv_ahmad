import React, { useEffect, useState } from 'react';
import { Printer, Save, Wifi } from 'lucide-react';
import FormField, { FormInput, FormSelect, SubmitButton } from '../components/FormField.jsx';
import { toast } from '../components/Toast.jsx';
import { settingsStore } from '../state/index.js';
import { useStore } from '../hooks/useStore.js';
import { qzPrintService } from '../services/qzPrintService.js';

export default function ConfigurationPage() {
  const { settings, loading, saving } = useStore(settingsStore);
  const [form, setForm] = useState({});
  const [qzStatus, setQzStatus] = useState('');

  useEffect(() => {
    settingsStore.load().then((result) => setForm(result.data || {})).catch(() => {});
  }, []);

  useEffect(() => {
    setForm(settings || {});
  }, [settings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await settingsStore.update(form);
      toast.success('Configuration saved');
    } catch (error) {
      toast.error(error?.message || 'Failed to save configuration');
    }
  };

  const testQz = async () => {
    setQzStatus('Checking QZ Tray...');
    try {
      const result = await qzPrintService.testConnection();
      setQzStatus(`Connected${result.defaultPrinter ? `, default printer: ${result.defaultPrinter}` : ''}`);
    } catch (error) {
      setQzStatus(error?.message || 'QZ Tray is unavailable');
    }
  };

  if (loading && !Object.keys(form).length) return null;

  return (
    <div className="glass-card" style={{ padding: '24px', maxWidth: '760px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Printer size={24} color="var(--accent-blue)" />
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Driver Request Fulfillment</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Choose how accepted driver orders are handled.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <FormField label="Accepted Request Handling">
          <FormSelect
            value={form.accepted_request_fulfillment_mode || 'both'}
            onChange={(value) => setForm({ ...form, accepted_request_fulfillment_mode: value })}
            options={[
              { value: 'print', label: 'Print order only' },
              { value: 'driver_portal', label: 'Driver portal only' },
              { value: 'both', label: 'Print and driver portal' }
            ]}
          />
        </FormField>
        <FormField label="QZ Tray">
          <FormSelect
            value={form.qz_tray_enabled || 'true'}
            onChange={(value) => setForm({ ...form, qz_tray_enabled: value })}
            options={[
              { value: 'true', label: 'Enabled' },
              { value: 'false', label: 'Disabled' }
            ]}
          />
        </FormField>
        <FormField label="Default Printer Name">
          <FormInput value={form.qz_default_printer || ''} onChange={(value) => setForm({ ...form, qz_default_printer: value })} placeholder="Leave empty to use default printer" />
        </FormField>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button type="button" className="glass-button" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={testQz}>
            <Wifi size={16} /> Test QZ Connection
          </button>
          {qzStatus && <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{qzStatus}</span>}
        </div>
        <SubmitButton loading={saving}><Save size={16} /> Save Configuration</SubmitButton>
      </form>
    </div>
  );
}
