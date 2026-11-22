import { firstServiceImage } from "../../../utils/serviceImages";
import { tripEndDate } from "../../../utils/tripDates";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../../supabaseClient";
import type { CartItem } from "../cart/cartSlice";

const cartRow = (cartId: string, it: CartItem) => ({
  cart_id: cartId, service_id: it.serviceId, package_id: it.packageId,
  booking_date: it.bookingDate, booking_end_date: it.bookingEndDate || tripEndDate(it.bookingDate, it.durationDays || 1),
  duration_days: it.durationDays || 1,
  departure_arrival_time: it.bookingTime || null, airport_type: it.airportType, address: it.address,
  unit_price_micros: Math.round((Number(it.unitPrice) || 0) * 1_000_000), currency: "aed",
  adults: it.participants.adults, children: it.participants.children, infants: it.participants.infants,
  adult_price_micros: Math.round((it.participantPricing?.adultPrice ?? it.unitPrice) * 1_000_000),
  child_price_micros: it.participantPricing?.childPrice == null ? null : Math.round(it.participantPricing.childPrice * 1_000_000),
  infant_price_micros: it.participantPricing?.infantPrice == null ? null : Math.round(it.participantPricing.infantPrice * 1_000_000),
});

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

/**
 * Ensures the current user has an active server-side cart row.
 * Returns the cart id.
 */
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
    // ensure active cart
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
        "service_id, package_id, booking_date, booking_end_date, duration_days, departure_arrival_time, airport_type, address, unit_price_micros, currency, adults, children, infants, adult_price_micros, child_price_micros, infant_price_micros, services(service_name, location, service_image), packages(name, package_image)",
      )
      .eq("cart_id", cartId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    const items: CartItem[] = (data ?? []).map((row: any) => ({
      serviceId: Number(row.service_id),
      serviceName: row.services?.service_name ?? null,
      serviceImage: firstServiceImage(row.services?.service_image) ?? null,
      location: row.services?.location ?? null,
      packageId: row.package_id == null ? null : Number(row.package_id),
      packageName:
        row.packages?.name ?? (row.package_id ? null : "Standard Experience"),
      bookingDate: String(row.booking_date),
      bookingEndDate: row.booking_end_date || row.booking_date,
      durationDays: row.duration_days || 1,
      packageImage: row.packages?.package_image || null,
      bookingTime: row.departure_arrival_time ?? null,
      airportType: row.airport_type ?? null,
      address: row.address ?? null,
      unitPrice: Number(row.unit_price_micros ?? 0) / 1_000_000,
      quantity: (row.adults ?? 1) + (row.children ?? 0) + (row.infants ?? 0),
      participants: { adults: row.adults ?? 1, children: row.children ?? 0, infants: row.infants ?? 0 },
      participantPricing: {
        adultPrice: Number(row.adult_price_micros ?? row.unit_price_micros ?? 0) / 1_000_000,
        childPrice: row.child_price_micros == null ? null : Number(row.child_price_micros) / 1_000_000,
        infantPrice: row.infant_price_micros == null ? null : Number(row.infant_price_micros) / 1_000_000,
      },
    }));

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
    const row = cartRow(cartId, it);

    let lookup = supabase.from("cart_items").select("id, adults, children, infants")
      .eq("cart_id", cartId).eq("service_id", it.serviceId).eq("booking_date", it.bookingDate);
    lookup = it.packageId == null ? lookup.is("package_id", null) : lookup.eq("package_id", it.packageId);
    lookup = it.bookingTime ? lookup.eq("departure_arrival_time", it.bookingTime) : lookup.is("departure_arrival_time", null);
    const { data: existing, error: lookupError } = await lookup.limit(1).maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    const result = existing
      ? await supabase.from("cart_items").update({ ...row,
          adults: (existing.adults ?? 1) + row.adults,
          children: (existing.children ?? 0) + row.children,
          infants: (existing.infants ?? 0) + row.infants,
        }).eq("id", existing.id)
      : await supabase.from("cart_items").insert(row);
    if (result.error) throw new Error(result.error.message);
    return { cartId, inserted: !existing };
  },
);

export const removeServerCartItem = createAsyncThunk(
  "serverCart/removeItem",
  async (args: {
    cartId: string;
    serviceId: number;
    packageId: number | null;
    bookingDate: string;
    bookingTime: string | null;
  }) => {
    // We can't express the COALESCE index directly, but we can reproduce it with OR.
    const t = args.bookingTime;
    let q = supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", args.cartId)
      .eq("service_id", args.serviceId)
      .eq("booking_date", args.bookingDate);

    q = args.packageId == null ? q.is("package_id", null) : q.eq("package_id", args.packageId);
    if (t == null || t === "") {
      // match rows where time is NULL OR time='00:00:00'
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

export const updateServerCartParticipants = createAsyncThunk(
  "serverCart/updateParticipants",
  async (args: { cartId: string; item: CartItem }) => {
    const it = args.item;
    let query = supabase.from("cart_items").update({
      adults: it.participants.adults, children: it.participants.children, infants: it.participants.infants,
    }).eq("cart_id", args.cartId).eq("service_id", it.serviceId).eq("booking_date", it.bookingDate);
    query = it.packageId == null ? query.is("package_id", null) : query.eq("package_id", it.packageId);
    query = it.bookingTime ? query.eq("departure_arrival_time", it.bookingTime) : query.is("departure_arrival_time", null);
    const { error } = await query;
    if (error) throw new Error(error.message);
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

/**
 * Push local Redux cart items to server cart.
 */
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

    const rows = items.map(it => cartRow(cartId, it));

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
