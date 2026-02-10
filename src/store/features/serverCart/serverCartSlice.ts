import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../../supabaseClient";
import type { CartItem } from "../cart/cartSlice";

export type ServerCartState = {
  cartId: string | null;
  syncing: boolean;
  error: string | null;
};

const initialState: ServerCartState = {
  cartId: null,
  syncing: false,
  error: null,
};


export const ensureActiveServerCart = createAsyncThunk(
  "serverCart/ensureActive",
  async (userId: string) => {
    const existing = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (existing.error) throw new Error(existing.error.message);
    if (existing.data?.id) return existing.data.id as string;

    const created = await supabase
      .from("carts")
      .insert({ user_id: userId, status: "active" })
      .select("id")
      .single();

    if (created.error) throw new Error(created.error.message);
    return created.data.id as string;
  },
);

export const loadServerCartToLocal = createAsyncThunk(
  "serverCart/loadToLocal",
  async (userId: string): Promise<{ cartId: string; items: CartItem[] }> => {
    
    const cartId = await (async () => {
      const existing = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      if (existing.error) throw new Error(existing.error.message);
      if (existing.data?.id) return existing.data.id as string;

      const created = await supabase
        .from("carts")
        .insert({ user_id: userId, status: "active" })
        .select("id")
        .single();
      if (created.error) throw new Error(created.error.message);
      return created.data.id as string;
    })();

    const { data, error } = await supabase
      .from("cart_items")
      .select(
        "service_id, package_id, booking_date, departure_arrival_time, airport_type, address, unit_price_micros, currency, adults, children, infants, adult_price_micros, child_price_micros, infant_price_micros, child_age_range, infant_age_range, services(service_name, location), packages(name)",
      )
      .eq("cart_id", cartId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    const items: CartItem[] = (data ?? []).map((row: any) => {
      const adults = row.adults ?? 1;
      const children = row.children ?? 0;
      const infants = row.infants ?? 0;
      const unitPrice = Number(row.unit_price_micros ?? 0) / 1_000_000;

      return {
        serviceId: Number(row.service_id),
        serviceName: row.services?.service_name ?? null,
        location: row.services?.location ?? null,
        packageId: row.package_id == null ? null : Number(row.package_id),
        packageName:
          row.packages?.name ?? (row.package_id ? null : "Standard Experience"),
        bookingDate: String(row.booking_date),
        bookingTime: row.departure_arrival_time ?? null,
        airportType: row.airport_type ?? null,
        address: row.address ?? null,
        unitPrice,
        quantity: adults + children + infants,
        participants: { adults, children, infants },
        participantPricing: {
          adultPrice:
            row.adult_price_micros != null
              ? Number(row.adult_price_micros) / 1_000_000
              : unitPrice,
          childPrice:
            row.child_price_micros != null
              ? Number(row.child_price_micros) / 1_000_000
              : null,
          infantPrice:
            row.infant_price_micros != null
              ? Number(row.infant_price_micros) / 1_000_000
              : null,
        },
        childAgeRange: row.child_age_range ?? null,
        infantAgeRange: row.infant_age_range ?? null,
      };
    });

    return { cartId, items };
  },
);

export const addServerCartItem = createAsyncThunk(
  "serverCart/addItem",
  async (args: { userId: string; item: CartItem }) => {
    const cartId = await (async () => {
      const existing = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", args.userId)
        .eq("status", "active")
        .maybeSingle();
      if (existing.error) throw new Error(existing.error.message);
      if (existing.data?.id) return existing.data.id as string;

      const created = await supabase
        .from("carts")
        .insert({ user_id: args.userId, status: "active" })
        .select("id")
        .single();
      if (created.error) throw new Error(created.error.message);
      return created.data.id as string;
    })();

    const it = args.item;
    const row = {
      cart_id: cartId,
      service_id: it.serviceId,
      package_id: it.packageId,
      booking_date: it.bookingDate,
      departure_arrival_time: it.bookingTime ?? null,
      airport_type: it.airportType,
      address: it.address,
      unit_price_micros: Math.round((Number(it.unitPrice) || 0) * 1_000_000),
      currency: "aed",
      
      adults: it.participants?.adults ?? 1,
      children: it.participants?.children ?? 0,
      infants: it.participants?.infants ?? 0,
      adult_price_micros: it.participantPricing?.adultPrice
        ? Math.round(it.participantPricing.adultPrice * 1_000_000)
        : null,
      child_price_micros:
        it.participantPricing?.childPrice != null
          ? Math.round(it.participantPricing.childPrice * 1_000_000)
          : null,
      infant_price_micros:
        it.participantPricing?.infantPrice != null
          ? Math.round(it.participantPricing.infantPrice * 1_000_000)
          : null,
      child_age_range: it.childAgeRange ?? null,
      infant_age_range: it.infantAgeRange ?? null,
    };

    const { error } = await supabase.from("cart_items").insert(row);
    if (error) {
      
      if (
        String((error as any).code) === "23505" ||
        (error as any).status === 409
      ) {
        return { cartId, inserted: false };
      }
      throw new Error(error.message);
    }

    return { cartId, inserted: true };
  },
);

export const removeServerCartItem = createAsyncThunk(
  "serverCart/removeItem",
  async (args: {
    cartId: string;
    serviceId: number;
    bookingDate: string;
    bookingTime: string | null;
  }) => {
    
    const t = args.bookingTime;
    let q = supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", args.cartId)
      .eq("service_id", args.serviceId)
      .eq("booking_date", args.bookingDate);

    if (t == null || t === "") {
      
      q = q.or(
        "departure_arrival_time.is.null,departure_arrival_time.eq.00:00:00",
      );
    } else {
      q = q.eq("departure_arrival_time", t);
    }

    const { error } = await q;
    if (error) throw new Error(error.message);

    return { removed: true };
  },
);

export const clearServerCart = createAsyncThunk(
  "serverCart/clear",
  async (cartId: string) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);
    if (error) throw new Error(error.message);
    return { cleared: true };
  },
);


export const syncCartToServer = createAsyncThunk(
  "serverCart/syncToServer",
  async (args: { userId: string; items: CartItem[] }) => {
    const { userId, items } = args;
    if (!items.length) return { cartId: null as string | null, inserted: 0 };

    const { data: activeCart, error: activeErr } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (activeErr) throw new Error(activeErr.message);

    let cartId = activeCart?.id as string | undefined;
    if (!cartId) {
      const { data: created, error: createErr } = await supabase
        .from("carts")
        .insert({ user_id: userId, status: "active" })
        .select("id")
        .single();

      if (createErr) throw new Error(createErr.message);
      cartId = created.id as string;
    }

    const rows = items.map((it) => ({
      cart_id: cartId,
      service_id: it.serviceId,
      package_id: it.packageId,
      booking_date: it.bookingDate,
      departure_arrival_time: it.bookingTime ?? null,
      airport_type: it.airportType,
      address: it.address,
      unit_price_micros: Math.round((Number(it.unitPrice) || 0) * 1_000_000),
      currency: "aed",
    }));

    let inserted = 0;
    for (const row of rows) {
      const { error } = await supabase.from("cart_items").insert(row);
      if (!error) {
        inserted++;
        continue;
      }
      if (String((error as any).code) === "23505") continue;
      if ((error as any).status === 409) continue;
      throw new Error(error.message);
    }

    return { cartId, inserted };
  },
);

export const serverCartSlice = createSlice({
  name: "serverCart",
  initialState,
  reducers: {
    clearServerCartState: (state) => {
      state.cartId = null;
      state.syncing = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ensureActiveServerCart.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(ensureActiveServerCart.fulfilled, (state, action) => {
        state.syncing = false;
        state.cartId = action.payload;
      })
      .addCase(ensureActiveServerCart.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.error.message ?? "Failed to ensure server cart";
      })
      .addCase(loadServerCartToLocal.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(loadServerCartToLocal.fulfilled, (state, action) => {
        state.syncing = false;
        state.cartId = action.payload.cartId;
      })
      .addCase(loadServerCartToLocal.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.error.message ?? "Failed to load server cart";
      })
      .addCase(addServerCartItem.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(addServerCartItem.fulfilled, (state, action) => {
        state.syncing = false;
        state.cartId = action.payload.cartId;
      })
      .addCase(addServerCartItem.rejected, (state, action) => {
        state.syncing = false;
        state.error =
          action.error.message ?? "Failed to add item to server cart";
      })
      .addCase(removeServerCartItem.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(removeServerCartItem.fulfilled, (state) => {
        state.syncing = false;
      })
      .addCase(removeServerCartItem.rejected, (state, action) => {
        state.syncing = false;
        state.error =
          action.error.message ?? "Failed to remove item from server cart";
      })
      .addCase(clearServerCart.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(clearServerCart.fulfilled, (state) => {
        state.syncing = false;
      })
      .addCase(clearServerCart.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.error.message ?? "Failed to clear server cart";
      })
      .addCase(syncCartToServer.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(syncCartToServer.fulfilled, (state, action) => {
        state.syncing = false;
        state.cartId = action.payload.cartId;
      })
      .addCase(syncCartToServer.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.error.message ?? "Failed to sync cart";
      });
  },
});

export const { clearServerCartState } = serverCartSlice.actions;
export default serverCartSlice.reducer;
