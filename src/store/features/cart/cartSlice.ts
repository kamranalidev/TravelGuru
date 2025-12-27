import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  serviceId: number;
  serviceName?: string | null;
  location?: string | null;
  packageId: number | null;
  packageName?: string | null;
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string | null; // HH:mm (optional)
  airportType: "pickup" | "dropoff" | null;
  address: string | null;
  unitPrice: number; // in major units (AED)
};

export type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

const keyOf = (i: CartItem) =>
  `${i.serviceId}__${i.bookingDate}__${i.bookingTime ?? ""}`;

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const incoming = action.payload;
      const incomingKey = keyOf(incoming);

      // Prevent booking the same service twice for the same date and time
      const exists = state.items.some((x) => keyOf(x) === incomingKey);
      if (exists) return;

      state.items.push(incoming);
    },
    removeItem: (
      state,
      action: PayloadAction<{ serviceId: number; bookingDate: string; bookingTime: string | null }>
    ) => {
      const { serviceId, bookingDate, bookingTime } = action.payload;
      state.items = state.items.filter(
        (x) =>
          !(
            x.serviceId === serviceId &&
            x.bookingDate === bookingDate &&
            (x.bookingTime ?? null) === (bookingTime ?? null)
          )
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
