import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Calendar,
  Plus,
  Printer,
  Download,
  CreditCard,
  PieChart,
  Tag,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { FinancialExpense, LaundryOrder, StoreProfile, UserSession } from '../types';
import { formatRupiah, formatDateTime } from '../utils/receiptGenerator';

interface FinancialReportsProps {
  orders: LaundryOrder[];
  expenses: FinancialExpense[];
  store: StoreProfile;
  onAddExpense: () => void;
  session: UserSession | null;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  orders,
  expenses,
  store,
  onAddExpense,
  session,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');

  // Filter orders and expenses by selected month
  let filteredOrders = orders.filter((o) => o.createdAt.startsWith(selectedMonth));
  
  // Apply shift filter if not owner
  if (session && session.role !== 'owner') {
    const shift = session.role === 'shift_pagi' ? 'pagi' : 'sore';
    filteredOrders = filteredOrders.filter(o => o.shiftId === shift);
  }

  const filteredExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));

  // Revenue calculations
  const totalGrossRevenue = filteredOrders.reduce((sum, o) => sum + o.finalPrice, 0);
  const totalDiscountsGiven = filteredOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalGrossRevenue - totalExpenses;
  const profitMargin = totalGrossRevenue > 0 ? (netProfit / totalGrossRevenue) * 100 : 0;

  // Coins Sold
  const totalWasherCoins = filteredOrders.reduce((sum, o) => sum + (o.washerCoins || 0), 0);
  const totalDryerCoins = filteredOrders.reduce((sum, o) => sum + (o.dryerCoins || 0), 0);
  const totalCoinsSold = totalWasherCoins + totalDryerCoins;

  // Payment Breakdown
  const paymentBreakdown = {
    qris: filteredOrders.filter((o) => o.paymentMethod === 'qris').reduce((s, o) => s + o.finalPrice, 0),
    cash: filteredOrders.filter((o) => o.paymentMethod === 'cash').reduce((s, o) => s + o.finalPrice, 0),
    transfer: filteredOrders.filter((o) => o.paymentMethod === 'transfer').reduce((s, o) => s + o.finalPrice, 0),
  };

  // Top Fragrances Ranking
  const fragranceCounts: { [key: string]: number } = {};
  filteredOrders.forEach((o) => {
    if (o.selectedFragrances && o.selectedFragrances.length > 0) {
      o.selectedFragrances.forEach((f) => {
        fragranceCounts[f.name] = (fragranceCounts[f.name] || 0) + f.qty;
      });
    } else {
      fragranceCounts[o.fragranceName] = (fragranceCounts[o.fragranceName] || 0) + 1;
    }
  });
  const topFragrances = Object.entries(fragranceCounts).sort((a, b) => b[1] - a[1]);

  // Daily revenue data for mini chart (1 to 30)
  const daysInMonth = 30;
  const dailyData = Array.from({ length: daysInMonth }).map((_, i) => {
    const dayStr = String(i + 1).padStart(2, '0');
    const datePrefix = `${selectedMonth}-${dayStr}`;
    const dayRev = orders
      .filter((o) => o.createdAt.startsWith(datePrefix))
      .reduce((s, o) => s + o.finalPrice, 0);
    const dayExp = expenses
      .filter((e) => e.date === datePrefix)
      .reduce((s, e) => s + e.amount, 0);
    return { day: i + 1, rev: dayRev, exp: dayExp };
  });

  const maxDailyRev = Math.max(...dailyData.map((d) => Math.max(d.rev, d.exp)), 100000);

  const handlePrintReport = () => {
    window.print();
  };

  const isOwner = session?.role === 'owner';
  const targetRevenue = 5000000; // Contoh target per shift
  const bonus = totalGrossRevenue > targetRevenue ? (totalGrossRevenue - targetRevenue) * 0.05 : 0;

  return (
    <div className="space-y-6">
      {/* Month Selector & Report Actions Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Laporan Keuangan {session && session.role !== 'owner' ? `(${session.shiftName})` : 'Keseluruhan'}
          </h2>
          <p className="text-xs text-slate-500">
            Perhitungan omset {session && session.role !== 'owner' ? 'shift ini' : 'dan keuntungan bersih'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="2026-11">Bulan Ini (November 2026)</option>
              <option value="2026-10">Oktober 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">Agustus 2026</option>
            </select>
          </div>

          {isOwner && (
            <button
              onClick={onAddExpense}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Catat Beban</span>
            </button>
          )}

          <button
            onClick={handlePrintReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omset Kotor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Omset (Revenue)</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numbers">
            {formatRupiah(totalGrossRevenue)}
          </div>
          <p className="text-[11px] text-slate-400">
            Dari <strong className="text-slate-700 font-mono-numbers">{filteredOrders.length}</strong> transaksi
          </p>
        </div>

        {isOwner && (
          <>
            {/* Pengeluaran Operasional */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Pengeluaran (Beban)</span>
                <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <TrendingDown className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-rose-700 font-mono-numbers">
                {formatRupiah(totalExpenses)}
              </div>
            </div>

            {/* Laba Bersih */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Laba Bersih</span>
                <span className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div
                className={`text-2xl font-black font-mono-numbers ${
                  netProfit >= 0 ? 'text-sky-900' : 'text-rose-600'
                }`}
              >
                {formatRupiah(netProfit)}
              </div>
            </div>
          </>
        )}

        {/* Bonus Shift */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Bonus Shift</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono-numbers">
            {formatRupiah(bonus)}
          </div>
          <p className="text-[11px] text-amber-600 font-bold">
            Target: {formatRupiah(targetRevenue)}
          </p>
        </div>
      </div>

      {isOwner && (
        <>
          {/* Daily Revenue Bar Trend Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            {/* ... (keep existing chart) */}
          </div>

          {/* 2-Column Split: Payment Breakdown & Top Fragrances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Methods */}
            {/* ... (keep existing breakdown) */}
          </div>

          {/* Expenses Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* ... (keep existing table) */}
          </div>
        </>
      )}
    </div>
  );
};
