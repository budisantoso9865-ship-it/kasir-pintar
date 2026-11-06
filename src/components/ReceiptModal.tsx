import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, MessageCircle, Copy, Check, X, Sparkles, Search } from 'lucide-react';
import { LaundryOrder, CustomerMember, StoreProfile } from '../types';
import {
  formatRupiah,
  formatDateTime,
  formatTimeOnly,
  getWhatsAppUrl,
  generateWhatsAppMessage,
} from '../utils/receiptGenerator';

interface ReceiptModalProps {
  order: LaundryOrder | null;
  member?: CustomerMember | null;
  store: StoreProfile;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder?: (orderId: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  member,
  store,
  isOpen,
  onClose,
  onTrackOrder,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!order) return;
    const trackingUrl = `${window.location.origin}?track=${encodeURIComponent(order.id)}`;
    QRCode.toDataURL(trackingUrl, {
      width: 160,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [order]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const url = getWhatsAppUrl(order, member, store);
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    const text = generateWhatsAppMessage(order, member, store);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Nota Struk Kasir</h3>
            <p className="text-xs text-slate-500 font-mono-numbers">ID: {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Top */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 bg-emerald-50/50 border-b border-emerald-100/60">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Cetak Nota (Print)
            </button>
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              Kirim ke WhatsApp
            </button>
            {onTrackOrder && (
              <button
                onClick={() => {
                  onTrackOrder(order.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-100 hover:bg-sky-200 border border-sky-200 rounded-lg transition-colors shadow-xs"
                title="Buka pelacakan cucian real-time"
              >
                <Search className="w-4 h-4" />
                Lacak Status
              </button>
            )}
          </div>
          <button
            onClick={handleCopyText}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Teks</span>
              </>
            )}
          </button>
        </div>

        {/* Thermal Receipt Paper Viewport */}
        <div className="p-6 bg-slate-100/80 max-h-[65vh] overflow-y-auto flex justify-center">
          <div
            id="thermal-receipt"
            ref={receiptRef}
            className="w-full max-w-[340px] bg-white p-5 shadow-sm border border-slate-200 text-slate-800 font-mono-numbers text-xs leading-relaxed"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">{store.name}</h2>
              <p className="text-[11px] text-slate-600 font-sans mt-0.5">{store.branch}</p>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">{store.address}</p>
              <p className="text-[10px] text-slate-500 font-sans">WA / CS: {store.phone}</p>
            </div>

            {/* Order Details Header */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Nota:</span>
                <span className="font-bold text-slate-900">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span>{formatDateTime(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <span className="font-semibold text-slate-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. HP:</span>
                <span>{order.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tipe Layanan:</span>
                <span className="font-medium text-slate-800">
                  {order.serviceType === 'wash_dry'
                    ? 'Cuci + Kering'
                    : order.serviceType === 'wash_only'
                    ? 'Cuci Saja'
                    : 'Kering Saja'}
                </span>
              </div>
            </div>

            {/* Machine & Weights */}
            <div className="py-2 border-b border-dashed border-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Berat Cucian:</span>
                <span className="font-semibold">{order.weightKg} Kg</span>
              </div>
              {order.washerMachineId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Mesin Cuci (Washer):</span>
                  <span className="font-bold text-sky-700">{order.washerMachineId}</span>
                </div>
              )}
              {order.dryerMachineId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Mesin Kering (Dryer):</span>
                  <span className="font-bold text-amber-700">{order.dryerMachineId}</span>
                </div>
              )}
            </div>

            {/* Detergent & Fragrance */}
            <div className="py-2 border-b border-dashed border-slate-300 space-y-1">
              <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Pilihan Sabun & Aroma:
              </div>
              {order.selectedDetergents && order.selectedDetergents.length > 0 ? (
                order.selectedDetergents.map((det) => (
                  <div key={det.id} className="flex justify-between">
                    <span className="text-slate-600">{det.qty}x {det.name}:</span>
                    <span className="text-right text-slate-900 font-medium">
                      {det.subtotal === 0 ? 'Include Koin' : formatRupiah(det.subtotal)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between">
                  <span className="text-slate-600">Deterjen:</span>
                  <span className="text-right text-slate-900">{order.detergentName}</span>
                </div>
              )}

              {order.selectedFragrances && order.selectedFragrances.length > 0 ? (
                order.selectedFragrances.map((frag) => (
                  <div key={frag.id} className="flex justify-between">
                    <span className="text-slate-600">{frag.qty}x {frag.name}:</span>
                    <span className="text-right font-medium text-pink-700">
                      {frag.subtotal === 0 ? 'Gratis' : formatRupiah(frag.subtotal)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between">
                  <span className="text-slate-600">Pewangi:</span>
                  <span className="text-right font-medium text-pink-700">{order.fragranceName}</span>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Koin Cuci ({order.washerCoins}x):</span>
                <span>{formatRupiah(order.washerCoins * store.washerCoinPrice)}</span>
              </div>
              {order.dryerCoins > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Koin Kering ({order.dryerCoins}x):</span>
                  <span>{formatRupiah(order.dryerCoins * store.dryerCoinPrice)}</span>
                </div>
              )}
              {order.detergentPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Biaya Sabun:</span>
                  <span>{formatRupiah(order.detergentPrice)}</span>
                </div>
              )}
              {order.fragrancePrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Biaya Pewangi:</span>
                  <span>{formatRupiah(order.fragrancePrice)}</span>
                </div>
              )}
              {order.addOns.map((add) => (
                <div key={add.id} className="flex justify-between">
                  <span className="text-slate-600">{add.name}:</span>
                  <span>{formatRupiah(add.price * add.qty)}</span>
                </div>
              ))}

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-100">
                  <span>Diskon / Voucher:</span>
                  <span>-{formatRupiah(order.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-300">
                <span>TOTAL BAYAR:</span>
                <span>{formatRupiah(order.finalPrice)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Metode Bayar:</span>
                <span className="font-semibold uppercase">{order.paymentMethod} (LUNAS)</span>
              </div>
            </div>

            {/* Member Loyalty Stamp Box (10x Cuci Gratis 1x) */}
            {member && (
              <div className="my-2.5 p-2.5 bg-slate-50 border border-slate-300 rounded-sm">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 mb-1">
                  <span>LOYALITAS MEMBER:</span>
                  <span className="text-emerald-700">{member.washCount}/10 Cuci</span>
                </div>
                <div className="grid grid-cols-10 gap-1 my-1.5">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-4 flex items-center justify-center text-[9px] font-bold rounded-xs ${
                        idx < member.washCount
                          ? 'bg-slate-800 text-amber-300'
                          : 'bg-white border border-slate-300 text-slate-300'
                      }`}
                    >
                      {idx < member.washCount ? '★' : idx + 1}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 text-center mt-1">
                  {member.availableFreeWashVouchers > 0 ? (
                    <span className="font-bold text-emerald-700">
                      🎉 Anda memiliki {member.availableFreeWashVouchers}x Voucher Cuci Gratis!
                    </span>
                  ) : (
                    <span>Tersisa {10 - member.washCount}x cuci lagi untuk dapatkan 1x Cuci Gratis!</span>
                  )}
                </p>
              </div>
            )}

            {/* QR Code & Tracking Info */}
            <div className="pt-2 text-center">
              <p className="text-[10px] text-slate-600 font-sans mb-1.5">
                Scan QR Code untuk Lacak Status Cucian Real-Time:
              </p>
              {qrCodeDataUrl ? (
                <div className="flex justify-center my-1">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code Lacak Cucian"
                    className="w-24 h-24 border border-slate-200 p-1 bg-white"
                  />
                </div>
              ) : null}
              <p className="text-[10px] text-slate-500 font-sans">
                Estimasi Selesai:{' '}
                <strong className="text-slate-800">{formatTimeOnly(order.estimatedReadyTime)} WIB</strong>
              </p>
            </div>

            {/* Footer Notice */}
            <div className="pt-3 mt-3 border-t border-dashed border-slate-300 text-center text-[9px] text-slate-400 font-sans">
              <p>Simpan nota ini sebagai bukti pengambilan cucian.</p>
              <p className="mt-0.5">Barang yang tidak diambil dalam 30 hari di luar tanggung jawab laundry.</p>
              <p className="mt-1 font-semibold text-slate-600">~ Terima Kasih Atas Kunjungan Anda ~</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-500">
            Dapat langsung dicetak ke printer thermal 58mm / 80mm atau dikirim ke WhatsApp pelanggan.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
