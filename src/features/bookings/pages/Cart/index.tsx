import { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Header } from "../../../../components";
import type { AppDispatch, RootState } from "../../../../store/store";
import {
  clearCart,
  removeItem,
  addItem,
} from "../../../../store/features/cart/cartSlice";
import { useAuth } from "../../../../hooks/useAuth";
import {
  ensureActiveServerCart,
  loadServerCartToLocal,
  removeServerCartItem,
  clearServerCart,
} from "../../../../store/features/serverCart/serverCartSlice";
import "./index.css";

const formatAED = (amount: number) =>
  `AED ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { session } = useAuth();
  const items = useSelector((s: RootState) => s.cart.items);
  const serverCartId = useSelector((s: RootState) => s.serverCart.cartId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    const load = async () => {
      try {
        const res = await dispatch(loadServerCartToLocal(userId)).unwrap();
        // Hydrate local cart from server (dedupe is handled by cartSlice)
        dispatch(clearCart());
        for (const it of res.items) dispatch(addItem(it));
      } catch (e) {
        console.warn("Failed to load server cart:", e);
      }
    };

    void load();
  }, [dispatch, session?.user?.id]);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.unitPrice) || 0), 0),
    [items]
  );

  const clearAll = async () => {
    setError(null);
    const userId = session?.user?.id;
    if (!userId) {
      dispatch(clearCart());
      return;
    }

    try {
      const cartId =
        serverCartId ??
        (await dispatch(ensureActiveServerCart(userId)).unwrap());
      await dispatch(clearServerCart(cartId)).unwrap();
      dispatch(clearCart());
    } catch (e: any) {
      setError(e?.message ?? "Failed to clear cart");
    }
  };

  const removeOne = async (it: any) => {
    setError(null);
    const userId = session?.user?.id;

    // Always remove locally
    dispatch(
      removeItem({
        serviceId: it.serviceId,
        bookingDate: it.bookingDate,
        bookingTime: it.bookingTime,
      })
    );

    if (!userId) return;

    try {
      const cartId =
        serverCartId ??
        (await dispatch(ensureActiveServerCart(userId)).unwrap());
      await dispatch(
        removeServerCartItem({
          cartId,
          serviceId: it.serviceId,
          bookingDate: it.bookingDate,
          bookingTime: it.bookingTime,
        })
      ).unwrap();
    } catch (e) {
      // If server removal fails, keep UX smooth; next sync/mount will reconcile.
      console.warn("Failed to remove item from server cart:", e);
    }
  };

  const goToCheckout = () => {
    setError(null);
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    navigate("/checkout", {
      state: {
        mode: "cart",
        cartItems: items,
        finalPrice: total,
      },
    });
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Header />
      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
        >
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Cart
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={clearAll}
              disabled={items.length === 0}
            >
              Clear
            </Button>
            <Button variant="contained" onClick={goToCheckout}>
              Checkout ({formatAED(total)})
            </Button>
          </Stack>
        </Stack>

        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Stack spacing={2} sx={{ mt: 3 }}>
          {items.length === 0 ? (
            <Alert severity="info">Your cart is empty.</Alert>
          ) : (
            items.map((it) => (
              <Paper
                key={`${it.serviceId}-${it.bookingDate}-${
                  it.bookingTime ?? ""
                }`}
                sx={{ p: 2, borderRadius: 3 }}
                elevation={0}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>
                      {it.serviceName ?? `Service #${it.serviceId}`}
                    </Typography>
                    {it.location ? (
                      <Typography color="text.secondary">
                        📍 {it.location}
                      </Typography>
                    ) : null}
                    <Typography color="text.secondary">
                      📅 {it.bookingDate}
                    </Typography>
                    {it.bookingTime ? (
                      <Typography color="text.secondary">
                        🕒 {it.bookingTime}
                      </Typography>
                    ) : null}
                    {it.packageName ? (
                      <Typography color="text.secondary">
                        📦 {it.packageName}
                      </Typography>
                    ) : null}
                    {it.airportType ? (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 1, flexWrap: "wrap" }}
                      >
                        <Chip
                          size="small"
                          label={`Airport ${it.airportType}`}
                        />
                        {it.airportType === "dropoff" && it.address ? (
                          <Chip size="small" label={it.address} />
                        ) : null}
                      </Stack>
                    ) : null}
                  </Box>

                  <Stack
                    alignItems={{ xs: "flex-start", sm: "flex-end" }}
                    spacing={1}
                  >
                    <Typography sx={{ fontWeight: 900 }}>
                      {formatAED(it.unitPrice)}
                    </Typography>
                    <Button
                      variant="text"
                      color="error"
                      onClick={() => void removeOne(it)}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Stack>
                <Divider sx={{ mt: 2 }} />
              </Paper>
            ))
          )}
        </Stack>
      </Box>
    </Box>
  );
};
