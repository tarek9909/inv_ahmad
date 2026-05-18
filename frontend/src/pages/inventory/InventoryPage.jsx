import React, { useState } from 'react';
import TabBar from '../../components/TabBar.jsx';
import CategoriesTab from './CategoriesTab.jsx';
import SuppliersTab from './SuppliersTab.jsx';
import ItemsTab from './ItemsTab.jsx';
import PurchaseOrdersTab from './PurchaseOrdersTab.jsx';
import StockMovementsTab from './StockMovementsTab.jsx';

const TABS = [
  { key: 'items', label: 'Items' },
  { key: 'categories', label: 'Categories' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'purchase-orders', label: 'Purchase Orders' },
  { key: 'stock-movements', label: 'Stock Movements' }
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('items');

  return (
    <div>
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      {activeTab === 'items' && <ItemsTab />}
      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'suppliers' && <SuppliersTab />}
      {activeTab === 'purchase-orders' && <PurchaseOrdersTab />}
      {activeTab === 'stock-movements' && <StockMovementsTab />}
    </div>
  );
}
