import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ParticipantCounts = {
  adults: number;
  children: number;
  infants: number;
};

export type ParticipantPricing = {
  adultPrice: number;
  childPrice: number | null; // null means children not available
  infantPrice: number | null; // null means infants not available
};

export type CartItem = {
  serviceId: number;
  serviceName?: string | null;
  serviceImage?: string | null;
  location?: string | null;
  packageId: number | null;
  packageName?: string | null;
  packageImage?: string | null; // Package-specific image
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string | null; // HH:mm (optional)
  airportType: "pickup" | "dropoff" | null;
  address: string | null;
  unitPrice: number; // in major units (AED) - base price (adult price)
  quantity: number; // total number of tickets (adults + children + infants)
  participants: ParticipantCounts;
  participantPricing?: ParticipantPricing; // individual prices per type
};

export type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

const keyOf = (i: CartItem) =>
  `${i.serviceId}__${i.packageId ?? "base"}__${i.bookingDate}__${i.bookingTime ?? ""}`;

// Calculate total price based on participants
const calculateTotalFromParticipants = (item: CartItem): number => {
  const pricing = item.participantPricing;
  const participants = item.participants;
  
  if (!pricing) {
    // Fall back to unitPrice * quantity if no participant pricing
    return item.unitPrice * item.quantity;
  }
  
  const adultTotal = participants.adults * pricing.adultPrice;
  const childTotal = participants.children * (pricing.childPrice ?? 0);
  const infantTotal = participants.infants * (pricing.infantPrice ?? 0);
  
  return adultTotal + childTotal + infantTotal;
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const incoming = action.payload;
      const incomingKey = keyOf(incoming);

      // Check if item already exists
      const existingIndex = state.items.findIndex(
        (x) => keyOf(x) === incomingKey,
      );

      // Ensure participants has default values
      const normalizedParticipants = incoming.participants || {
        adults: incoming.quantity || 1,
        children: 0,
        infants: 0,
      };

      const totalQuantity =
        normalizedParticipants.adults +
        normalizedParticipants.children +
        normalizedParticipants.infants;

      if (existingIndex >= 0) {
        // Update participants if item exists
        const existing = state.items[existingIndex];
        existing.participants = {
          adults: existing.participants.adults + normalizedParticipants.adults,
          children: existing.participants.children + normalizedParticipants.children,
          infants: existing.participants.infants + normalizedParticipants.infants,
        };
        existing.quantity =
          existing.participants.adults +
          existing.participants.children +
          existing.participants.infants;
        // Keep pricing info
        if (incoming.participantPricing) {
          existing.participantPricing = incoming.participantPricing;
        }
      } else {
        // Add new item with participants
        state.items.push({
          ...incoming,
          participants: normalizedParticipants,
          quantity: totalQuantity || 1,
        });
      }
    },

    updateQuantity: (
      state,
      action: PayloadAction<{
        serviceId: number;
        packageId: number | null;
        bookingDate: string;
        bookingTime: string | null;
        quantity: number;
      }>,
    ) => {
      const { serviceId, packageId, bookingDate, bookingTime, quantity } =
        action.payload;
      const item = state.items.find(
        (x) =>
          x.serviceId === serviceId &&
          x.packageId === packageId &&
          x.bookingDate === bookingDate &&
          (x.bookingTime ?? null) === (bookingTime ?? null),
      );

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((x) => x !== item);
        } else {
          item.quantity = quantity;
        }
      }
    },

    incrementQuantity: (
      state,
      action: PayloadAction<{
        serviceId: number;
        packageId: number | null;
        bookingDate: string;
        bookingTime: string | null;
      }>,
    ) => {
      const { serviceId, packageId, bookingDate, bookingTime } = action.payload;
      const item = state.items.find(
        (x) =>
          x.serviceId === serviceId &&
          x.packageId === packageId &&
          x.bookingDate === bookingDate &&
          (x.bookingTime ?? null) === (bookingTime ?? null),
      );

      if (item) {
        item.quantity += 1;
      }
    },

    decrementQuantity: (
      state,
      action: PayloadAction<{
        serviceId: number;
        packageId: number | null;
        bookingDate: string;
        bookingTime: string | null;
      }>,
    ) => {
      const { serviceId, packageId, bookingDate, bookingTime } = action.payload;
      const item = state.items.find(
        (x) =>
          x.serviceId === serviceId &&
          x.packageId === packageId &&
          x.bookingDate === bookingDate &&
          (x.bookingTime ?? null) === (bookingTime ?? null),
      );

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
      // Don't allow quantity to go below 1 - use removeItem instead
    },

    removeItem: (
      state,
      action: PayloadAction<{
        serviceId: number;
        packageId?: number | null;
        bookingDate: string;
        bookingTime: string | null;
      }>,
    ) => {
      const { serviceId, packageId, bookingDate, bookingTime } = action.payload;
      state.items = state.items.filter(
        (x) =>
          !(
            x.serviceId === serviceId &&
            (packageId === undefined || x.packageId === packageId) &&
            x.bookingDate === bookingDate &&
            (x.bookingTime ?? null) === (bookingTime ?? null)
          ),
      );
    },

    // Update participant counts for an item
    updateParticipants: (
      state,
      action: PayloadAction<{
        serviceId: number;
        packageId: number | null;
        bookingDate: string;
        bookingTime: string | null;
        participants: ParticipantCounts;
      }>,
    ) => {
      const { serviceId, packageId, bookingDate, bookingTime, participants } =
        action.payload;
      const item = state.items.find(
        (x) =>
          x.serviceId === serviceId &&
          x.packageId === packageId &&
          x.bookingDate === bookingDate &&
          (x.bookingTime ?? null) === (bookingTime ?? null),
      );

      if (item) {
        // Ensure at least 1 adult
        const normalizedParticipants = {
          adults: Math.max(1, participants.adults),
          children: Math.max(0, participants.children),
          infants: Math.max(0, participants.infants),
        };
        item.participants = normalizedParticipants;
        item.quantity =
          normalizedParticipants.adults +
          normalizedParticipants.children +
          normalizedParticipants.infants;
      }
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addItem,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  removeItem,
  updateParticipants,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
