import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Users,
  Plus,
  Search,
  Sparkles,
  Gift,
  Coins,
  Phone,
  Calendar,
  CheckCircle,
  Award,
  ChevronRight,
} from 'lucide-react';
import { CustomerMember, StoreProfile } from '../types';
import { formatRupiah, formatDateTime } from '../utils/receiptGenerator';

interface MemberLoyaltyProps {
  members: CustomerMember[];
  store: StoreProfile;
  onSaveMember: (member: CustomerMember) => void;
  onStartOrderForMember: (member: CustomerMember) => void;
}

export const MemberLoyalty: React.FC<MemberLoyaltyProps> = ({
  members,
  store,
  onSaveMember,
  onStartOrderForMember,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      alert('Nama dan No. WhatsApp wajib diisi');
      return;
    }

    const newMember: CustomerMember = {
      id: `MBR-${String(members.length + 1).padStart(3, '0')}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      joinedDate: new Date().toISOString().split('T')[0],
      washCount: 0,
      totalCompletedWashes: 0,
      availableFreeWashVouchers: 0,
      totalSpent: 0,
      notes: newNotes.trim() || undefined,
    };

    onSaveMember(newMember);
    setNewName('');
    setNewPhone('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleManualAddStamp = (member: CustomerMember) => {
    const updated = { ...member };
    updated.washCount += 1;
    updated.totalCompletedWashes += 1;

    if (updated.washCount >= 10) {
      updated.availableFreeWashVouchers += 1;
      updated.washCount = 0; // reset
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
    onSaveMember(updated);
  };

  const handleClaimVoucher = (member: CustomerMember) => {
    if (member.availableFreeWashVouchers <= 0) return;
    onStartOrderForMember(member);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining loyalty program */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
              Program Loyalitas Otomatis
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">
            Member 10x Cuci Gratis 1 Kali Cuci
          </h2>
          <p className="text-xs text-amber-100 max-w-xl">
            Setiap kali member melakukan pencucian koin, stempel otomatis bertambah di sistem. Saat mencapai 10 stempel, member berhak mendapatkan voucher 1x Cuci Koin Gratis (potongan harga 100% koin cuci).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-amber-900 bg-white hover:bg-amber-50 rounded-xl transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Tambah Member Baru</span>
        </button>
      </div>

      {/* Search and Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, WhatsApp, ID member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        <div className="text-xs text-slate-500 self-end sm:self-center">
          Total Member: <strong className="text-slate-800 font-mono-numbers">{members.length}</strong> orang
          {' · '}
          Voucher Gratis Aktif:{' '}
          <strong className="text-emerald-600 font-mono-numbers">
            {members.reduce((sum, m) => sum + m.availableFreeWashVouchers, 0)}
          </strong>{' '}
          voucher
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMembers.map((member) => {
          const hasVoucher = member.availableFreeWashVouchers > 0;
          return (
            <div
              key={member.id}
              className={`bg-white rounded-2xl border p-5 transition-all shadow-xs space-y-4 ${
                hasVoucher ? 'border-amber-300 ring-1 ring-amber-300/40 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              {/* Member Head */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono-numbers text-slate-400">
                      {member.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1 font-mono-numbers">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {member.phone}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Bergabung: {member.joinedDate}
                    </span>
                  </div>
                </div>

                {hasVoucher ? (
                  <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 rounded-md flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" />
                    {member.availableFreeWashVouchers}x Free Wash!
                  </span>
                ) : (
                  <span className="text-xs font-mono-numbers font-semibold text-slate-500">
                    {member.washCount}/10 Cuci
                  </span>
                )}
              </div>

              {/* 10-Stamp Visual Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>Progress Kartu Stempel:</span>
                  <span className="text-sky-700 font-bold">
                    {member.washCount === 0 && !hasVoucher
                      ? 'Baru mulai'
                      : member.washCount >= 10
                      ? 'Target Tercapai!'
                      : `${10 - member.washCount}x cuci lagi menuju Gratis!`}
                  </span>
                </div>

                {/* 10 circular stamp badges */}
                <div className="grid grid-cols-10 gap-1.5">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const isStamped = idx < member.washCount;
                    const isTenth = idx === 9;
                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-black transition-all ${
                          isStamped
                            ? 'bg-amber-400 text-slate-950 shadow-2xs scale-102'
                            : isTenth
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 border-dashed'
                            : 'bg-white border border-slate-200 text-slate-300'
                        }`}
                        title={`Stempel #${idx + 1}`}
                      >
                        {isStamped ? (
                          '★'
                        ) : isTenth ? (
                          <Gift className="w-3 h-3 text-amber-600" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Member stats & action buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-slate-500">
                  Total cuci: <strong className="text-slate-800 font-mono-numbers">{member.totalCompletedWashes}x</strong>
                  {' · '}
                  Belanja: <strong className="text-slate-800 font-mono-numbers">{formatRupiah(member.totalSpent)}</strong>
                </div>

                <div className="flex items-center gap-1.5">
                  {hasVoucher && (
                    <button
                      onClick={() => handleClaimVoucher(member)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      Klaim Cuci Gratis
                    </button>
                  )}
                  <button
                    onClick={() => onStartOrderForMember(member)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Order Laundry</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-600" />
              Pendaftaran Member Baru
            </h3>
            <p className="text-xs text-slate-500">
              Daftarkan pelanggan untuk mulai mengumpulkan 10 stempel cuci koin dan dapatkan 1x gratis.
            </p>

            <form onSubmit={handleCreateMember} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono-numbers"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Preferensi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Suka wangi sakura, pelanggan kost"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                >
                  Daftarkan Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
