import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  serviceId: number;
  serviceName?: string | null;
  serviceImage?: string | null;
  location?: string | null;
  packageId: number | null;
  packageName?: string | null;
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string | null; // HH:mm (optional)
  airportType: "pickup" | "dropoff" | null;
  address: string | null;
  unitPrice: number; // in major units (AED) - price per single item
  quantity: number; // number of tickets/bookings
  participants?: {
    adults: number;
    children: number;
    infants: number;
  };
};

export type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

const keyOf = (i: CartItem) =>
  `${i.serviceId}__${i.packageId ?? "base"}__${i.bookingDate}__${i.bookingTime ?? ""}`;

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

      if (existingIndex >= 0) {
        // Increase quantity if item exists
        state.items[existingIndex].quantity += incoming.quantity || 1;
      } else {
        // Add new item with quantity
        state.items.push({
          ...incoming,
          quantity: incoming.quantity || 1,
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
      const itemIndex = state.items.findIndex(
        (x) =>
          x.serviceId === serviceId &&
          x.packageId === packageId &&
          x.bookingDate === bookingDate &&
          (x.bookingTime ?? null) === (bookingTime ?? null),
      );

      if (itemIndex >= 0) {
        const item = state.items[itemIndex];
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items.splice(itemIndex, 1);
        }
      }
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
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
