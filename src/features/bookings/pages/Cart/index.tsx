import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Header } from "../../../../components/index.tsx";
import type { AppDispatch, RootState } from "../../../../store/store.ts";
import {
  clearCart,
  removeItem,
  addItem,
  incrementQuantity,
  decrementQuantity,
  type CartItem,
} from "../../../../store/features/cart/cartSlice.ts";
import { useAuth } from "../../../../hooks/useAuth.tsx";
import {
  ensureActiveServerCart,
  loadServerCartToLocal,
  removeServerCartItem,
  clearServerCart,
} from "../../../../store/features/serverCart/serverCartSlice.ts";
import "./index.css";

const formatAED = (amount: number) =>
  `AED ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export const CartPage: React.FC = () => {
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
        dispatch(clearCart());
        for (const it of res.items) dispatch(addItem(it as CartItem));
      } catch (e) {
        console.warn("Failed to load server cart:", e);
      }
    };

    void load();
  }, [dispatch, session?.user?.id]);

  // Calculate total with quantities
  const total = useMemo(
    () =>
      items.reduce(
        (acc: number, it: CartItem) =>
          acc + (Number(it.unitPrice) || 0) * (it.quantity || 1),
        0,
      ),
    [items],
  );

  const totalItems = useMemo(
    () =>
      items.reduce((acc: number, it: CartItem) => acc + (it.quantity || 1), 0),
    [items],
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
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message ?? "Failed to clear cart");
    }
  };

  const handleIncrement = (it: CartItem) => {
    dispatch(
      incrementQuantity({
        serviceId: it.serviceId,
        packageId: it.packageId,
        bookingDate: it.bookingDate,
        bookingTime: it.bookingTime,
      }),
    );
  };

  const handleDecrement = (it: CartItem) => {
    dispatch(
      decrementQuantity({
        serviceId: it.serviceId,
        packageId: it.packageId,
        bookingDate: it.bookingDate,
        bookingTime: it.bookingTime,
      }),
    );
  };

  const removeOne = async (it: CartItem) => {
    setError(null);
    const userId = session?.user?.id;

    dispatch(
      removeItem({
        serviceId: it.serviceId,
        packageId: it.packageId,
        bookingDate: it.bookingDate,
        bookingTime: it.bookingTime,
      }),
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
        }),
      ).unwrap();
    } catch (e) {
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
    <Box sx={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Header />
      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: "#1a1a2e", mb: 0.5 }}
            >
              <ShoppingCartOutlinedIcon
                sx={{ mr: 1, verticalAlign: "middle", color: "#FF621F" }}
              />
              Your Cart
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={clearAll}
              disabled={items.length === 0}
              startIcon={<DeleteOutlineIcon />}
              sx={{
                borderRadius: 2,
                borderColor: "#e0e0e0",
                color: "#666",
                "&:hover": {
                  borderColor: "#ff4444",
                  color: "#ff4444",
                  bgcolor: "#fff5f5",
                },
              }}
            >
              Clear All
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {items.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 3,
              textAlign: "center",
              border: "1px solid #e0e0e0",
            }}
          >
            <ShoppingCartOutlinedIcon
              sx={{ fontSize: 80, color: "#e0e0e0", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Your cart is empty
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/services")}
              sx={{
                bgcolor: "#FF621F",
                borderRadius: 2,
                px: 4,
                "&:hover": { bgcolor: "#e55519" },
              }}
            >
              Explore Experiences
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {/* Cart Items */}
            {items.map((it: CartItem) => (
              <Paper
                key={`${it.serviceId}-${it.packageId ?? "base"}-${it.bookingDate}-${it.bookingTime ?? ""}`}
                elevation={0}
                sx={{
                  p: 0,
                  borderRadius: 3,
                  border: "1px solid #e0e0e0",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    borderColor: "#FF621F40",
                  },
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={0}
                  sx={{ height: "100%" }}
                >
                  {/* Service Image */}
                  {it.serviceImage && (
                    <Box
                      sx={{
                        width: { xs: "100%", md: 200 },
                        height: { xs: 150, md: "auto" },
                        minHeight: { md: 180 },
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={it.serviceImage}
                        alt={it.serviceName || "Service"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/assets/desertSafari.jpg";
                        }}
                      />
                    </Box>
                  )}

                  {/* Content */}
                  <Box sx={{ flex: 1, p: 2.5 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      spacing={2}
                    >
                      {/* Left side - Details */}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "#1a1a2e",
                            mb: 1,
                            lineHeight: 1.3,
                          }}
                        >
                          {it.serviceName ?? `Service #${it.serviceId}`}
                        </Typography>

                        {it.packageName && (
                          <Chip
                            icon={
                              <ConfirmationNumberIcon sx={{ fontSize: 16 }} />
                            }
                            label={it.packageName}
                            size="small"
                            sx={{
                              mb: 1.5,
                              bgcolor: "#FF621F15",
                              color: "#FF621F",
                              fontWeight: 600,
                              "& .MuiChip-icon": { color: "#FF621F" },
                            }}
                          />
                        )}

                        <Stack spacing={0.5}>
                          {it.location && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <LocationOnIcon
                                sx={{ fontSize: 16, color: "#999" }}
                              />
                              {it.location}
                            </Typography>
                          )}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <CalendarTodayIcon
                              sx={{ fontSize: 16, color: "#999" }}
                            />
                            {it.bookingDate}
                          </Typography>
                          {it.bookingTime && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <AccessTimeIcon
                                sx={{ fontSize: 16, color: "#999" }}
                              />
                              {it.bookingTime}
                            </Typography>
                          )}
                        </Stack>

                        {it.airportType && (
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ mt: 1.5, flexWrap: "wrap" }}
                          >
                            <Chip
                              size="small"
                              label={`Airport ${it.airportType}`}
                              sx={{ bgcolor: "#e3f2fd", color: "#1565c0" }}
                            />
                            {it.airportType === "dropoff" && it.address && (
                              <Chip
                                size="small"
                                label={it.address}
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        )}
                      </Box>

                      {/* Right side - Price and Quantity */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: { xs: "flex-start", sm: "flex-end" },
                          justifyContent: "space-between",
                          minWidth: { sm: 180 },
                        }}
                      >
                        {/* Unit Price */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {formatAED(it.unitPrice)} each
                        </Typography>

                        {/* Quantity Controls */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            bgcolor: "#f5f5f5",
                            borderRadius: 2,
                            p: 0.5,
                            my: 1,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleDecrement(it)}
                            sx={{
                              bgcolor: "white",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                              "&:hover": { bgcolor: "#fff5f0" },
                            }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              minWidth: 32,
                              textAlign: "center",
                              fontSize: 16,
                            }}
                          >
                            {it.quantity || 1}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleIncrement(it)}
                            sx={{
                              bgcolor: "white",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                              "&:hover": { bgcolor: "#fff5f0" },
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Subtotal */}
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            color: "#FF621F",
                          }}
                        >
                          {formatAED(it.unitPrice * (it.quantity || 1))}
                        </Typography>

                        {/* Remove Button */}
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => void removeOne(it)}
                          sx={{
                            mt: 1,
                            textTransform: "none",
                            fontWeight: 500,
                          }}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            ))}

            {/* Order Summary */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "#1a1a2e",
                color: "white",
                mt: 2,
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    Subtotal ({totalItems} items)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatAED(total)}
                  </Typography>
                </Stack>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: "#FF621F" }}
                  >
                    {formatAED(total)}
                  </Typography>
                </Stack>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={goToCheckout}
                  sx={{
                    mt: 1,
                    py: 1.5,
                    bgcolor: "#FF621F",
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: 16,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#e55519" },
                  }}
                >
                  Proceed to Checkout
                </Button>
              </Stack>
            </Paper>
          </Stack>
        )}
      </Box>
    </Box>
  );
};
