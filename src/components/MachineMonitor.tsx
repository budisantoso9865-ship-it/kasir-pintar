import React, { useState } from 'react';
import {
  Shirt,
  Wind,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Clock,
  ArrowRight,
  User,
  Filter,
} from 'lucide-react';
import { LaundryMachine, LaundryOrder, MachineType, StoreProfile } from '../types';

interface MachineMonitorProps {
  machines: LaundryMachine[];
  orders: LaundryOrder[];
  store: StoreProfile;
  onUpdateMachineStatus: (machineId: string, newStatus: LaundryMachine['status']) => void;
  onAdvanceOrderStatus: (orderId: string, nextStatus: LaundryOrder['status']) => void;
  onOpenReceipt: (order: LaundryOrder) => void;
}

export const MachineMonitor: React.FC<MachineMonitorProps> = ({
  machines,
  orders,
  store,
  onUpdateMachineStatus,
  onAdvanceOrderStatus,
  onOpenReceipt,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'washer' | 'dryer'>('all');

  const filteredMachines = machines.filter((m) => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  const getMachineOrder = (machine: LaundryMachine): LaundryOrder | undefined => {
    if (machine.currentOrderId) {
      return orders.find((o) => o.id === machine.currentOrderId);
    }
    // Alternatively look up active order assigned to this machine
    return orders.find(
      (o) =>
        (o.status === 'washing' && o.washerMachineId === machine.id) ||
        (o.status === 'drying' && o.dryerMachineId === machine.id)
    );
  };

  const getMinutesRemaining = (machine: LaundryMachine): number => {
    if (machine.status !== 'running' || !machine.cycleStartedAt) return 0;
    const duration = machine.cycleDurationMinutes || (machine.type === 'washer' ? store.washTimeMinutes : store.dryTimeMinutes);
    const elapsedMinutes = (Date.now() - new Date(machine.cycleStartedAt).getTime()) / 60000;
    return Math.max(0, Math.ceil(duration - elapsedMinutes));
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <RotateCw className="w-5 h-5 text-sky-600" />
            Monitoring Mesin Koin Real-Time
          </h2>
          <p className="text-xs text-slate-500">
            Status operasional 8 Mesin Cuci (Washer) & 8 Mesin Pengering (Dryer)
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Mesin ({machines.length})
          </button>
          <button
            onClick={() => setFilterType('washer')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
              filterType === 'washer'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            Washer ({machines.filter((m) => m.type === 'washer').length})
          </button>
          <button
            onClick={() => setFilterType('dryer')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
              filterType === 'dryer'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            Dryer ({machines.filter((m) => m.type === 'dryer').length})
          </button>
        </div>
      </div>

      {/* Machine Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredMachines.map((machine) => {
          const activeOrder = getMachineOrder(machine);
          const minutesRemaining = getMinutesRemaining(machine);
          const isRunning = machine.status === 'running';
          const isAvailable = machine.status === 'available';
          const isCompleted = machine.status === 'completed';
          const isMaintenance = machine.status === 'maintenance';

          return (
            <div
              key={machine.id}
              className={`bg-white rounded-2xl border p-4.5 transition-all shadow-xs relative overflow-hidden flex flex-col justify-between ${
                isRunning
                  ? machine.type === 'washer'
                    ? 'border-sky-300 ring-1 ring-sky-300/40'
                    : 'border-amber-300 ring-1 ring-amber-300/40'
                  : isCompleted
                  ? 'border-emerald-300 ring-1 ring-emerald-300/40 bg-emerald-50/20'
                  : isMaintenance
                  ? 'border-slate-200 bg-slate-50/70 opacity-75'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Top row */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        machine.type === 'washer'
                          ? isRunning
                            ? 'bg-sky-600 text-white'
                            : 'bg-sky-50 text-sky-700'
                          : isRunning
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {machine.type === 'washer' ? (
                        <Shirt className={`w-5 h-5 ${isRunning ? 'animate-spin' : ''}`} />
                      ) : (
                        <Wind className={`w-5 h-5 ${isRunning ? 'animate-pulse' : ''}`} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 font-mono-numbers">
                        {machine.id}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate max-w-[120px]">
                        {machine.name}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isRunning
                        ? machine.type === 'washer'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                        : isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCompleted
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isRunning
                      ? 'Sedang Berputar'
                      : isAvailable
                      ? 'Tersedia'
                      : isCompleted
                      ? 'Siklus Selesai'
                      : 'Perawatan'}
                  </span>
                </div>

                {/* Middle details */}
                <div className="my-3 py-2.5 border-y border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Kapasitas:</span>
                    <span className="font-semibold text-slate-800 font-mono-numbers">
                      {machine.capacityKg} Kg
                    </span>
                  </div>

                  {activeOrder ? (
                    <>
                      <div className="flex justify-between text-slate-500">
                        <span>Pelanggan:</span>
                        <span className="font-bold text-slate-900 truncate max-w-[120px]">
                          {activeOrder.customerName}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Nota:</span>
                        <button
                          onClick={() => onOpenReceipt(activeOrder)}
                          className="font-bold text-sky-600 hover:underline font-mono-numbers"
                        >
                          {activeOrder.id}
                        </button>
                      </div>

                      {isRunning && (
                        <div className="flex items-center justify-between font-mono-numbers pt-1">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Sisa Waktu:
                          </span>
                          <span className="font-bold text-slate-900">
                            {minutesRemaining} menit
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic py-1">
                      {isAvailable ? 'Siap digunakan untuk koin baru' : 'Sedang tidak aktif'}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Cashier Operations */}
              <div className="pt-1 flex items-center gap-1.5">
                {activeOrder && activeOrder.status === 'washing' && (
                  <button
                    onClick={() => {
                      onAdvanceOrderStatus(activeOrder.id, 'drying');
                      onUpdateMachineStatus(machine.id, 'available');
                    }}
                    className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shadow-2xs"
                  >
                    <span>Pindah ke Dryer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {activeOrder && activeOrder.status === 'drying' && (
                  <button
                    onClick={() => {
                      onAdvanceOrderStatus(activeOrder.id, 'ready');
                      onUpdateMachineStatus(machine.id, 'available');
                    }}
                    className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tandai Siap Diambil</span>
                  </button>
                )}

                {isAvailable && (
                  <button
                    onClick={() =>
                      onUpdateMachineStatus(
                        machine.id,
                        machine.status === 'maintenance' ? 'available' : 'maintenance'
                      )
                    }
                    className="w-full py-1.5 px-2 text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-center"
                  >
                    Set Maintenance
                  </button>
                )}

                {isMaintenance && (
                  <button
                    onClick={() => onUpdateMachineStatus(machine.id, 'available')}
                    className="w-full py-1.5 px-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-center"
                  >
                    Aktifkan Kembali
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
