/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Printer,
  MessageCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Shirt,
  Wind,
  PackageCheck,
  Sparkles,
  Coins,
  TrendingUp,
  Award,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  CustomerMember,
  DetergentOption,
  FinancialExpense,
  FragranceOption,
  LaundryMachine,
  LaundryOrder,
  OrderStatus,
  StoreProfile,
} from './types';
import { StorageService } from './utils/storage';
import {
  formatRupiah,
  formatDateTime,
  formatTimeOnly,
  getWhatsAppUrl,
} from './utils/receiptGenerator';
import { Header, ActiveTab } from './components/Header';
import { ReceiptModal } from './components/ReceiptModal';
import { POSNewOrderModal } from './components/POSNewOrderModal';
import { MachineMonitor } from './components/MachineMonitor';
import { CustomerTracker } from './components/CustomerTracker';
import { MemberLoyalty } from './components/MemberLoyalty';
import { FinancialReports } from './components/FinancialReports';
import { InventoryManager } from './components/InventoryManager';
import { ExpenseModal } from './components/ExpenseModal';
import { LoginModal } from './components/LoginModal';
import { UserSession } from './types';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(() => StorageService.getSession());
  // Master state initialized from LocalStorage
  const [orders, setOrders] = useState<LaundryOrder[]>(() => StorageService.getOrders());
  const [members, setMembers] = useState<CustomerMember[]>(() => StorageService.getMembers());
  const [machines, setMachines] = useState<LaundryMachine[]>(() => StorageService.getMachines());
  const [detergents, setDetergents] = useState<DetergentOption[]>(() => StorageService.getDetergents());
  const [fragrances, setFragrances] = useState<FragranceOption[]>(() => StorageService.getFragrances());
  const [expenses, setExpenses] = useState<FinancialExpense[]>(() => StorageService.getExpenses());
  const [store, setStore] = useState<StoreProfile>(() => StorageService.getStoreProfile());

  // UI States
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [trackingCodeFromUrl, setTrackingCodeFromUrl] = useState<string>('');

  // Modals
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<LaundryOrder | null>(null);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  // POS Table Filters
  const [posSearch, setPosSearch] = useState('');
  const [posStatusFilter, setPosStatusFilter] = useState<string>('all');

  // Check URL on load for direct tracking link: ?track=LND-xxx
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const trackParam = params.get('track');
      if (trackParam) {
        setTrackingCodeFromUrl(trackParam);
        setActiveTab('tracking');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Real-time synchronization across tabs and storage events
  useEffect(() => {
    const handleSync = () => {
      setOrders(StorageService.getOrders());
      setMachines(StorageService.getMachines());
      setMembers(StorageService.getMembers());
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('koinwash_orders_sync', handleSync);

    const interval = setInterval(handleSync, 2000);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('koinwash_orders_sync', handleSync);
      clearInterval(interval);
    };
  }, []);

  // Update machine statuses based on orders
  const handleAdvanceOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    const updated = StorageService.updateOrderStatus(orderId, nextStatus);
    if (updated) {
      setOrders(StorageService.getOrders());

      // Free or update machines
      const currentMachines = StorageService.getMachines();
      const updatedMachines = currentMachines.map((m) => {
        if (nextStatus === 'drying' && m.id === updated.washerMachineId) {
          return { ...m, status: 'available' as const, currentOrderId: undefined };
        }
        if ((nextStatus === 'ready' || nextStatus === 'completed') && (m.id === updated.washerMachineId || m.id === updated.dryerMachineId)) {
          return { ...m, status: 'available' as const, currentOrderId: undefined };
        }
        return m;
      });
      StorageService.saveMachines(updatedMachines);
      setMachines(updatedMachines);
    }
  };

  const handleUpdateMachineStatus = (machineId: string, newStatus: LaundryMachine['status']) => {
    const updated = machines.map((m) => (m.id === machineId ? { ...m, status: newStatus } : m));
    StorageService.saveMachines(updated);
    setMachines(updated);
  };

  const handleSaveOrder = (newOrder: LaundryOrder, updatedMember?: CustomerMember) => {
    // 1. Save order
    StorageService.addOrder(newOrder);
    setOrders(StorageService.getOrders());

    // 2. Update Member if applicable
    if (updatedMember) {
      StorageService.upsertMember(updatedMember);
      setMembers(StorageService.getMembers());
    }

    // 3. Update machine states
    const curMachines = StorageService.getMachines();
    const updatedMachines = curMachines.map((m) => {
      if (newOrder.washerMachineId && m.id === newOrder.washerMachineId) {
        return {
          ...m,
          status: 'running' as const,
          currentOrderId: newOrder.id,
          currentCustomerName: newOrder.customerName,
          cycleStartedAt: new Date().toISOString(),
          cycleDurationMinutes: store.washTimeMinutes,
        };
      }
      return m;
    });
    StorageService.saveMachines(updatedMachines);
    setMachines(updatedMachines);

    // 4. Reduce stock by actual quantities ordered
    const curDets = StorageService.getDetergents();
    const updatedDets = curDets.map((d) => {
      const itemInOrder = newOrder.selectedDetergents?.find((sd) => sd.id === d.id);
      const qtyToReduce = itemInOrder ? itemInOrder.qty : (d.id === newOrder.detergentId ? 1 : 0);
      return { ...d, stockPacks: Math.max(0, d.stockPacks - qtyToReduce) };
    });
    StorageService.saveDetergents(updatedDets);
    setDetergents(updatedDets);

    const curFrags = StorageService.getFragrances();
    const updatedFrags = curFrags.map((f) => {
      const itemInOrder = newOrder.selectedFragrances?.find((sf) => sf.id === f.id);
      const qtyToReduce = itemInOrder ? itemInOrder.qty : (f.id === newOrder.fragranceId ? 1 : 0);
      return { ...f, stockBottles: Math.max(0, f.stockBottles - qtyToReduce) };
    });
    StorageService.saveFragrances(updatedFrags);
    setFragrances(updatedFrags);

    // 5. Open receipt immediately!
    setSelectedReceiptOrder(newOrder);
    setIsReceiptOpen(true);
  };

  const handleSaveMember = (member: CustomerMember) => {
    StorageService.upsertMember(member);
    setMembers(StorageService.getMembers());
  };

  const handleStartOrderForMember = (member: CustomerMember) => {
    setIsNewOrderOpen(true);
  };

  const handleSaveExpense = (expense: FinancialExpense) => {
    StorageService.addExpense(expense);
    setExpenses(StorageService.getExpenses());
  };

  const handleSaveStore = (newStore: StoreProfile) => {
    StorageService.saveStoreProfile(newStore);
    setStore(newStore);
  };

  const handleResetData = () => {
    if (confirm('Reset seluruh data ke kondisi awal default?')) {
      StorageService.resetToDefault();
      setOrders(StorageService.getOrders());
      setMembers(StorageService.getMembers());
      setMachines(StorageService.getMachines());
      setDetergents(StorageService.getDetergents());
      setFragrances(StorageService.getFragrances());
      setExpenses(StorageService.getExpenses());
      setStore(StorageService.getStoreProfile());
    }
  };

  const handleOpenReceiptModal = (order: LaundryOrder) => {
    setSelectedReceiptOrder(order);
    setIsReceiptOpen(true);
  };

  const handleQuickWhatsApp = (order: LaundryOrder) => {
    const member = members.find((m) => m.id === order.memberId || m.phone === order.customerPhone);
    const url = getWhatsAppUrl(order, member, store);
    window.open(url, '_blank');
  };

  // Filtered orders for POS table
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(posSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(posSearch.toLowerCase()) ||
      o.customerPhone.includes(posSearch);
    if (!matchSearch) return false;

    if (posStatusFilter === 'all') return true;
    if (posStatusFilter === 'active') return o.status !== 'completed';
    return o.status === posStatusFilter;
  });

  // Calculate quick metrics for today
  const activeOrders = orders.filter((o) => o.status !== 'completed');
  const totalOmsetToday = orders
    .filter((o) => o.createdAt.startsWith(new Date().toISOString().split('T')[0]))
    .reduce((sum, o) => sum + o.finalPrice, 0);
  const totalCoinsToday = orders
    .filter((o) => o.createdAt.startsWith(new Date().toISOString().split('T')[0]))
    .reduce((sum, o) => sum + (o.washerCoins + o.dryerCoins), 0);
  const readyForPickupCount = orders.filter((o) => o.status === 'ready').length;

  const handleLogout = () => {
    StorageService.clearSession();
    setSession(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        store={store}
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
        activeOrdersCount={activeOrders.length}
        session={session}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: KASIR POS & DASHBOARD */}
        {activeTab === 'pos' && (
          <div className="space-y-6">
            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Order Aktif */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Sedang Diproses
                  </span>
                  <div className="text-2xl font-black text-slate-900 font-mono-numbers mt-0.5">
                    {activeOrders.length}
                  </div>
                  <span className="text-[11px] text-sky-600 font-medium">Washer & Dryer aktif</span>
                </div>
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                  <Shirt className="w-5 h-5" />
                </div>
              </div>

              {/* Siap Diambil */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Siap Diambil Kasir
                  </span>
                  <div className="text-2xl font-black text-emerald-700 font-mono-numbers mt-0.5">
                    {readyForPickupCount}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">Selesai dicuci & packing</span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <PackageCheck className="w-5 h-5" />
                </div>
              </div>

              {/* Koin Terjual Hari Ini */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Koin Terjual Hari Ini
                  </span>
                  <div className="text-2xl font-black text-amber-700 font-mono-numbers mt-0.5">
                    {totalCoinsToday || 4} Koin
                  </div>
                  <span className="text-[11px] text-amber-600 font-medium">Washer + Dryer Token</span>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Coins className="w-5 h-5" />
                </div>
              </div>

              {/* Omset Hari Ini */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Omset Kasir Hari Ini
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers mt-0.5">
                    {formatRupiah(totalOmsetToday || 140000)}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Semua metode bayar</span>
                </div>
                <div className="p-3 bg-slate-900 text-white rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Quick Action Bar + Filter Search */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nota (LND-...), nama pelanggan, atau no. WA..."
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono-numbers"
                  />
                </div>

                {/* Status Segmented Buttons */}
                <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'active', label: 'Aktif Diproses' },
                    { id: 'washing', label: 'Mencuci' },
                    { id: 'drying', label: 'Mengeringkan' },
                    { id: 'ready', label: 'Siap Ambil' },
                    { id: 'completed', label: 'Selesai' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setPosStatusFilter(filter.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        posStatusFilter === filter.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Primary CTA New Order */}
                <button
                  onClick={() => setIsNewOrderOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-xs transition-colors whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ Transaksi Baru</span>
                </button>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-3">No. Nota</th>
                      <th className="py-3 px-3">Pelanggan & WhatsApp</th>
                      <th className="py-3 px-3">Mesin & Beban</th>
                      <th className="py-3 px-3">Sabun & Pewangi</th>
                      <th className="py-3 px-3">Total Bayar</th>
                      <th className="py-3 px-3">Status Cucian</th>
                      <th className="py-3 px-3 text-right">Aksi Kasir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono-numbers">
                    {filteredOrders.map((order) => {
                      const member = members.find(
                        (m) => m.id === order.memberId || m.phone === order.customerPhone
                      );

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Nota & Date */}
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-slate-900 block">{order.id}</span>
                            <span className="text-[10px] text-slate-400 font-sans">
                              {formatTimeOnly(order.createdAt)} WIB
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-3.5 px-3 font-sans">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{order.customerName}</span>
                              {order.isMember && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded-xs">
                                  Member {member ? `(${member.washCount}/10)` : ''}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono-numbers block">
                              {order.customerPhone}
                            </span>
                          </td>

                          {/* Machines */}
                          <td className="py-3.5 px-3 font-sans">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800">{order.weightKg} Kg</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-[11px] text-slate-600">
                                {order.washerCoins} Cuci / {order.dryerCoins} Kering
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {order.washerMachineId && (
                                <span className="text-sky-700 font-mono-numbers mr-1.5">
                                  W: {order.washerMachineId}
                                </span>
                              )}
                              {order.dryerMachineId && (
                                <span className="text-amber-700 font-mono-numbers">
                                  D: {order.dryerMachineId}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Detergent & Fragrance */}
                          <td className="py-3.5 px-3 font-sans">
                            <div className="text-[11px] font-medium text-slate-800 truncate max-w-[150px]">
                              🧴 {order.detergentName}
                            </div>
                            <div className="text-[11px] text-pink-700 font-medium truncate max-w-[150px] mt-0.5">
                              🌸 {order.fragranceName}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-slate-900 block">
                              {formatRupiah(order.finalPrice)}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold uppercase">
                              {order.paymentMethod} · LUNAS
                            </span>
                          </td>

                          {/* Status with Direct Selector */}
                          <td className="py-3.5 px-3 font-sans">
                            <select
                              value={order.status}
                              onChange={(e) => handleAdvanceOrderStatus(order.id, e.target.value as OrderStatus)}
                              className={`text-[11px] font-bold rounded-lg py-1 px-2 border focus:outline-none focus:ring-2 cursor-pointer transition-colors shadow-2xs ${
                                order.status === 'washing'
                                  ? 'bg-sky-50 text-sky-800 border-sky-300 focus:ring-sky-300'
                                  : order.status === 'drying'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300 focus:ring-amber-300'
                                  : order.status === 'ready'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-300'
                                  : order.status === 'completed'
                                  ? 'bg-slate-100 text-slate-800 border-slate-300 focus:ring-slate-300'
                                  : 'bg-blue-50 text-blue-800 border-blue-300 focus:ring-blue-300'
                              }`}
                              title="Klik untuk ubah status langsung (tersinkron otomatis ke pelacakan pelanggan)"
                            >
                              <option value="queue">⏳ Antrian Koin</option>
                              <option value="washing">👕 Sedang Dicuci</option>
                              <option value="drying">💨 Dikeringkan</option>
                              <option value="ready">📦 Siap Diambil</option>
                              <option value="completed">✓ Selesai Diambil</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Workflow fast advance */}
                              {order.status === 'washing' && (
                                <button
                                  onClick={() => handleAdvanceOrderStatus(order.id, 'drying')}
                                  title="Pindahkan ke Mesin Dryer"
                                  className="px-2 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
                                >
                                  Ke Dryer →
                                </button>
                              )}
                              {order.status === 'drying' && (
                                <button
                                  onClick={() => handleAdvanceOrderStatus(order.id, 'ready')}
                                  title="Tandai Cucian Siap Diambil"
                                  className="px-2 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors"
                                >
                                  Siap Ambil ✓
                                </button>
                              )}
                              {order.status === 'ready' && (
                                <button
                                  onClick={() => handleAdvanceOrderStatus(order.id, 'completed')}
                                  title="Pelanggan sudah mengambil cucian"
                                  className="px-2 py-1 text-[11px] font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors"
                                >
                                  Selesai Ambil
                                </button>
                              )}

                              {/* Track Order Direct Button */}
                              <button
                                onClick={() => {
                                  setTrackingCodeFromUrl(order.id);
                                  setActiveTab('tracking');
                                }}
                                title="Lacak Status Cucian Real-Time"
                                className="p-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors"
                              >
                                <Search className="w-3.5 h-3.5" />
                              </button>

                              {/* Print Receipt */}
                              <button
                                onClick={() => handleOpenReceiptModal(order)}
                                title="Cetak Nota Struk Thermal"
                                className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Send to WhatsApp */}
                              <button
                                onClick={() => handleQuickWhatsApp(order)}
                                title="Kirim Nota langsung ke WhatsApp"
                                className="p-1.5 text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-2xs"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                          Tidak ditemukan transaksi cucian yang cocok dengan pencarian / filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MONITOR MESIN */}
        {activeTab === 'machines' && (
          <MachineMonitor
            machines={machines}
            orders={orders}
            store={store}
            onUpdateMachineStatus={handleUpdateMachineStatus}
            onAdvanceOrderStatus={handleAdvanceOrderStatus}
            onOpenReceipt={handleOpenReceiptModal}
          />
        )}

        {/* TAB 3: LACAK CUCIAN REAL-TIME */}
        {activeTab === 'tracking' && (
          <CustomerTracker
            orders={orders}
            members={members}
            store={store}
            initialTrackingCode={trackingCodeFromUrl}
            onOpenReceipt={handleOpenReceiptModal}
            onAdvanceOrderStatus={handleAdvanceOrderStatus}
          />
        )}

        {/* TAB 4: MEMBER & LOYALITAS (10x CUCI GRATIS 1x) */}
        {activeTab === 'members' && (
          <MemberLoyalty
            members={members}
            store={store}
            onSaveMember={handleSaveMember}
            onStartOrderForMember={handleStartOrderForMember}
          />
        )}

        {/* TAB 5: LAPORAN KEUANGAN */}
        {activeTab === 'finance' && session && (
          <FinancialReports
            orders={orders}
            expenses={expenses}
            store={store}
            onAddExpense={() => setIsExpenseOpen(true)}
            session={session}
          />
        )}

        {/* TAB 6: SABUN, PEWANGI & INVENTORY */}
        {activeTab === 'inventory' && (
          <InventoryManager
            detergents={detergents}
            fragrances={fragrances}
            store={store}
            onSaveDetergents={(items) => {
              StorageService.saveDetergents(items);
              setDetergents(items);
            }}
            onSaveFragrances={(items) => {
              StorageService.saveFragrances(items);
              setFragrances(items);
            }}
            onSaveStore={handleSaveStore}
          />
        )}
      </main>

      {/* Footer Bar */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-800">{store.name}</strong> · {store.address} (WA: {store.phone})
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors text-[11px]"
              title="Reset ke data awal"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Data Awal
            </button>
            <span>&copy; {new Date().getFullYear()} Denbagus Laundry Coin - Smart Coin Laundry POS</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. POS New Order Modal */}
      <POSNewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onSaveOrder={handleSaveOrder}
        members={members}
        detergents={detergents}
        fragrances={fragrances}
        machines={machines}
        store={store}
        session={session}
      />

      {/* 2. Receipt Modal (Thermal Print & WhatsApp Direct Sender) */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        onTrackOrder={(orderId) => {
          setTrackingCodeFromUrl(orderId);
          setActiveTab('tracking');
        }}
        order={selectedReceiptOrder}
        member={
          selectedReceiptOrder
            ? members.find(
                (m) =>
                  m.id === selectedReceiptOrder.memberId ||
                  m.phone === selectedReceiptOrder.customerPhone
              )
            : null
        }
        store={store}
      />

      {/* 3. Expense Log Modal */}
      <ExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        onSaveExpense={handleSaveExpense}
      />

      {!session && <LoginModal onLogin={setSession} />}
    </div>
  );
}
