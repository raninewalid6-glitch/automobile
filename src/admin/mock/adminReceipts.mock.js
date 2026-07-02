export const receiptTypes = ["BOOKING", "PURCHASE"];

export const receiptTypeLabels = {
  BOOKING: "Réservation",
  PURCHASE: "Achat",
};

export const receiptTypeStyles = {
  BOOKING: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  PURCHASE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export const receiptPaymentMethods = ["WAAFI", "DMONEY", "MASTERCARD", "CASH", "BANK_TRANSFER"];

export const receiptPaymentMethodLabels = {
  WAAFI: "WAAFI",
  DMONEY: "D-Money",
  MASTERCARD: "Mastercard",
  CASH: "Cash",
  BANK_TRANSFER: "Bank transfer",
};

export const adminReceipts = [
  {
    receiptNumber: "REC-2026-0001",
    bookingOrPurchaseId: "RES-9104",
    client: "Moussa Aden",
    car: "Hyundai Tucson Limited 2022",
    owner: "Amina Auto",
    type: "BOOKING",
    totalAmount: 380,
    commissionAmount: 46,
    ownerAmount: 334,
    paymentMethod: "WAAFI",
    issuedAt: "2026-05-15T09:31:00Z",
  },
  {
    receiptNumber: "REC-2026-0002",
    bookingOrPurchaseId: "PUR-24016",
    client: "Roda Warsama",
    car: "Toyota Hilux Double Cab 2021",
    owner: "Nord Tours",
    type: "PURCHASE",
    totalAmount: 29800,
    commissionAmount: 1490,
    ownerAmount: 28310,
    paymentMethod: "DMONEY",
    issuedAt: "2026-05-12T13:18:00Z",
  },
  {
    receiptNumber: "REC-2026-0003",
    bookingOrPurchaseId: "RES-9098",
    client: "Mahad Jama",
    car: "Kia Sportage LX 2021",
    owner: "Tadjourah Mobility",
    type: "BOOKING",
    totalAmount: 126,
    commissionAmount: 15,
    ownerAmount: 111,
    paymentMethod: "CASH",
    issuedAt: "2026-05-04T11:35:00Z",
  },
  {
    receiptNumber: "REC-2026-0004",
    bookingOrPurchaseId: "PUR-24014",
    client: "Ayan Daher",
    car: "Hyundai Accent Smart 2021",
    owner: "Amina Auto",
    type: "PURCHASE",
    totalAmount: 1200,
    commissionAmount: 66,
    ownerAmount: 1134,
    paymentMethod: "CASH",
    issuedAt: "2026-05-10T15:09:00Z",
  },
  {
    receiptNumber: "REC-2026-0005",
    bookingOrPurchaseId: "RES-9075",
    client: "Ayan Daher",
    car: "Toyota Corolla Hybrid 2020",
    owner: "Djib Fleet Services",
    type: "BOOKING",
    totalAmount: 210,
    commissionAmount: 25,
    ownerAmount: 185,
    paymentMethod: "WAAFI",
    issuedAt: "2026-04-19T10:23:00Z",
  },
  {
    receiptNumber: "REC-2026-0006",
    bookingOrPurchaseId: "PUR-24017",
    client: "Duale Import",
    car: "Nissan Patrol Platinum 2020",
    owner: "Sabieh Rent",
    type: "PURCHASE",
    totalAmount: 46200,
    commissionAmount: 2079,
    ownerAmount: 44121,
    paymentMethod: "BANK_TRANSFER",
    issuedAt: "2026-05-15T16:40:00Z",
  },
];
