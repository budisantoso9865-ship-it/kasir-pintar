import {
  LaundryOrder,
  CustomerMember,
  DetergentOption,
  FragranceOption,
  LaundryMachine,
  FinancialExpense,
  StoreProfile,
  UserSession,
  UserRole,
} from '../types';

const STORAGE_KEYS = {
  ORDERS: 'koinwash_orders_v1',
  MEMBERS: 'koinwash_members_v1',
  DETERGENTS: 'koinwash_detergents_v1',
  FRAGRANCES: 'koinwash_fragrances_v1',
  MACHINES: 'koinwash_machines_v1',
  EXPENSES: 'koinwash_expenses_v1',
  STORE: 'koinwash_store_v1',
  SESSION: 'koinwash_session_v1',
};

export const DEFAULT_STORE_PROFILE: StoreProfile = {
  name: 'DENBAGUS LAUNDRY COIN',
  branch: 'Outlet Kalibader Taman',
  address: 'Jl. Kalibader, Kalijaten, Kec. Taman, Kab. Sidoarjo, Jawa Timur',
  mapsUrl: 'https://maps.app.goo.gl/1f7YrWN9i6hyKBvM7',
  phone: '+62 838-5413-6944',
  tagline: 'Solusi Cepat, Bersih, Wangi & Hemat Laundry Koin 24 Jam',
  washerCoinPrice: 10000,
  dryerCoinPrice: 10000,
  washTimeMinutes: 38,
  dryTimeMinutes: 45,
  loyaltyTarget: 10,
};

export const INITIAL_DETERGENTS: DetergentOption[] = [
  {
    id: 'det-1',
    name: 'Liquid Premium Anti-Bakteri',
    description: 'Busa terkontrol, basmi kuman 99.9%, lembut di serat pakaian',
    price: 0,
    isEco: false,
    stockPacks: 140,
    iconName: 'ShieldCheck',
  },
  {
    id: 'det-2',
    name: 'Eco-Green Enzymatic (Organik)',
    description: 'Bahan alami ramah lingkungan, non-alergen, tanpa klorin',
    price: 3000,
    isEco: true,
    stockPacks: 75,
    iconName: 'Leaf',
  },
  {
    id: 'det-3',
    name: 'Baby-Gentle Hypoallergenic',
    description: 'Diformulasikan khusus untuk pakaian bayi dan kulit sensitif',
    price: 4000,
    isEco: true,
    stockPacks: 50,
    iconName: 'HeartHandshake',
  },
  {
    id: 'det-4',
    name: 'Stain-Blaster Oxy Boost (Noda Berat)',
    description: 'Kekuatan oksigen aktif angkat noda minyak, saus & darah membandel',
    price: 5000,
    isEco: false,
    stockPacks: 95,
    iconName: 'Zap',
  },
  {
    id: 'det-5',
    name: 'Dual-Action Gel Pods (All-in-One)',
    description: 'Kombinasi deterjen konsentrat tinggi + pelindung warna pakaian',
    price: 6000,
    isEco: false,
    stockPacks: 60,
    iconName: 'Sparkles',
  },
];

export const INITIAL_FRAGRANCES: FragranceOption[] = [
  {
    id: 'frag-1',
    name: 'Sakura Blossom Deluxe',
    aromaGroup: 'Floral Segar',
    description: 'Aroma bunga sakura Jepang yang manis, menyegarkan dan semerbak',
    intensity: 3,
    price: 0,
    colorHex: '#f472b6',
    stockBottles: 24,
  },
  {
    id: 'frag-2',
    name: 'Oceanic Breeze',
    aromaGroup: 'Fresh & Sporty',
    description: 'Sensasi kesegaran hembusan angin laut biru, sangat cocok untuk pakaian olahraga',
    intensity: 2,
    price: 0,
    colorHex: '#38bdf8',
    stockBottles: 18,
  },
  {
    id: 'frag-3',
    name: 'French Lavender Relax',
    aromaGroup: 'Calm & Herbal',
    description: 'Aroma lavender Prancis yang menenangkan pikiran dan anti-ngengat alami',
    intensity: 3,
    price: 2000,
    colorHex: '#a855f7',
    stockBottles: 15,
  },
  {
    id: 'frag-4',
    name: 'Downy Mystique Passion',
    aromaGroup: 'Luxury Perfume',
    description: 'Keharuman mewah parfum malam elegan yang tahan hingga 14 hari',
    intensity: 3,
    price: 3000,
    colorHex: '#e11d48',
    stockBottles: 20,
  },
  {
    id: 'frag-5',
    name: 'Sweet Vanilla & Almond',
    aromaGroup: 'Sweet Gourmand',
    description: 'Kombinasi lembut vanilla Madagaskar dan aroma nutty yang hangat menyenangkan',
    intensity: 2,
    price: 2000,
    colorHex: '#f59e0b',
    stockBottles: 12,
  },
  {
    id: 'frag-6',
    name: 'Pure Cotton & Baby Powder',
    aromaGroup: 'Soft & Clean',
    description: 'Aroma bedak bayi klasik dan serat katun bersih, sangat lembut dan nyaman',
    intensity: 2,
    price: 2000,
    colorHex: '#06b6d4',
    stockBottles: 22,
  },
];

export const INITIAL_MACHINES: LaundryMachine[] = [
  { id: 'W-01', name: 'Washer 01 (Speed Queen)', type: 'washer', capacityKg: 8, status: 'available' },
  { id: 'W-02', name: 'Washer 02 (Speed Queen)', type: 'washer', capacityKg: 8, status: 'running', currentOrderId: 'LND-2026-004', currentCustomerName: 'Dimas Wicaksono', cycleStartedAt: new Date(Date.now() - 15 * 60000).toISOString(), cycleDurationMinutes: 38 },
  { id: 'W-03', name: 'Washer 03 (LG Titan Max)', type: 'washer', capacityKg: 14, status: 'running', currentOrderId: 'LND-2026-005', currentCustomerName: 'Siti Rahmawati', cycleStartedAt: new Date(Date.now() - 28 * 60000).toISOString(), cycleDurationMinutes: 40 },
  { id: 'W-04', name: 'Washer 04 (LG Titan Max)', type: 'washer', capacityKg: 14, status: 'available' },
  { id: 'W-05', name: 'Washer 05 (Maytag Com)', type: 'washer', capacityKg: 10, status: 'completed', currentOrderId: 'LND-2026-006', currentCustomerName: 'Hendra Setiawan' },
  { id: 'W-06', name: 'Washer 06 (Maytag Com)', type: 'washer', capacityKg: 10, status: 'available' },
  { id: 'W-07', name: 'Washer 07 (Huebsch Pro)', type: 'washer', capacityKg: 8, status: 'available' },
  { id: 'W-08', name: 'Washer 08 (Huebsch Pro)', type: 'washer', capacityKg: 8, status: 'maintenance' },

  { id: 'D-01', name: 'Dryer 01 (Speed Queen Gas)', type: 'dryer', capacityKg: 10, status: 'running', currentOrderId: 'LND-2026-002', currentCustomerName: 'Maya Sari', cycleStartedAt: new Date(Date.now() - 20 * 60000).toISOString(), cycleDurationMinutes: 45 },
  { id: 'D-02', name: 'Dryer 02 (Speed Queen Gas)', type: 'dryer', capacityKg: 10, status: 'available' },
  { id: 'D-03', name: 'Dryer 03 (LG Giant C+)', type: 'dryer', capacityKg: 14, status: 'available' },
  { id: 'D-04', name: 'Dryer 04 (LG Giant C+)', type: 'dryer', capacityKg: 14, status: 'running', currentOrderId: 'LND-2026-003', currentCustomerName: 'Rian Pratama', cycleStartedAt: new Date(Date.now() - 35 * 60000).toISOString(), cycleDurationMinutes: 45 },
  { id: 'D-05', name: 'Dryer 05 (Maytag Stack)', type: 'dryer', capacityKg: 10, status: 'available' },
  { id: 'D-06', name: 'Dryer 06 (Maytag Stack)', type: 'dryer', capacityKg: 10, status: 'available' },
  { id: 'D-07', name: 'Dryer 07 (Huebsch Dry)', type: 'dryer', capacityKg: 10, status: 'available' },
  { id: 'D-08', name: 'Dryer 08 (Huebsch Dry)', type: 'dryer', capacityKg: 10, status: 'available' },
];

export const INITIAL_MEMBERS: CustomerMember[] = [
  {
    id: 'MBR-001',
    name: 'Budi Santoso',
    phone: '081234567890',
    joinedDate: '2026-08-15',
    washCount: 9, // One more to reach 10x!
    totalCompletedWashes: 19,
    availableFreeWashVouchers: 0,
    totalSpent: 480000,
    notes: 'Pelanggan setia kosan sebelah, suka pewangi Sakura Blossom',
  },
  {
    id: 'MBR-002',
    name: 'Dewi Lestari',
    phone: '085712345678',
    joinedDate: '2026-07-20',
    washCount: 10, // Has unlocked 1 Free Wash!
    totalCompletedWashes: 20,
    availableFreeWashVouchers: 1, // Ready to claim!
    totalSpent: 560000,
    notes: 'Berhak dapat 1x cuci gratis! Suka deterjen Eco-Green',
  },
  {
    id: 'MBR-003',
    name: 'Ahmad Fauzi',
    phone: '087890123456',
    joinedDate: '2026-09-02',
    washCount: 5,
    totalCompletedWashes: 15,
    availableFreeWashVouchers: 0,
    totalSpent: 390000,
  },
  {
    id: 'MBR-004',
    name: 'Maya Sari',
    phone: '081399887766',
    joinedDate: '2026-10-10',
    washCount: 3,
    totalCompletedWashes: 3,
    availableFreeWashVouchers: 0,
    totalSpent: 120000,
  },
  {
    id: 'MBR-005',
    name: 'Rian Pratama',
    phone: '081922334455',
    joinedDate: '2026-10-18',
    washCount: 7,
    totalCompletedWashes: 7,
    availableFreeWashVouchers: 0,
    totalSpent: 220000,
  },
];

const now = new Date();
const todayISO = now.toISOString();

export const INITIAL_ORDERS: LaundryOrder[] = [
  {
    id: 'LND-2026-220',
    customerName: 'Budi Santoso',
    customerPhone: '+62 838-5413-6944',
    isMember: true,
    memberId: 'MBR-001',
    serviceType: 'wash_dry',
    weightKg: 6.5,
    washerCoins: 1,
    dryerCoins: 1,
    washerMachineId: 'W-01',
    dryerMachineId: 'D-02',
    detergentId: 'det-1',
    detergentName: 'Liquid Premium Anti-Bakteri',
    detergentPrice: 0,
    selectedDetergents: [
      { id: 'det-1', name: 'Liquid Premium Anti-Bakteri', price: 0, qty: 1, subtotal: 0 },
    ],
    fragranceId: 'frag-1',
    fragranceName: 'Sakura Blossom Deluxe',
    fragrancePrice: 0,
    fragranceAroma: 'Floral Segar',
    selectedFragrances: [
      { id: 'frag-1', name: 'Sakura Blossom Deluxe', price: 0, qty: 1, subtotal: 0, aromaGroup: 'Floral Segar', colorHex: '#f472b6' },
    ],
    addOns: [
      { id: 'add-1', name: 'Plastik Laundry Tebal', price: 2000, qty: 1 },
    ],
    subtotal: 22000,
    discount: 0,
    finalPrice: 22000,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    status: 'ready', // Sudah selesai & siap diambil di kasir!
    statusHistory: {
      queueAt: new Date(Date.now() - 90 * 60000).toISOString(),
      washingAt: new Date(Date.now() - 85 * 60000).toISOString(),
      dryingAt: new Date(Date.now() - 45 * 60000).toISOString(),
      readyAt: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    estimatedReadyTime: new Date(Date.now() - 5 * 60000).toISOString(),
    notes: 'Sudah selesai dicuci & dikeringkan, bersih & wangi, siap diambil di kasir',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: 'LND-2026-557',
    customerName: 'Budi Santoso',
    customerPhone: '+62 838-5413-6944',
    isMember: true,
    memberId: 'MBR-001',
    serviceType: 'wash_dry',
    weightKg: 7.5,
    washerCoins: 1,
    dryerCoins: 1,
    washerMachineId: 'W-01',
    dryerMachineId: 'D-02',
    detergentId: 'det-1',
    detergentName: '2x Liquid Premium Anti-Bakteri',
    detergentPrice: 0,
    selectedDetergents: [
      { id: 'det-1', name: 'Liquid Premium Anti-Bakteri', price: 0, qty: 2, subtotal: 0 },
    ],
    fragranceId: 'frag-1',
    fragranceName: '2x Sakura Blossom Deluxe',
    fragrancePrice: 0,
    fragranceAroma: 'Floral Segar',
    selectedFragrances: [
      { id: 'frag-1', name: 'Sakura Blossom Deluxe', price: 0, qty: 2, subtotal: 0, aromaGroup: 'Floral Segar', colorHex: '#f472b6' },
    ],
    addOns: [
      { id: 'add-1', name: 'Plastik Laundry Tebal', price: 2000, qty: 1 },
    ],
    subtotal: 22000,
    discount: 0,
    finalPrice: 22000,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    status: 'washing',
    statusHistory: {
      queueAt: new Date(Date.now() - 25 * 60000).toISOString(),
      washingAt: new Date(Date.now() - 20 * 60000).toISOString(),
    },
    estimatedReadyTime: new Date(Date.now() + 40 * 60000).toISOString(),
    notes: '2 Sabun Anti-Bakteri & 2 Pewangi Sakura Blossom',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'LND-2026-001',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    isMember: true,
    memberId: 'MBR-001',
    serviceType: 'wash_dry',
    weightKg: 7,
    washerCoins: 1,
    dryerCoins: 1,
    washerMachineId: 'W-01',
    dryerMachineId: 'D-02',
    detergentId: 'det-1',
    detergentName: 'Liquid Premium Anti-Bakteri',
    detergentPrice: 0,
    fragranceId: 'frag-1',
    fragranceName: 'Sakura Blossom Deluxe',
    fragrancePrice: 0,
    fragranceAroma: 'Floral Segar',
    addOns: [
      { id: 'add-1', name: 'Plastik Laundry Tebal', price: 2000, qty: 1 },
    ],
    subtotal: 22000,
    discount: 0,
    finalPrice: 22000,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    status: 'ready', // Ready to pick up
    statusHistory: {
      queueAt: new Date(Date.now() - 95 * 60000).toISOString(),
      washingAt: new Date(Date.now() - 90 * 60000).toISOString(),
      dryingAt: new Date(Date.now() - 50 * 60000).toISOString(),
      readyAt: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    estimatedReadyTime: new Date(Date.now() - 5 * 60000).toISOString(),
    notes: 'Pakaian kantor, lipat rapi',
    createdAt: new Date(Date.now() - 95 * 60000).toISOString(),
  },
  {
    id: 'LND-2026-002',
    customerName: 'Maya Sari',
    customerPhone: '081399887766',
    isMember: true,
    memberId: 'MBR-004',
    serviceType: 'wash_dry',
    weightKg: 6.5,
    washerCoins: 1,
    dryerCoins: 1,
    washerMachineId: 'W-02',
    dryerMachineId: 'D-01',
    detergentId: 'det-2',
    detergentName: 'Eco-Green Enzymatic (Organik)',
    detergentPrice: 3000,
    fragranceId: 'frag-3',
    fragranceName: 'French Lavender Relax',
    fragrancePrice: 2000,
    fragranceAroma: 'Calm & Herbal',
    addOns: [],
    subtotal: 25000,
    discount: 0,
    finalPrice: 25000,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    status: 'drying', // Currently in dryer D-01
    statusHistory: {
      queueAt: new Date(Date.now() - 60 * 60000).toISOString(),
      washingAt: new Date(Date.now() - 55 * 60000).toISOString(),
      dryingAt: new Date(Date.now() - 20 * 60000).toISOString(),
    },
    estimatedReadyTime: new Date(Date.now() + 25 * 60000).toISOString(),
    notes: 'Sprei dan handuk',
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 'LND-2026-003',
    customerName: 'Rian Pratama',
    customerPhone: '081922334455',
    isMember: true,
    memberId: 'MBR-005',
    serviceType: 'wash_dry',
    weightKg: 8,
    washerCoins: 1,
    dryerCoins: 1,
    washerMachineId: 'W-03',
    dryerMachineId: 'D-04',
    detergentId: 'det-1',
    detergentName: 'Liquid Premium Anti-Bakteri',
    detergentPrice: 0,
    fragranceId: 'frag-2',
    fragranceName: 'Oceanic Breeze',
    fragrancePrice: 0,
    fragranceAroma: 'Fresh & Sporty',
    addOns: [],
    subtotal: 20000,
    discount: 0,
    finalPrice: 20000,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    status: 'drying',
    statusHistory: {
      queueAt: new Date(Date.now() - 75 * 60000).toISOString(),
      washingAt: new Date(Date.now() - 70 * 60000).toISOString(),
      dryingAt: new Date(Date.now() - 35 * 60000).toISOString(),
    },
    estimatedReadyTime: new Date(Date.now() + 10 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
  },
  {
    id: 'LND-2026-004',
    customerName: 'Dimas Wicaksono',
    customerPhone: '085211223344',
    isMember: false,
    serviceType: 'wash_dry',
    weightKg: 7.2,
    washerCoins: 1,
    dryerCoins: 1,
    washerMachineId: 'W-02',
    dryerMachineId: 'D-02',
    detergentId: 'det-4',
    detergentName: 'Stain-Blaster Oxy Boost (Noda Berat)',
    detergentPrice: 5000,
    fragranceId: 'frag-4',
    fragranceName: 'Downy Mystique Passion',
    fragrancePrice: 3000,
    fragranceAroma: 'Luxury Perfume',
    addOns: [],
    subtotal: 28000,
    discount: 0,
    finalPrice: 28000,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    status: 'washing', // In Washer W-02
    statusHistory: {
      queueAt: new Date(Date.now() - 18 * 60000).toISOString(),
      washingAt: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    estimatedReadyTime: new Date(Date.now() + 68 * 60000).toISOString(),
    notes: 'Baju futsal banyak noda tanah',
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    id: 'LND-2026-005',
    customerName: 'Siti Rahmawati',
    customerPhone: '087766554433',
    isMember: false,
    serviceType: 'wash_dry',
    weightKg: 12, // Large load (2 washers or large)
    washerCoins: 2,
    dryerCoins: 2,
    washerMachineId: 'W-03',
    dryerMachineId: 'D-03',
    detergentId: 'det-3',
    detergentName: 'Baby-Gentle Hypoallergenic',
    detergentPrice: 4000,
    fragranceId: 'frag-6',
    fragranceName: 'Pure Cotton & Baby Powder',
    fragrancePrice: 2000,
    fragranceAroma: 'Soft & Clean',
    addOns: [
      { id: 'add-1', name: 'Plastik Laundry Jumbo', price: 3000, qty: 1 }
    ],
    subtotal: 49000,
    discount: 0,
    finalPrice: 49000,
    paymentMethod: 'transfer',
    paymentStatus: 'paid',
    status: 'washing',
    statusHistory: {
      queueAt: new Date(Date.now() - 30 * 60000).toISOString(),
      washingAt: new Date(Date.now() - 28 * 60000).toISOString(),
    },
    estimatedReadyTime: new Date(Date.now() + 55 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'LND-2026-006',
    customerName: 'Hendra Setiawan',
    customerPhone: '081299001122',
    isMember: true,
    memberId: 'MBR-003',
    serviceType: 'wash_only',
    weightKg: 6,
    washerCoins: 1,
    dryerCoins: 0,
    washerMachineId: 'W-05',
    detergentId: 'det-1',
    detergentName: 'Liquid Premium Anti-Bakteri',
    detergentPrice: 0,
    fragranceId: 'frag-1',
    fragranceName: 'Sakura Blossom Deluxe',
    fragrancePrice: 0,
    addOns: [],
    subtotal: 10000,
    discount: 0,
    finalPrice: 10000,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    status: 'ready',
    statusHistory: {
      queueAt: new Date(Date.now() - 50 * 60000).toISOString(),
      washingAt: new Date(Date.now() - 45 * 60000).toISOString(),
      readyAt: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    estimatedReadyTime: new Date(Date.now() - 5 * 60000).toISOString(),
    notes: 'Jemur sendiri di rumah',
    createdAt: new Date(Date.now() - 50 * 60000).toISOString(),
  },
  {
    id: 'LND-2026-007',
    customerName: 'Dewi Lestari',
    customerPhone: '085712345678',
    isMember: true,
    memberId: 'MBR-002',
    serviceType: 'wash_dry',
    weightKg: 7,
    washerCoins: 1,
    dryerCoins: 1,
    washerMachineId: 'W-01',
    dryerMachineId: 'D-02',
    detergentId: 'det-2',
    detergentName: 'Eco-Green Enzymatic (Organik)',
    detergentPrice: 3000,
    fragranceId: 'frag-5',
    fragranceName: 'Sweet Vanilla & Almond',
    fragrancePrice: 2000,
    fragranceAroma: 'Sweet Gourmand',
    addOns: [],
    subtotal: 25000,
    discount: 10000, // Claimed Free Wash 1x!
    finalPrice: 15000,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    status: 'completed',
    statusHistory: {
      queueAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      washingAt: new Date(Date.now() - 23.5 * 3600000).toISOString(),
      dryingAt: new Date(Date.now() - 22.8 * 3600000).toISOString(),
      readyAt: new Date(Date.now() - 22 * 3600000).toISOString(),
      completedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    },
    estimatedReadyTime: new Date(Date.now() - 22 * 3600000).toISOString(),
    notes: 'Klaim voucher cuci gratis 10x cuci',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    freeWashClaimed: true,
  },
];

export const INITIAL_EXPENSES: FinancialExpense[] = [
  {
    id: 'exp-1',
    date: '2026-11-01',
    category: 'electricity',
    title: 'Token Listrik PLN 3 Phase 11.000 VA',
    amount: 1500000,
    notes: 'Listrik operasional awal bulan',
  },
  {
    id: 'exp-2',
    date: '2026-11-02',
    category: 'water',
    title: 'Tagihan Air PDAM & Filter Ozon',
    amount: 450000,
    notes: 'Termasuk penggantian filter sediment 5 micron',
  },
  {
    id: 'exp-3',
    date: '2026-11-03',
    category: 'detergent_restock',
    title: 'Restock Deterjen Liquid Premium (2 Jerigen @20 Liter)',
    amount: 380000,
    notes: 'Pemasok PT Indo Kimia Bersih',
  },
  {
    id: 'exp-4',
    date: '2026-11-04',
    category: 'fragrance_restock',
    title: 'Restock Parfum Laundry Sakura & Ocean (4 Jerigen @5 Liter)',
    amount: 420000,
    notes: 'Bibit parfum grade A tahan lama',
  },
  {
    id: 'exp-5',
    date: '2026-11-05',
    category: 'maintenance',
    title: 'Service Rutin Dryer Gas & Pembersihan Lint Trap',
    amount: 250000,
    notes: 'Teknisi Speed Queen resmi',
  },
];

// Helper functions for LocalStorage
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error loading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export const StorageService = {
  getOrders(): LaundryOrder[] {
    const list = loadFromStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    let modified = false;

    // 1. Ensure LND-2026-220 is present and its status is 'ready' (Udah bisa diambil)
    const idx220 = list.findIndex((o) => o.id === 'LND-2026-220');
    if (idx220 >= 0) {
      if (list[idx220].status !== 'ready' && list[idx220].status !== 'completed') {
        list[idx220].status = 'ready';
        if (!list[idx220].statusHistory.readyAt) {
          list[idx220].statusHistory.readyAt = new Date().toISOString();
        }
        modified = true;
      }
    } else {
      const order220 = INITIAL_ORDERS.find((o) => o.id === 'LND-2026-220');
      if (order220) {
        list.unshift(order220);
        modified = true;
      }
    }

    // 2. Ensure LND-2026-557 is present
    if (!list.some((o) => o.id === 'LND-2026-557')) {
      const order557 = INITIAL_ORDERS.find((o) => o.id === 'LND-2026-557');
      if (order557) {
        list.unshift(order557);
        modified = true;
      }
    }

    if (modified) {
      this.saveOrders(list);
    }
    return list;
  },
  saveOrders(orders: LaundryOrder[]): void {
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('koinwash_orders_sync', { detail: orders }));
      }
    } catch (e) {
      // ignore
    }
  },
  addOrder(order: LaundryOrder): void {
    const orders = this.getOrders();
    orders.unshift(order);
    this.saveOrders(orders);
  },
  updateOrderStatus(orderId: string, status: LaundryOrder['status']): LaundryOrder | null {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return null;

    const order = orders[orderIndex];
    order.status = status;
    const nowIso = new Date().toISOString();

    if (status === 'washing' && !order.statusHistory.washingAt) {
      order.statusHistory.washingAt = nowIso;
    } else if (status === 'drying' && !order.statusHistory.dryingAt) {
      order.statusHistory.dryingAt = nowIso;
    } else if (status === 'ready' && !order.statusHistory.readyAt) {
      order.statusHistory.readyAt = nowIso;
    } else if (status === 'completed' && !order.statusHistory.completedAt) {
      order.statusHistory.completedAt = nowIso;
    }

    orders[orderIndex] = order;
    this.saveOrders(orders);
    return order;
  },

  getMembers(): CustomerMember[] {
    return loadFromStorage(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  },
  saveMembers(members: CustomerMember[]): void {
    saveToStorage(STORAGE_KEYS.MEMBERS, members);
  },
  findMemberByPhone(phone: string): CustomerMember | undefined {
    const cleaned = phone.replace(/[^0-9]/g, '');
    return this.getMembers().find((m) => m.phone.replace(/[^0-9]/g, '') === cleaned);
  },
  upsertMember(member: CustomerMember): void {
    const members = this.getMembers();
    const idx = members.findIndex((m) => m.id === member.id || m.phone === member.phone);
    if (idx >= 0) {
      members[idx] = member;
    } else {
      members.unshift(member);
    }
    this.saveMembers(members);
  },
  incrementMemberWash(memberId: string, spendAmount: number, isFreeWashClaimed: boolean = false): CustomerMember | null {
    const members = this.getMembers();
    const member = members.find((m) => m.id === memberId);
    if (!member) return null;

    member.totalCompletedWashes += 1;
    member.totalSpent += spendAmount;

    if (isFreeWashClaimed && member.availableFreeWashVouchers > 0) {
      member.availableFreeWashVouchers -= 1;
    }

    if (!isFreeWashClaimed) {
      // Normal paid wash increments loyalty counter
      member.washCount += 1;
      if (member.washCount >= 10) {
        member.availableFreeWashVouchers += 1;
        member.washCount = 0; // Reset counter for next 10 cycle or keep track
      }
    }

    this.saveMembers(members);
    return member;
  },

  getDetergents(): DetergentOption[] {
    return loadFromStorage(STORAGE_KEYS.DETERGENTS, INITIAL_DETERGENTS);
  },
  saveDetergents(items: DetergentOption[]): void {
    saveToStorage(STORAGE_KEYS.DETERGENTS, items);
  },

  getFragrances(): FragranceOption[] {
    return loadFromStorage(STORAGE_KEYS.FRAGRANCES, INITIAL_FRAGRANCES);
  },
  saveFragrances(items: FragranceOption[]): void {
    saveToStorage(STORAGE_KEYS.FRAGRANCES, items);
  },

  getMachines(): LaundryMachine[] {
    return loadFromStorage(STORAGE_KEYS.MACHINES, INITIAL_MACHINES);
  },
  saveMachines(machines: LaundryMachine[]): void {
    saveToStorage(STORAGE_KEYS.MACHINES, machines);
  },

  getExpenses(): FinancialExpense[] {
    return loadFromStorage(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  },
  saveExpenses(expenses: FinancialExpense[]): void {
    saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
  },
  addExpense(expense: FinancialExpense): void {
    const list = this.getExpenses();
    list.unshift(expense);
    this.saveExpenses(list);
  },

  getStoreProfile(): StoreProfile {
    const profile = loadFromStorage(STORAGE_KEYS.STORE, DEFAULT_STORE_PROFILE);
    if (
      !profile ||
      profile.name === 'KOINWASH EXPRESS' ||
      profile.name.includes('KOINWASH') ||
      profile.address.includes('Kemang') ||
      profile.phone === '081288997722'
    ) {
      const updated: StoreProfile = {
        ...DEFAULT_STORE_PROFILE,
        ...profile,
        name: 'DENBAGUS LAUNDRY COIN',
        address: DEFAULT_STORE_PROFILE.address,
        branch: DEFAULT_STORE_PROFILE.branch,
        mapsUrl: DEFAULT_STORE_PROFILE.mapsUrl,
        phone: DEFAULT_STORE_PROFILE.phone,
      };
      this.saveStoreProfile(updated);
      return updated;
    }
    return profile;
  },
  saveStoreProfile(profile: StoreProfile): void {
    saveToStorage(STORAGE_KEYS.STORE, profile);
  },

  getSession(): UserSession | null {
    return loadFromStorage<UserSession | null>(STORAGE_KEYS.SESSION, null);
  },
  saveSession(session: UserSession): void {
    saveToStorage(STORAGE_KEYS.SESSION, session);
  },
  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.DETERGENTS);
    localStorage.removeItem(STORAGE_KEYS.FRAGRANCES);
    localStorage.removeItem(STORAGE_KEYS.MACHINES);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.STORE);
  },
};
