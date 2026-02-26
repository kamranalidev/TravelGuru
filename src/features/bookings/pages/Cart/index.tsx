import React, { useMemo, useState, useEffect } from "react";
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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Header, StepperComponent } from "../../../../components/index.tsx";
import type { AppDispatch, RootState } from "../../../../store/store.ts";
import {
  clearCart,
  removeItem,
  addItem,
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
// Calculate item total considering participant pricing
const calculateItemTotal = (item: CartItem): number => {
  const pricing = item.participantPricing;
  const participants = item.participants;
  let base: number;
  if (!pricing) {
    // Fall back to unitPrice for adults only (children/infants without pricing = free)
    base = item.unitPrice * (participants?.adults || 1);
  } else {
    const adultTotal = participants.adults * pricing.adultPrice;
    // Only add child/infant costs if their prices are defined and greater than 0
    const childTotal =
      pricing.childPrice && pricing.childPrice > 0
        ? participants.children * pricing.childPrice
        : 0;
    const infantTotal =
      pricing.infantPrice && pricing.infantPrice > 0
        ? participants.infants * pricing.infantPrice
        : 0;
    base = adultTotal + childTotal + infantTotal;
  }
  // Add transfer price if selected
  const transferPrice = item.transferPrice ?? 0;
  return base + transferPrice;
};
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
      } catch (e) { }
    };
    void load();
  }, [dispatch, session?.user?.id]);
  // Calculate total with participant pricing
  const total = useMemo(
    () =>
      items.reduce(
        (acc: number, it: CartItem) => acc + calculateItemTotal(it),
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
      const err = e as {
        message?: string;
      };
      setError(err?.message ?? "Failed to clear cart");
    }
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
    } catch (e) { }
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
  const goBackToServices = () => {
    navigate("/services");
  };
  return (
    <Box sx={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Header hidePages />
      <StepperComponent activeStep={1} />

      {/* Back Navigation */}
      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 }, pt: 2 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={goBackToServices}
          sx={{
            color: "#6b7280",
            fontWeight: 500,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#f3f4f6",
              color: "#1a1a1a",
            },
          }}
        >
          Continue Shopping
        </Button>
      </Box>

      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4, alignItems: 'start' }}>
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

                          {/* Selected time slot */}
                          {it.selectedTime && (
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <Chip
                                size="small"
                                icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                                label={it.selectedTime}
                                sx={{ bgcolor: "#f3e8fd", color: "#7b1fa2" }}
                              />
                            </Stack>
                          )}

                          {/* Transfer option */}
                          {it.transferType && it.transferType !== "none" && (
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ mt: 1, flexWrap: "wrap" }}
                            >
                              <Chip
                                size="small"
                                label={
                                  it.transferType === "round_trip"
                                    ? "🚗 Round trip transfer"
                                    : "🚗 One way transfer"
                                }
                                sx={{ bgcolor: "#e8f5e9", color: "#2e7d32" }}
                              />
                              {(it.transferPrice ?? 0) > 0 && (
                                <Chip
                                  size="small"
                                  label={`+${formatAED(it.transferPrice ?? 0)}`}
                                  variant="outlined"
                                  sx={{
                                    borderColor: "#2e7d32",
                                    color: "#2e7d32",
                                  }}
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

                          {/* Ticket Breakdown Summary */}
                          {it.participants && (
                            <Box
                              sx={{
                                mb: 1,
                                p: 1,
                                bgcolor: "#fff8f5",
                                borderRadius: 1,
                                border: "1px solid #FF621F20",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 600,
                                  color: "#666",
                                  display: "block",
                                  mb: 0.5,
                                }}
                              >
                                Price Breakdown
                              </Typography>
                              {it.participants.adults > 0 && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ fontSize: 12 }}
                                  >
                                    Adults x{it.participants.adults}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontSize: 12, fontWeight: 600 }}
                                  >
                                    {formatAED(
                                      (it.participantPricing?.adultPrice ??
                                        it.unitPrice) * it.participants.adults,
                                    )}
                                  </Typography>
                                </Box>
                              )}
                              {it.participants.children > 0 && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ fontSize: 12 }}
                                  >
                                    Children x{it.participants.children}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: 12,
                                      fontWeight: 600,
                                      color:
                                        !it.participantPricing?.childPrice ||
                                          it.participantPricing?.childPrice === 0
                                          ? "#4CAF50"
                                          : "inherit",
                                    }}
                                  >
                                    {!it.participantPricing?.childPrice ||
                                      it.participantPricing?.childPrice === 0
                                      ? "FREE"
                                      : formatAED(
                                        (it.participantPricing?.childPrice ??
                                          0) * it.participants.children,
                                      )}
                                  </Typography>
                                </Box>
                              )}
                              {it.participants.infants > 0 && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ fontSize: 12 }}
                                  >
                                    Infants x{it.participants.infants}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: 12,
                                      fontWeight: 600,
                                      color: "#4CAF50",
                                    }}
                                  >
                                    {it.participantPricing?.infantPrice &&
                                      it.participantPricing.infantPrice > 0
                                      ? formatAED(
                                        it.participantPricing.infantPrice *
                                        it.participants.infants,
                                      )
                                      : "FREE"}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}

                          {/* Subtotal */}
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 800,
                              color: "#FF621F",
                            }}
                          >
                            {formatAED(calculateItemTotal(it))}
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

            </Stack>

            {/* Order Summary Sidebar */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                border: "1px solid #e8e8e8",
                position: "sticky",
                top: 24,
                boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                Order Summary
              </Typography>

              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" color="text.secondary">
                    Subtotal ({totalItems} items)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatAED(total)}
                  </Typography>
                </Stack>

                <Divider sx={{ borderColor: "#f0f0f0" }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Total
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#FF621F" }}>
                    {formatAED(total)}
                  </Typography>
                </Stack>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={goToCheckout}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    mt: 2,
                    py: 1.8,
                    bgcolor: "#FF621F",
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    textTransform: "none",
                    boxShadow: "0 4px 14px 0 rgba(255, 98, 31, 0.39)",
                    "&:hover": {
                      bgcolor: "#e55519",
                      boxShadow: "0 6px 20px rgba(255, 98, 31, 0.4)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease"
                  }}
                >
                  Proceed to Checkout
                </Button>
              </Stack>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
};
