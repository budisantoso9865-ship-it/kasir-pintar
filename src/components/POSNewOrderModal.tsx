import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  User,
  Phone,
  Sparkles,
  Shirt,
  Wind,
  Check,
  Gift,
  Coins,
  ShieldCheck,
  Leaf,
  HeartHandshake,
  Zap,
  Minus,
  Plus,
} from 'lucide-react';
import {
  CustomerMember,
  DetergentOption,
  FragranceOption,
  LaundryMachine,
  LaundryOrder,
  PaymentMethod,
  ServiceType,
  StoreProfile,
  UserSession,
} from '../types';
import { formatRupiah } from '../utils/receiptGenerator';

interface POSNewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOrder: (newOrder: LaundryOrder, updatedMember?: CustomerMember) => void;
  members: CustomerMember[];
  detergents: DetergentOption[];
  fragrances: FragranceOption[];
  machines: LaundryMachine[];
  store: StoreProfile;
  session: UserSession | null;
}

export const POSNewOrderModal: React.FC<POSNewOrderModalProps> = ({
  isOpen,
  onClose,
  onSaveOrder,
  members,
  detergents,
  fragrances,
  machines,
  store,
  session,
}) => {
  // Form States
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CustomerMember | null>(null);

  const [serviceType, setServiceType] = useState<ServiceType>('wash_dry');
  const [weightKg, setWeightKg] = useState<number>(7);
  const [washerMachineId, setWasherMachineId] = useState<string>('');
  const [dryerMachineId, setDryerMachineId] = useState<string>('');

  // Quantities for Detergents and Fragrances (supporting e.g. 3 soaps, 2 fragrances)
  const [detergentQuantities, setDetergentQuantities] = useState<{ [id: string]: number }>(() => ({
    [detergents[0]?.id || 'det-1']: 1,
  }));

  const [fragranceQuantities, setFragranceQuantities] = useState<{ [id: string]: number }>(() => ({
    [fragrances[0]?.id || 'frag-1']: 1,
  }));

  const updateDetergentQty = (id: string, delta: number) => {
    setDetergentQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const updateFragranceQty = (id: string, delta: number) => {
    setFragranceQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const [useFreeWashReward, setUseFreeWashReward] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [notes, setNotes] = useState('');

  // Add-ons
  const [includePlastik, setIncludePlastik] = useState(true);
  const [includeDryerSheet, setIncludeDryerSheet] = useState(false);

  // Available machines filtered
  const availableWashers = machines.filter(
    (m) => m.type === 'washer' && m.status === 'available'
  );
  const availableDryers = machines.filter(
    (m) => m.type === 'dryer' && m.status === 'available'
  );

  // Auto assign first available machines when opening
  useEffect(() => {
    if (isOpen) {
      if (!washerMachineId && availableWashers.length > 0) {
        setWasherMachineId(availableWashers[0].id);
      }
      if (!dryerMachineId && availableDryers.length > 0) {
        setDryerMachineId(availableDryers[0].id);
      }
    }
  }, [isOpen, availableWashers, availableDryers, washerMachineId, dryerMachineId]);

  // Phone lookup for existing member
  useEffect(() => {
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 4) {
      const found = members.find((m) => m.phone.replace(/[^0-9]/g, '').includes(cleanPhone));
      if (found) {
        setSelectedMember(found);
        setCustomerName(found.name);
        setIsMember(true);
        if (found.availableFreeWashVouchers > 0) {
          setUseFreeWashReward(true);
        }
      }
    }
  }, [customerPhone, members]);

  if (!isOpen) return null;

  // Calculation logic
  const washerCoins = serviceType === 'dry_only' ? 0 : weightKg > 10 ? 2 : 1;
  const dryerCoins = serviceType === 'wash_only' ? 0 : weightKg > 10 ? 2 : 1;

  const washerCost = washerCoins * store.washerCoinPrice;
  const dryerCost = dryerCoins * store.dryerCoinPrice;

  // Detergents selection list with quantities
  const selectedDetergentsList = detergents
    .filter((d) => (detergentQuantities[d.id] || 0) > 0)
    .map((d) => {
      const qty = detergentQuantities[d.id] || 0;
      return {
        id: d.id,
        name: d.name,
        price: d.price,
        qty,
        subtotal: d.price * qty,
      };
    });

  // Fragrances selection list with quantities
  const selectedFragrancesList = fragrances
    .filter((f) => (fragranceQuantities[f.id] || 0) > 0)
    .map((f) => {
      const qty = fragranceQuantities[f.id] || 0;
      return {
        id: f.id,
        name: f.name,
        price: f.price,
        qty,
        subtotal: f.price * qty,
        aromaGroup: f.aromaGroup,
        colorHex: f.colorHex,
      };
    });

  const totalDetergentCost = selectedDetergentsList.reduce((sum, item) => sum + item.subtotal, 0);
  const totalFragranceCost = selectedFragrancesList.reduce((sum, item) => sum + item.subtotal, 0);

  const totalDetergentCount = selectedDetergentsList.reduce((sum, item) => sum + item.qty, 0);
  const totalFragranceCount = selectedFragrancesList.reduce((sum, item) => sum + item.qty, 0);

  const primaryDetergent = selectedDetergentsList[0] || {
    id: 'none',
    name: 'Tanpa Sabun',
    price: 0,
    qty: 0,
    subtotal: 0,
  };

  const primaryFragrance = selectedFragrancesList[0] || {
    id: 'none',
    name: 'Tanpa Pewangi',
    price: 0,
    qty: 0,
    subtotal: 0,
  };

  const detergentSummaryText =
    selectedDetergentsList.length > 0
      ? selectedDetergentsList.map((d) => `${d.qty}x ${d.name}`).join(', ')
      : 'Tanpa Sabun';

  const fragranceSummaryText =
    selectedFragrancesList.length > 0
      ? selectedFragrancesList.map((f) => `${f.qty}x ${f.name}`).join(', ')
      : 'Tanpa Pewangi';

  const addOns: { id: string; name: string; price: number; qty: number }[] = [];
  if (includePlastik) {
    addOns.push({
      id: 'add-plastik',
      name: 'Plastik Laundry Tebal',
      price: 2000,
      qty: 1,
    });
  }
  if (includeDryerSheet) {
    addOns.push({
      id: 'add-sheet',
      name: 'Sheet Anti-Kusut & Anti-Statis',
      price: 2500,
      qty: 1,
    });
  }

  const addOnsTotal = addOns.reduce((sum, item) => sum + item.price * item.qty, 0);
  const subtotal = washerCost + dryerCost + totalDetergentCost + totalFragranceCost + addOnsTotal;

  // Free wash voucher discount: Free 1x washer coin
  let discount = 0;
  if (useFreeWashReward && (selectedMember?.availableFreeWashVouchers || 0) > 0 && washerCoins > 0) {
    discount = store.washerCoinPrice; // Free 1x washer coin value (Rp 10.000)
  }

  const finalPrice = Math.max(0, subtotal - discount);

  // Time estimate
  const totalMinutes =
    (serviceType !== 'dry_only' ? store.washTimeMinutes : 0) +
    (serviceType !== 'wash_only' ? store.dryTimeMinutes : 0) +
    10; // 10 min prep/buffer
  const estimatedReadyTime = new Date(Date.now() + totalMinutes * 60000).toISOString();

  const handleSelectMember = (mbr: CustomerMember) => {
    setSelectedMember(mbr);
    setCustomerName(mbr.name);
    setCustomerPhone(mbr.phone);
    setIsMember(true);
    if (mbr.availableFreeWashVouchers > 0) {
      setUseFreeWashReward(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Mohon isi nama dan nomor WhatsApp pelanggan.');
      return;
    }

    const orderId = `LND-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;

    const newOrder: LaundryOrder = {
      id: orderId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      isMember,
      memberId: selectedMember?.id,
      serviceType,
      weightKg: Number(weightKg),
      washerCoins,
      dryerCoins,
      washerMachineId: serviceType !== 'dry_only' ? washerMachineId : undefined,
      dryerMachineId: serviceType !== 'wash_only' ? dryerMachineId : undefined,
      detergentId: primaryDetergent.id,
      detergentName: detergentSummaryText,
      detergentPrice: totalDetergentCost,
      selectedDetergents: selectedDetergentsList,
      fragranceId: primaryFragrance.id,
      fragranceName: fragranceSummaryText,
      fragrancePrice: totalFragranceCost,
      fragranceAroma: selectedFragrancesList.map((f) => f.aromaGroup).filter(Boolean).join(', '),
      selectedFragrances: selectedFragrancesList,
      addOns,
      subtotal,
      discount,
      finalPrice,
      paymentMethod,
      paymentStatus: 'paid',
      status: serviceType === 'dry_only' ? 'drying' : 'washing',
      statusHistory: {
        queueAt: new Date().toISOString(),
        washingAt: serviceType !== 'dry_only' ? new Date().toISOString() : undefined,
        dryingAt: serviceType === 'dry_only' ? new Date().toISOString() : undefined,
      },
      estimatedReadyTime,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      freeWashClaimed: useFreeWashReward && discount > 0,
      assignedBy: session?.username,
      shiftId: session?.role === 'shift_pagi' ? 'pagi' : session?.role === 'shift_sore' ? 'sore' : undefined,
    };

    // Member update logic
    let updatedMember: CustomerMember | undefined;
    if (isMember) {
      if (selectedMember) {
        updatedMember = { ...selectedMember };
      } else {
        // Register new member automatically!
        updatedMember = {
          id: `MBR-${String(members.length + 1).padStart(3, '0')}`,
          name: customerName.trim(),
          phone: customerPhone.trim(),
          joinedDate: new Date().toISOString().split('T')[0],
          washCount: 0,
          totalCompletedWashes: 0,
          availableFreeWashVouchers: 0,
          totalSpent: 0,
        };
      }

      updatedMember.totalCompletedWashes += 1;
      updatedMember.totalSpent += finalPrice;

      if (useFreeWashReward && updatedMember.availableFreeWashVouchers > 0) {
        updatedMember.availableFreeWashVouchers -= 1;
      } else {
        // Normal wash progression towards 10x reward
        updatedMember.washCount += 1;
        if (updatedMember.washCount >= 10) {
          updatedMember.availableFreeWashVouchers += 1;
          updatedMember.washCount = 0; // Reset for next cycle

          // Trigger celebratory confetti for 10th wash!
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    }

    onSaveOrder(newOrder, updatedMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-5 h-5 text-sky-600" />
              Transaksi Kasir Pintar Baru
            </h2>
            <p className="text-xs text-slate-500">
              Input data pelanggan, pilihan koin, mesin, deterjen, & aroma softener
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Customer & Member info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Data Pelanggan & Member
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Daftar / Mode Member</span>
                <input
                  type="checkbox"
                  id="member-toggle"
                  checked={isMember}
                  onChange={(e) => setIsMember(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nomor WhatsApp Pelanggan *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nama Lengkap Pelanggan *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Member Selector or Loyalty Badge */}
            {selectedMember ? (
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Member Terdaftar: {selectedMember.name}</span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Progres Loyalitas: <strong className="font-bold">{selectedMember.washCount}/10 Cuci</strong>
                    {selectedMember.availableFreeWashVouchers > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-emerald-600 text-white font-bold rounded-xs text-[10px]">
                        {selectedMember.availableFreeWashVouchers}x Cuci Gratis Tersedia!
                      </span>
                    )}
                  </p>
                </div>

                {selectedMember.availableFreeWashVouchers > 0 && (
                  <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-emerald-300 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={useFreeWashReward}
                      onChange={(e) => setUseFreeWashReward(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-emerald-800">Klaim Cuci Gratis 1x</span>
                  </label>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 self-center">Pilih cepat member:</span>
                {members.slice(0, 3).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMember(m)}
                    className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    {m.name} ({m.washCount}/10)
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Service & Machine Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              2. Layanan & Mesin Koin
            </label>

            {/* Service Type Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setServiceType('wash_dry')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  serviceType === 'wash_dry'
                    ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Cuci + Kering (Combo)
              </button>

              <button
                type="button"
                onClick={() => setServiceType('wash_only')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  serviceType === 'wash_only'
                    ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Cuci Saja (Wash Only)
              </button>

              <button
                type="button"
                onClick={() => setServiceType('dry_only')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  serviceType === 'dry_only'
                    ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Kering Saja (Dry Only)
              </button>
            </div>

            {/* Weight and Machine selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Berat Cucian (Kg)
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="25"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono-numbers"
                  />
                  <span className="ml-2 text-xs text-slate-500 whitespace-nowrap">
                    ({washerCoins} Koin Cuci, {dryerCoins} Kering)
                  </span>
                </div>
              </div>

              {serviceType !== 'dry_only' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Pilih Mesin Cuci (Washer)
                  </label>
                  <select
                    value={washerMachineId}
                    onChange={(e) => setWasherMachineId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                  >
                    {availableWashers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.capacityKg}kg)
                      </option>
                    ))}
                    {availableWashers.length === 0 && (
                      <option value="">Semua Washer Sedang Penuh</option>
                    )}
                  </select>
                </div>
              )}

              {serviceType !== 'wash_only' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Pilih Mesin Kering (Dryer)
                  </label>
                  <select
                    value={dryerMachineId}
                    onChange={(e) => setDryerMachineId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                  >
                    {availableDryers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.capacityKg}kg)
                      </option>
                    ))}
                    {availableDryers.length === 0 && (
                      <option value="">Semua Dryer Sedang Penuh</option>
                    )}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Sabun / Deterjen Selection with Quantities */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  3. Pilihan Sabun / Deterjen & Jumlah Sachet
                </label>
                <span className="text-[11px] text-slate-500">
                  Bisa beli lebih dari 1 sachet (misal: 2 atau 3 sabun)
                </span>
              </div>
              <span className="text-xs font-bold font-mono-numbers px-2.5 py-1 bg-sky-100 text-sky-800 rounded-lg">
                Total: {totalDetergentCount} Sachet ({formatRupiah(totalDetergentCost)})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {detergents.map((det) => {
                const qty = detergentQuantities[det.id] || 0;
                const isSelected = qty > 0;
                return (
                  <div
                    key={det.id}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-semibold text-xs text-slate-900">{det.name}</span>
                        <span className="text-xs font-mono-numbers font-bold text-slate-700 shrink-0">
                          {det.price === 0 ? 'Include Koin' : `@${formatRupiah(det.price)}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{det.description}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Stok: {det.stockPacks} sachet
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5">
                        {qty > 0 ? (
                          <div className="flex items-center bg-white rounded-lg border border-sky-300 shadow-2xs p-0.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateDetergentQty(det.id, -1);
                              }}
                              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Kurangi 1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold font-mono-numbers text-sky-900">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateDetergentQty(det.id, 1);
                              }}
                              className="w-6 h-6 flex items-center justify-center text-sky-700 hover:bg-sky-50 rounded-md transition-colors"
                              title="Tambah 1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateDetergentQty(det.id, 1)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Pilih Sabun</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Pewangi / Softener Selection with Quantities */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  4. Pilihan Aroma Pewangi & Jumlah Botol/Cup
                </label>
                <span className="text-[11px] text-slate-500">
                  Bisa beli lebih dari 1 aroma (misal: 2 atau 3 pewangi)
                </span>
              </div>
              <span className="text-xs font-bold font-mono-numbers px-2.5 py-1 bg-pink-100 text-pink-800 rounded-lg">
                Total: {totalFragranceCount} Cup ({formatRupiah(totalFragranceCost)})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {fragrances.map((frag) => {
                const qty = fragranceQuantities[frag.id] || 0;
                const isSelected = qty > 0;
                return (
                  <div
                    key={frag.id}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50/40 ring-1 ring-pink-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: frag.colorHex }}
                        />
                        <span className="text-xs font-bold text-slate-900 truncate">{frag.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{frag.aromaGroup}</div>
                      <div className="mt-1 text-[11px] font-mono-numbers font-medium text-slate-700">
                        {frag.price === 0 ? 'Gratis' : `@${formatRupiah(frag.price)}`}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {qty > 0 && frag.price > 0 ? formatRupiah(frag.price * qty) : ''}
                      </span>

                      {/* Quantity Stepper */}
                      {qty > 0 ? (
                        <div className="flex items-center bg-white rounded-lg border border-pink-300 shadow-2xs p-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateFragranceQty(frag.id, -1);
                            }}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Kurangi 1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold font-mono-numbers text-pink-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateFragranceQty(frag.id, 1);
                            }}
                            className="w-5 h-5 flex items-center justify-center text-pink-700 hover:bg-pink-50 rounded transition-colors"
                            title="Tambah 1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateFragranceQty(frag.id, 1)}
                          className="px-2 py-0.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-pink-50 hover:text-pink-700 rounded-md transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Pilih</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Addons & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Catatan Khusus Cucian
              </label>
              <input
                type="text"
                placeholder="Contoh: Pisahkan pakaian putih, lipat rapi"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Opsi Tambahan Packing
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePlastik}
                    onChange={(e) => setIncludePlastik(e.target.checked)}
                    className="w-3.5 h-3.5 text-sky-600 rounded"
                  />
                  <span>Plastik Laundry Tebal (+Rp 2.000)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDryerSheet}
                    onChange={(e) => setIncludeDryerSheet(e.target.checked)}
                    className="w-3.5 h-3.5 text-sky-600 rounded"
                  />
                  <span>Dryer Sheet Anti-Kusut (+Rp 2.500)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 6: Payment Method & Total Summary */}
          <div className="pt-3 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['qris', 'cash', 'transfer'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 px-2 text-xs font-bold uppercase rounded-lg border transition-colors ${
                        paymentMethod === method
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="text-right">
                <div className="text-xs text-slate-500">
                  Subtotal: <span className="font-mono-numbers">{formatRupiah(subtotal)}</span>
                  {discount > 0 && (
                    <span className="text-emerald-600 font-bold ml-2">
                      -Voucher: {formatRupiah(discount)}
                    </span>
                  )}
                </div>
                <div className="text-xl font-black text-slate-900 font-mono-numbers mt-0.5">
                  {formatRupiah(finalPrice)}
                </div>
                <p className="text-[11px] text-slate-400">
                  Estimasi Selesai: {totalMinutes} menit ({new Date(estimatedReadyTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
              >
                <Coins className="w-4 h-4" />
                Simpan & Buat Nota Struk
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
