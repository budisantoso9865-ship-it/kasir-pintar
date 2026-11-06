import { LaundryOrder, CustomerMember, StoreProfile } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeOnly(isoString: string): string {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Convert standard Indonesian phone (08xx or 628xx) to WhatsApp international format (628xxx)
 */
export function formatWhatsAppPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Generate a beautifully formatted WhatsApp text message with receipt details and tracking link
 */
export function generateWhatsAppMessage(
  order: LaundryOrder,
  member: CustomerMember | null | undefined,
  store: StoreProfile,
  appUrl: string = window.location.origin
): string {
  const trackingUrl = `${appUrl}?track=${encodeURIComponent(order.id)}`;

  let loyaltyInfo = '';
  if (member) {
    const starsFilled = '★'.repeat(member.washCount);
    const starsEmpty = '☆'.repeat(Math.max(0, 10 - member.washCount));
    const remaining = 10 - member.washCount;

    loyaltyInfo = `
⭐ *STATUS MEMBER LOYALITAS*
• Progres Cuci: [${starsFilled}${starsEmpty}] ${member.washCount}/10
${
  member.availableFreeWashVouchers > 0
    ? `🎁 *SELAMAT! Anda memiliki ${member.availableFreeWashVouchers}x Cuci GRATIS* yang bisa diklaim!`
    : remaining > 0
    ? `✨ Cuci *${remaining}x lagi* untuk dapatkan *1x CUCI GRATIS*!`
    : `🎉 Selamat! Target 10x cuci tercapai!`
}`;
  }

  const serviceName =
    order.serviceType === 'wash_dry'
      ? 'Cuci + Kering (Complete Combo)'
      : order.serviceType === 'wash_only'
      ? 'Cuci Saja (Wash Only)'
      : 'Kering Saja (Dry Only)';

  const discountText =
    order.discount > 0
      ? `\n• Diskon / Voucher: -${formatRupiah(order.discount)} ${order.freeWashClaimed ? '(🎉 REWARD 10X CUCI GRATIS)' : ''}`
      : '';

  const addOnsText =
    order.addOns && order.addOns.length > 0
      ? '\n• Tambahan: ' + order.addOns.map((a) => `${a.name} (${formatRupiah(a.price)})`).join(', ')
      : '';
  let detergentLines = '';
  if (order.selectedDetergents && order.selectedDetergents.length > 0) {
    detergentLines = order.selectedDetergents
      .map(
        (d) =>
          `• Deterjen : ${d.qty}x ${d.name} (${
            d.price === 0 ? 'Include Koin' : `@${formatRupiah(d.price)} = ${formatRupiah(d.subtotal)}`
          })`
      )
      .join('\n');
  } else {
    detergentLines = `• Deterjen : ${order.detergentName} (${
      order.detergentPrice === 0 ? 'Sudah Termasuk' : formatRupiah(order.detergentPrice)
    })`;
  }

  let fragranceLines = '';
  if (order.selectedFragrances && order.selectedFragrances.length > 0) {
    fragranceLines = order.selectedFragrances
      .map(
        (f) =>
          `• Pewangi  : ${f.qty}x ${f.name} [${f.aromaGroup || 'Aroma Segar'}] (${
            f.price === 0 ? 'Gratis' : `@${formatRupiah(f.price)} = ${formatRupiah(f.subtotal)}`
          })`
      )
      .join('\n');
  } else {
    fragranceLines = `• Pewangi  : ${order.fragranceName} [${
      order.fragranceAroma || 'Aroma Segar'
    }] (${order.fragrancePrice === 0 ? 'Gratis' : formatRupiah(order.fragrancePrice)})`;
  }

  const mapsText = store.mapsUrl ? `\n📍 Google Maps: ${store.mapsUrl}` : '';

  return `🧺 *NOTA ELEKTRONIK - ${store.name}*
${store.address}${mapsText}
Telp / WA: ${store.phone}
----------------------------------------
No. Nota    : *${order.id}*
Tanggal     : ${formatDateTime(order.createdAt)}
Pelanggan   : *${order.customerName}*
Layanan     : ${serviceName}
Berat       : ${order.weightKg} Kg
Mesin Cuci  : ${order.washerMachineId || '-'}
Mesin Kering: ${order.dryerMachineId || '-'}
----------------------------------------
🧴 *PILIHAN SABUN & PEWANGI:*
${detergentLines}
${fragranceLines}
----------------------------------------
💰 *RINCIAN PEMBAYARAN:*
• Subtotal       : ${formatRupiah(order.subtotal)}${discountText}${addOnsText}
• *TOTAL BAYAR*  : *${formatRupiah(order.finalPrice)}*
• Metode Bayar   : ${order.paymentMethod.toUpperCase()} (${order.paymentStatus === 'paid' ? 'LUNAS ✅' : 'BELUM LUNAS'})
----------------------------------------${loyaltyInfo}
----------------------------------------
📍 *Lacak Status Cucian Anda Secara Real-Time:*
Klik link berikut untuk memantau cucian Anda langsung:
👉 ${trackingUrl}

Estimasi Selesai: *${formatTimeOnly(order.estimatedReadyTime)} WIB*

Terima kasih telah mempercayakan pakaian Anda di ${store.name}! 🙏`;
}

/**
 * Returns direct WhatsApp URL
 */
export function getWhatsAppUrl(
  order: LaundryOrder,
  member: CustomerMember | null | undefined,
  store: StoreProfile
): string {
  const phone = formatWhatsAppPhone(order.customerPhone);
  const message = generateWhatsAppMessage(order, member, store);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
