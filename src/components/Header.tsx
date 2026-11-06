import { Plus, LogOut } from 'lucide-react';
import { StoreProfile, UserSession } from '../types';

export type ActiveTab = 'pos' | 'machines' | 'tracking' | 'members' | 'finance' | 'inventory';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  store: StoreProfile;
  onOpenNewOrder: () => void;
  activeOrdersCount: number;
  session: UserSession | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  store,
  onOpenNewOrder,
  activeOrdersCount,
  session,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          <button
            onClick={() => setActiveTab('pos')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors whitespace-nowrap shrink-0">
              Denbagus<span className="text-sky-600 font-black"> Laundry Coin</span>
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'pos'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Kasir POS
            </button>
            <button
              onClick={() => setActiveTab('machines')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 relative ${
                activeTab === 'machines'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Monitor Mesin
              {activeOrdersCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-mono-numbers rounded-full bg-sky-100 text-sky-800">
                  {activeOrdersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'tracking'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Lacak Cucian Real-Time
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'members'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Member & Loyalitas
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'finance'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Laporan Keuangan
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'inventory'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Sabun & Pewangi
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {session && (
              <button
                onClick={onLogout}
                className="text-[10px] flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                title={`Logout (${session.shiftName})`}
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            )}
            <button
              onClick={onOpenNewOrder}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-all hover:shadow hover:-translate-y-0.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Transaksi Baru</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation strip */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activeTab === 'pos' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Kasir
          </button>
          <button
            onClick={() => setActiveTab('machines')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activeTab === 'machines' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Mesin ({activeOrdersCount})
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activeTab === 'tracking' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Lacak Real-Time
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activeTab === 'members' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Member 10x
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activeTab === 'finance' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Laporan
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activeTab === 'inventory' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Sabun & Pewangi
          </button>
        </div>
      </div>
    </header>
  );
};
