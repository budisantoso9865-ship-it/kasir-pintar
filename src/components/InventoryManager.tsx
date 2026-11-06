import React, { useState } from 'react';
import {
  Sparkles,
  Wind,
  Plus,
  Coins,
  Store,
  Check,
  Package,
  Layers,
  Edit2,
  X,
} from 'lucide-react';
import { DetergentOption, FragranceOption, StoreProfile } from '../types';
import { formatRupiah } from '../utils/receiptGenerator';

interface InventoryManagerProps {
  detergents: DetergentOption[];
  fragrances: FragranceOption[];
  store: StoreProfile;
  onSaveDetergents: (items: DetergentOption[]) => void;
  onSaveFragrances: (items: FragranceOption[]) => void;
  onSaveStore: (store: StoreProfile) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  detergents,
  fragrances,
  store,
  onSaveDetergents,
  onSaveFragrances,
  onSaveStore,
}) => {
  // Store form state
  const [storeName, setStoreName] = useState(store.name);
  const [storeBranch, setStoreBranch] = useState(store.branch);
  const [storeAddress, setStoreAddress] = useState(store.address);
  const [storeMapsUrl, setStoreMapsUrl] = useState(store.mapsUrl || '');
  const [storePhone, setStorePhone] = useState(store.phone);
  const [washerPrice, setWasherPrice] = useState(store.washerCoinPrice);
  const [dryerPrice, setDryerPrice] = useState(store.dryerCoinPrice);
  const [isStoreSaved, setIsStoreSaved] = useState(false);

  // Restock modal state
  const [restockItem, setRestockItem] = useState<{
    type: 'detergent' | 'fragrance';
    id: string;
    name: string;
    currentStock: number;
    unit: string;
  } | null>(null);
  const [addQty, setAddQty] = useState<number>(10);

  const handleOpenRestock = (type: 'detergent' | 'fragrance', id: string, name: string, currentStock: number, unit: string) => {
    setRestockItem({ type, id, name, currentStock, unit });
    setAddQty(10);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem || addQty <= 0) return;

    if (restockItem.type === 'detergent') {
      const updated = detergents.map((d) =>
        d.id === restockItem.id ? { ...d, stockPacks: d.stockPacks + Number(addQty) } : d
      );
      onSaveDetergents(updated);
    } else {
      const updated = fragrances.map((f) =>
        f.id === restockItem.id ? { ...f, stockBottles: f.stockBottles + Number(addQty) } : f
      );
      onSaveFragrances(updated);
    }

    setRestockItem(null);
  };

  const handleSaveStoreProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StoreProfile = {
      ...store,
      name: storeName,
      branch: storeBranch,
      address: storeAddress,
      mapsUrl: storeMapsUrl,
      phone: storePhone,
      washerCoinPrice: Number(washerPrice),
      dryerCoinPrice: Number(dryerPrice),
    };
    onSaveStore(updated);
    setIsStoreSaved(true);
    setTimeout(() => setIsStoreSaved(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-600" />
          Manajemen Sabun, Pewangi & Tarif Koin
        </h2>
        <p className="text-xs text-slate-500">
          Owner dapat menambah stok sabun/deterjen & pewangi serta menyesuaikan harga koin laundry
        </p>
      </div>

      {/* 1. Detergent Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Katalog Sabun & Deterjen Laundry
            </h3>
            <p className="text-xs text-slate-500">
              Kelola persediaan sachet/jerigen sabun cuci
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {detergents.map((det) => (
            <div
              key={det.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-xs text-slate-900">{det.name}</h4>
                  <span className="text-xs font-mono-numbers font-bold text-sky-700">
                    {det.price === 0 ? 'Termasuk Koin' : `+${formatRupiah(det.price)}`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{det.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono-numbers">
                  Stok: <strong className="text-slate-800">{det.stockPacks} sachet</strong>
                </span>
                <button
                  onClick={() => handleOpenRestock('detergent', det.id, det.name, det.stockPacks, 'sachet')}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-2xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Stok</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Fragrance Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wind className="w-4 h-4 text-pink-600" />
              Katalog Aroma Pewangi & Softener
            </h3>
            <p className="text-xs text-slate-500">
              Kelola persediaan botol parfum laundry
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {fragrances.map((frag) => (
            <div
              key={frag.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: frag.colorHex }}
                  />
                  <h4 className="font-bold text-xs text-slate-900">{frag.name}</h4>
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-pink-700 mt-0.5">
                  {frag.aromaGroup}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{frag.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono-numbers text-slate-500">
                  Stok: <strong className="text-slate-800">{frag.stockBottles} Botol</strong>
                </span>
                <button
                  onClick={() => handleOpenRestock('fragrance', frag.id, frag.name, frag.stockBottles, 'Botol')}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-pink-600 hover:bg-pink-500 rounded-lg transition-colors shadow-2xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Stok</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Coin Pricing & Store Profile */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-600" />
            Pengaturan Tarif Koin & Informasi Laundry
          </h3>
          <p className="text-xs text-slate-500">
            Data ini akan otomatis dicetak pada nota struk dan pesan WhatsApp pelanggan
          </p>
        </div>

        <form onSubmit={handleSaveStoreProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tarif Koin Cuci (Washer)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400">Rp</span>
                <input
                  type="number"
                  step="1000"
                  value={washerPrice}
                  onChange={(e) => setWasherPrice(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-mono-numbers"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tarif Koin Pengering (Dryer)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400">Rp</span>
                <input
                  type="number"
                  step="1000"
                  value={dryerPrice}
                  onChange={(e) => setDryerPrice(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-mono-numbers"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Usaha Laundry
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cabang / Outlet
              </label>
              <input
                type="text"
                value={storeBranch}
                onChange={(e) => setStoreBranch(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor WhatsApp Kasir / CS
              </label>
              <input
                type="tel"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-mono-numbers"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Lengkap Outlet
              </label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tautan Google Maps Lokasi
              </label>
              <input
                type="url"
                placeholder="https://maps.app.goo.gl/..."
                value={storeMapsUrl}
                onChange={(e) => setStoreMapsUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-mono-numbers text-sky-700"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {isStoreSaved ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Pengaturan Berhasil Disimpan!
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
            >
              Simpan Pengaturan Toko
            </button>
          </div>
        </form>
      </div>

      {/* RESTOCK MODAL */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Tambah Stok {restockItem.type === 'detergent' ? 'Sabun' : 'Pewangi'}
              </h3>
              <button
                onClick={() => setRestockItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRestock} className="p-6 space-y-4">
              <div>
                <span className="text-xs text-slate-500 block">Item Dipilih:</span>
                <strong className="text-sm text-slate-900">{restockItem.name}</strong>
                <p className="text-xs text-slate-400 mt-0.5">
                  Stok saat ini: {restockItem.currentStock} {restockItem.unit}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Penambahan Stok ({restockItem.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={addQty}
                  onChange={(e) => setAddQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-mono-numbers"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  Konfirmasi Tambah Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
