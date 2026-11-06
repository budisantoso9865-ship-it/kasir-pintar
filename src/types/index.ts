/**
 * Type definitions for KoinWash Pro - Smart Coin Laundry POS
 */

export type ServiceType = 'wash_dry' | 'wash_only' | 'dry_only';

export type OrderStatus = 'queue' | 'washing' | 'drying' | 'ready' | 'completed';

export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'member_balance';

export type UserRole = 'owner' | 'shift_pagi' | 'shift_sore';

export interface UserSession {
  username: string;
  role: UserRole;
  shiftName: string;
}

export interface OrderItemWithQty {
  id: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
  aromaGroup?: string;
  colorHex?: string;
}

export interface LaundryOrder {
  id: string; // e.g. LND-2026-001
  customerName: string;
  customerPhone: string; // e.g. 081234567890
  isMember: boolean;
  memberId?: string;
  serviceType: ServiceType;
  weightKg: number;
  washerCoins: number;
  dryerCoins: number;
  washerMachineId?: string; // e.g. W-01
  dryerMachineId?: string; // e.g. D-02
  detergentId: string;
  detergentName: string;
  detergentPrice: number;
  selectedDetergents?: OrderItemWithQty[];
  fragranceId: string;
  fragranceName: string;
  fragrancePrice: number;
  fragranceAroma?: string;
  selectedFragrances?: OrderItemWithQty[];
  addOns: {
    id: string;
    name: string;
    price: number;
    qty: number;
  }[];
  subtotal: number;
  discount: number;
  finalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'unpaid';
  status: OrderStatus;
  statusHistory: {
    queueAt: string;
    washingAt?: string;
    dryingAt?: string;
    readyAt?: string;
    completedAt?: string;
  };
  estimatedReadyTime: string; // ISO string
  notes?: string;
  createdAt: string; // ISO string
  freeWashClaimed?: boolean;
  assignedBy?: string; // username
  shiftId?: 'pagi' | 'sore';
}

export interface CustomerMember {
  id: string; // e.g. MBR-001
  name: string;
  phone: string;
  joinedDate: string;
  washCount: number; // 0 to 10. Resets to 0 or advances to voucher
  totalCompletedWashes: number; // Lifetime count
  availableFreeWashVouchers: number; // Ready to claim
  totalSpent: number;
  notes?: string;
}

export interface DetergentOption {
  id: string;
  name: string;
  description: string;
  price: number; // 0 = included in coin, or extra for premium
  isEco: boolean;
  stockPacks: number;
  iconName: string;
}

export interface FragranceOption {
  id: string;
  name: string;
  aromaGroup: string; // e.g., 'Floral', 'Fresh', 'Sweet', 'Calm'
  description: string;
  intensity: 1 | 2 | 3;
  price: number; // 0 = standard, or extra for luxury
  colorHex: string;
  stockBottles: number;
}

export type MachineType = 'washer' | 'dryer';
export type MachineStatus = 'available' | 'running' | 'completed' | 'maintenance';

export interface LaundryMachine {
  id: string; // W-01, D-01
  name: string;
  type: MachineType;
  capacityKg: number;
  status: MachineStatus;
  currentOrderId?: string;
  currentCustomerName?: string;
  cycleStartedAt?: string;
  cycleDurationMinutes?: number;
}

export interface FinancialExpense {
  id: string;
  date: string; // YYYY-MM-DD
  category: 'detergent_restock' | 'fragrance_restock' | 'electricity' | 'water' | 'maintenance' | 'staff' | 'other';
  title: string;
  amount: number;
  notes?: string;
}

export interface StoreProfile {
  name: string;
  branch: string;
  address: string;
  mapsUrl?: string;
  phone: string;
  tagline: string;
  washerCoinPrice: number;
  dryerCoinPrice: number;
  washTimeMinutes: number;
  dryTimeMinutes: number;
  loyaltyTarget: number; // 10
}
