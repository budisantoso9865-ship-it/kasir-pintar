import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Shirt,
  Wind,
  PackageCheck,
  MessageCircle,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
  Coins,
  ExternalLink,
} from 'lucide-react';
import { LaundryOrder, CustomerMember, StoreProfile, OrderStatus } from '../types';
import {
  formatRupiah,
  formatDateTime,
  formatTimeOnly,
  formatWhatsAppPhone,
} from '../utils/receiptGenerator';

interface CustomerTrackerProps {
  orders: LaundryOrder[];
  members: CustomerMember[];
  store: StoreProfile;
  initialTrackingCode?: string;
  onOpenReceipt: (order: LaundryOrder) => void;
  onAdvanceOrderStatus?: (orderId: string, nextStatus: OrderStatus) => void;
}

const findMatchingOrder = (rawQuery: string, orderList: LaundryOrder[]): LaundryOrder | null => {
  const raw = rawQuery.trim();
  if (!raw) return null;
  const q = raw.toUpperCase();
  const cleanNumber = raw.replace(/[^0-9]/g, '');

  return (
    orderList.find((o) => {
      const orderIdUpper = o.id.toUpperCase();
      const customerNameUpper = o.customerName.toUpperCase();
      const orderPhoneClean = o.customerPhone.replace(/[^0-9]/g, '');
      const orderIdClean = o.id.replace(/[^0-9]/g, '');

      // 1. Exact ID
      if (orderIdUpper === q) return true;
      // 2. Partial ID (e.g. "557" or "2026-557")
      if (orderIdUpper.includes(q)) return true;
      // 3. Numbers match (e.g. "557" matches "LND-2026-557")
      if (cleanNumber.length >= 2 && orderIdClean.includes(cleanNumber)) return true;
      // 4. Customer Name match (e.g. "Budi")
      if (customerNameUpper.includes(q)) return true;
      // 5. Phone match (e.g. "83854136944" or "6944")
      if (cleanNumber.length >= 3 && orderPhoneClean.includes(cleanNumber)) return true;
      // 6. Machine match
      if (o.washerMachineId?.toUpperCase() === q || o.dryerMachineId?.toUpperCase() === q) return true;

      return false;
    }) || null
  );
};

export const CustomerTracker: React.FC<CustomerTrackerProps> = ({
  orders,
  members,
  store,
  initialTrackingCode = '',
  onOpenReceipt,
  onAdvanceOrderStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialTrackingCode);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(() => {
    if (initialTrackingCode) {
      const found = findMatchingOrder(initialTrackingCode, orders);
      if (found) return found.id;
    }
    return orders.length > 0 ? orders[0].id : '';
  });
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-find if initial tracking code is provided or changed externally
  useEffect(() => {
    if (initialTrackingCode) {
      setSearchQuery(initialTrackingCode);
      const found = findMatchingOrder(initialTrackingCode, orders);
      if (found) {
        setSelectedOrderId(found.id);
        setErrorMessage('');
      } else {
        setSelectedOrderId('');
        setErrorMessage(`Nota "${initialTrackingCode}" tidak ditemukan di data.`);
      }
    }
  }, [initialTrackingCode, orders]);

  // Keep first order selected only if no initial tracking code was requested and none is active
  useEffect(() => {
    if (!initialTrackingCode && !selectedOrderId && orders.length > 0) {
      setSelectedOrderId(orders[0].id);
      setSearchQuery(orders[0].id);
    }
  }, [orders, selectedOrderId, initialTrackingCode]);

  // DYNAMICALLY DERIVED: ALWAYS 100% in sync with the latest orders prop in real-time!
  const searchedOrder = orders.find((o) => o.id === selectedOrderId) || null;
  const searchedMember = searchedOrder
    ? members.find((m) => m.id === searchedOrder.memberId || m.phone === searchedOrder.customerPhone) || null
    : null;

  const handleSearch = (query: string = searchQuery) => {
    setErrorMessage('');
    const raw = query.trim();
    if (!raw) {
      setErrorMessage('Masukkan No. Nota (contoh: LND-2026-557 atau 557) atau No. WhatsApp / Nama.');
      setSelectedOrderId('');
      return;
    }

    const found = findMatchingOrder(raw, orders);
    if (found) {
      setSelectedOrderId(found.id);
      setSearchQuery(found.id);
      setErrorMessage('');
    } else {
      setSelectedOrderId('');
      setErrorMessage(
        `Nota "${raw}" tidak ditemukan di data lokal. Silakan pilih dari daftar cucian aktif di bawah ini.`
      );
    }
  };

  const getStepStatus = (step: 'queue' | 'washing' | 'drying' | 'ready' | 'completed') => {
    if (!searchedOrder) return 'upcoming';

    const orderStatusOrder = ['queue', 'washing', 'drying', 'ready', 'completed'];
    const currentIdx = orderStatusOrder.indexOf(searchedOrder.status);
    const stepIdx = orderStatusOrder.indexOf(step);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  const calculateMinutesRemaining = (estimatedIso: string) => {
    if (!estimatedIso) return 0;
    const diffMs = new Date(estimatedIso).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / 60000));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Bar Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="max-w-xl mx-auto text-center space-y-2 mb-6">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
            Portal Pelanggan Denbagus Laundry Coin
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Lacak Status Cucian Real-Time
          </h2>
          <p className="text-xs text-slate-500">
            Pantau proses pencucian koin, mesin yang digunakan, wangi softener, dan estimasi waktu selesai.
          </p>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="max-w-md mx-auto flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Contoh: LND-2026-001 atau 081234..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono-numbers"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
          >
            Lacak
          </button>
        </form>

        {/* Quick Recent Tracking Chips */}
        {orders.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
            <span className="text-[11px] text-slate-400">Pilih cepat nota:</span>
            {orders.slice(0, 8).map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setSearchQuery(o.id);
                  handleSearch(o.id);
                }}
                className={`px-2.5 py-1 text-[11px] font-mono-numbers rounded-lg transition-colors border inline-flex items-center gap-1.5 ${
                  searchedOrder?.id === o.id
                    ? 'bg-sky-50 text-sky-700 border-sky-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{o.id} ({o.customerName})</span>
                {o.status === 'ready' && (
                  <span className="px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                    Siap Ambil
                  </span>
                )}
                {o.status === 'completed' && (
                  <span className="px-1 py-0.2 bg-slate-200 text-slate-700 rounded text-[9px] font-bold">
                    Selesai
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 max-w-lg mx-auto p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <div className="pt-2 border-t border-rose-200/60 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-rose-700">Pilih dari nota yang ada:</span>
              <div className="flex flex-wrap gap-1">
                {orders.slice(0, 3).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSearchQuery(o.id);
                      handleSearch(o.id);
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold bg-white text-rose-900 border border-rose-300 rounded hover:bg-rose-100"
                  >
                    Lacak {o.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Searched Order Tracking Card */}
      {searchedOrder && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Status Alert Banner */}
          <div
            className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3 ${
              searchedOrder.status === 'ready'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : searchedOrder.status === 'washing'
                ? 'bg-sky-50 border-sky-200 text-sky-900'
                : searchedOrder.status === 'drying'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : searchedOrder.status === 'completed'
                ? 'bg-slate-100 border-slate-200 text-slate-800'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-2xs">
                {searchedOrder.status === 'washing' && (
                  <Shirt className="w-6 h-6 text-sky-600 animate-spin" />
                )}
                {searchedOrder.status === 'drying' && (
                  <Wind className="w-6 h-6 text-amber-600 animate-pulse" />
                )}
                {searchedOrder.status === 'ready' && (
                  <PackageCheck className="w-6 h-6 text-emerald-600" />
                )}
                {searchedOrder.status === 'completed' && (
                  <CheckCircle2 className="w-6 h-6 text-slate-700" />
                )}
                {searchedOrder.status === 'queue' && (
                  <Clock className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                  Status Terkini Cucian
                </span>
                <h3 className="text-base font-extrabold capitalize">
                  {searchedOrder.status === 'washing' && `Sedang Dicuci di ${searchedOrder.washerMachineId || 'Mesin Washer'}`}
                  {searchedOrder.status === 'drying' && `Sedang Dikeringkan di ${searchedOrder.dryerMachineId || 'Mesin Dryer'}`}
                  {searchedOrder.status === 'ready' && '🎉 Bersih & Wangi! Siap Diambil di Kasir'}
                  {searchedOrder.status === 'completed' && 'Cucian Sudah Selesai Diambil'}
                  {searchedOrder.status === 'queue' && 'Dalam Antrian / Persiapan Koin'}
                </h3>
              </div>
            </div>

            {/* Estimated time or countdown */}
            {searchedOrder.status !== 'ready' && searchedOrder.status !== 'completed' ? (
              <div className="text-right">
                <span className="text-[11px] opacity-75">Estimasi Selesai</span>
                <div className="text-sm font-bold font-mono-numbers">
                  {formatTimeOnly(searchedOrder.estimatedReadyTime)} WIB (~{calculateMinutesRemaining(searchedOrder.estimatedReadyTime)} menit lagi)
                </div>
              </div>
            ) : (
              <button
                onClick={() => onOpenReceipt(searchedOrder)}
                className="px-3 py-1.5 text-xs font-bold bg-white rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
              >
                Lihat Nota Struk
              </button>
            )}
          </div>

          {/* Stepper Progress Bar */}
          <div className="p-6 border-b border-slate-100">
            <div className="grid grid-cols-5 gap-2 relative">
              {[
                { key: 'queue', label: '1. Antrian Masuk', desc: 'Nota Dibuat' },
                { key: 'washing', label: '2. Pencucian', desc: searchedOrder.washerMachineId || 'Washer' },
                { key: 'drying', label: '3. Pengeringan', desc: searchedOrder.dryerMachineId || 'Dryer' },
                { key: 'ready', label: '4. Siap Ambil', desc: 'Lipat & Packing' },
                { key: 'completed', label: '5. Selesai', desc: 'Sudah Diterima' },
              ].map((step, idx) => {
                const status = getStepStatus(step.key as any);
                const isStepFinished =
                  status === 'completed' ||
                  (searchedOrder.status === 'completed' && step.key === 'completed');

                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isStepFinished
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : status === 'current'
                          ? 'bg-sky-600 text-white ring-4 ring-sky-100 animate-pulse'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isStepFinished ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-bold leading-tight ${
                        isStepFinished
                          ? 'text-emerald-800'
                          : status === 'current'
                          ? 'text-sky-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono-numbers mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Live Sync Status & Control Bar */}
            {onAdvanceOrderStatus && !initialTrackingCode && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Status Kasir Terhubung Real-Time
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Setiap status yang diubah di Kasir POS langsung tersinkron di sini otomatis.
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-semibold mr-1">Ubah Status:</span>
                  <button
                    type="button"
                    onClick={() => onAdvanceOrderStatus(searchedOrder.id, 'washing')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      searchedOrder.status === 'washing'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Mencuci
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdvanceOrderStatus(searchedOrder.id, 'drying')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      searchedOrder.status === 'drying'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Keringkan
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdvanceOrderStatus(searchedOrder.id, 'ready')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      searchedOrder.status === 'ready'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Siap Ambil
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdvanceOrderStatus(searchedOrder.id, 'completed')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      searchedOrder.status === 'completed'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Selesai Ambil ✓
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Details Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
            {/* Left Column: Laundry Spec */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Rincian Cucian Koin
                </h4>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor Nota:</span>
                    <span className="font-bold text-slate-900 font-mono-numbers">
                      {searchedOrder.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nama Pelanggan:</span>
                    <span className="font-semibold text-slate-800">{searchedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Waktu Masuk:</span>
                    <span className="text-slate-700">{formatDateTime(searchedOrder.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Berat Cucian:</span>
                    <span className="font-semibold text-slate-800">{searchedOrder.weightKg} Kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Token/Koin:</span>
                    <span className="font-mono-numbers text-slate-700">
                      {searchedOrder.washerCoins} Koin Cuci + {searchedOrder.dryerCoins} Koin Kering
                    </span>
                  </div>
                  {searchedOrder.notes && (
                    <div className="pt-2 border-t border-slate-100 text-slate-600 italic">
                      Catatan: "{searchedOrder.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Soap & Fragrance sensory experience */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Sabun & Formula Aroma Terpilih
                </h4>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-sky-50 rounded-lg text-sky-600 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-900">
                        {searchedOrder.detergentName}
                      </div>
                      {searchedOrder.selectedDetergents && searchedOrder.selectedDetergents.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {searchedOrder.selectedDetergents.map((d) => (
                            <span
                              key={d.id}
                              className="px-2 py-0.5 text-[10px] font-bold bg-sky-50 text-sky-800 rounded-md border border-sky-200 font-mono-numbers"
                            >
                              {d.qty}x {d.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500">
                          Formula busa rendah terkontrol, serat pakaian terlindungi
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
                    <div className="p-2 bg-pink-50 rounded-lg text-pink-600 shrink-0">
                      <Wind className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-pink-900">
                        {searchedOrder.fragranceName}
                      </div>
                      {searchedOrder.selectedFragrances && searchedOrder.selectedFragrances.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {searchedOrder.selectedFragrances.map((f) => (
                            <span
                              key={f.id}
                              className="px-2 py-0.5 text-[10px] font-bold bg-pink-50 text-pink-800 rounded-md border border-pink-200 font-mono-numbers flex items-center gap-1"
                            >
                              {f.colorHex && (
                                <span
                                  className="w-2 h-2 rounded-full inline-block"
                                  style={{ backgroundColor: f.colorHex }}
                                />
                              )}
                              {f.qty}x {f.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500">
                          Keharuman lembut yang menempel tahan lama pada serat pakaian
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Member Loyalty & Help Actions */}
            <div className="space-y-4">
              {/* Member 10x Stamp Card Preview */}
              {searchedMember && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Kartu Loyalitas Member (10x Cuci Gratis 1x)</span>
                    <span className="text-emerald-700 font-bold font-mono-numbers">
                      {searchedMember.washCount}/10
                    </span>
                  </h4>
                  <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-3">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 10 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 text-center transition-all ${
                            idx < searchedMember.washCount
                              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-300'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span className="text-[9px] mt-0.5">#{idx + 1}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                      {searchedMember.availableFreeWashVouchers > 0 ? (
                        <p className="font-bold text-emerald-700 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          Selamat! Anda memiliki {searchedMember.availableFreeWashVouchers}x Voucher Cuci Gratis!
                        </p>
                      ) : (
                        <p className="text-slate-600">
                          Tinggal <strong className="text-slate-900">{10 - searchedMember.washCount}x cuci lagi</strong> untuk mendapatkan reward 1x Cuci Gratis!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Store & Contact Information */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Lokasi & Bantuan Outlet
                </h4>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs">
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">{store.name}</strong>
                      <p className="text-[11px] text-slate-500 mt-0.5">{store.address}</p>
                      {store.mapsUrl && (
                        <a
                          href={store.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 mt-1"
                        >
                          <span>Buka Petunjuk Arah (Google Maps)</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <a
                      href={`https://wa.me/${formatWhatsAppPhone(store.phone)}?text=Halo%20Kasir%20${encodeURIComponent(store.name)},%20saya%20mau%20menanyakan%20status%20cucian%20No%20Nota%20${searchedOrder.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-2xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat Kasir via WhatsApp
                    </a>

                    <button
                      onClick={() => onOpenReceipt(searchedOrder)}
                      className="py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Nota Struk
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
