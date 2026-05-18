import React, { useState } from 'react';
import TabBar from '../../components/TabBar.jsx';
import DriversTab from './DriversTab.jsx';
import StockRequestsTab from './StockRequestsTab.jsx';
import PaymentsTab from './PaymentsTab.jsx';

const TABS = [
  { key: 'stock-requests', label: 'Stock Requests' },
  { key: 'drivers', label: 'Drivers' },
  { key: 'payments', label: 'Payments' }
];

export default function FleetPage() {
  const [activeTab, setActiveTab] = useState('stock-requests');

  return (
    <div>
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      {activeTab === 'stock-requests' && <StockRequestsTab />}
      {activeTab === 'drivers' && <DriversTab />}
      {activeTab === 'payments' && <PaymentsTab />}
    </div>
  );
}
