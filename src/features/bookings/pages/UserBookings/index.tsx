import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Pagination,
  Paper,
  Stack,
  Typography,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { supabase } from "../../../../supabaseClient.ts";
import { Header, ReviewSubmission } from "../../../../components/index.tsx";
import "./index.css";

type BookingRow = {
  id: number;
  booking_date: string;
  payment_status: string | null;
  amount: number | null;
  currency: string | null;
  service_id: number | null;
  package_id: number | null;
  departure_arrival_time?: string | null;
  type?: string | null;
  address?: string | null;
  created_at?: string | null;
  voucher_code?: string | null;
  voucher_status?: string | null;
  services?:
    | { service_name?: string | null; location?: string | null }
    | { service_name?: string | null; location?: string | null }[]
    | null;
  packages?: { name?: string | null } | { name?: string | null }[] | null;
};

type BookingDetailsRow = {
  id: number;
  created_at?: string | null;
  booking_date: string;
  payment_status: string | null;
  amount: number | null;
  currency: string | null;
  service_id: number | null;
  package_id: number | null;
  payment_intent_id?: string | null;
  voucher_code?: string | null;
  voucher_status?: string | null;
  departure_arrival_time?: string | null;
  type?: string | null;
  address?: string | null;
  services?:
    | { service_name?: string | null; location?: string | null }
    | { service_name?: string | null; location?: string | null }[]
    | null;
  packages?: { name?: string | null } | { name?: string | null }[] | null;
};

const normalizeFirst = <T,>(value: T | T[] | null | undefined): T | null => {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
};

const formatAmount = (
  amountMinor: number | null | undefined,
  currency: string | null | undefined,
) => {
  if (typeof amountMinor !== "number") return "-";
  const c = (currency ?? "aed").toUpperCase();
  const major = amountMinor / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c,
    }).format(major);
  } catch {
    return `${major.toFixed(2)} ${c}`;
  }
};

const PAGE_SIZE = 6;

export const UserBookingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingDetailsRow | null>(null);

  const statusCounts = useMemo(() => {
    return bookings.reduce<Record<string, number>>((acc, b) => {
      const key = b.payment_status ?? "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [bookings]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }

      const {
        data,
        error: bookingsError,
        count,
      } = await supabase
        .from("bookings")
        .select(
          "id, booking_date, payment_status, amount, currency, service_id, package_id, departure_arrival_time, type, address, created_at, voucher_code, voucher_status, services(service_name, location), packages(name)",
          { count: "exact" },
        )
        .eq("user_id", user.id)
        .order("id", { ascending: false })
        .range(from, to);

      if (bookingsError) {
        setError(bookingsError.message);
        setLoading(false);
        return;
      }

      const rows = (data as BookingRow[]) ?? [];
      setBookings(rows);
      setTotalCount(count ?? 0);

      if (rows.length > 0) {
        const bookingIds = rows.map((row) => row.id);
        const { data: reviewRows, error: reviewsError } = await supabase
          .from("reviews")
          .select("booking_id")
          .eq("user_id", user.id)
          .in("booking_id", bookingIds);

        if (reviewsError) {
          console.warn(
            "Failed to load existing reviews:",
            reviewsError.message,
          );
          setReviewedBookingIds(new Set());
        } else {
          const reviewed = new Set<number>(
            (reviewRows ?? []).map((row: any) => Number(row.booking_id)),
          );
          setReviewedBookingIds(reviewed);
        }
      } else {
        setReviewedBookingIds(new Set());
      }

      setLoading(false);
    };

    void load();
  }, [page, refreshKey]);

  const openBookingDetails = async (bookingId: number) => {
    try {
      setDetailsOpen(true);
      setDetailsLoading(true);
      setDetailsError(null);
      setSelectedBooking(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw new Error(userError.message);
      if (!user) throw new Error("You must be logged in.");

      // Fetch booking details strictly from `bookings` (no user profile info)
      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select(
          "id, created_at, booking_date, payment_status, amount, currency, service_id, package_id, payment_intent_id, voucher_code, voucher_status, departure_arrival_time, type, address, services(service_name, location), packages(name)",
        )
        .eq("id", bookingId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) throw new Error(fetchError.message);
      if (!data) throw new Error("Booking not found.");

      setSelectedBooking(data as BookingDetailsRow);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load booking.";
      setDetailsError(message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeBookingDetails = () => {
    setDetailsOpen(false);
    setDetailsError(null);
    setSelectedBooking(null);
    setDetailsLoading(false);
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Header />

      <Dialog
        open={detailsOpen}
        onClose={closeBookingDetails}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Booking details</DialogTitle>
        <DialogContent dividers>
          {detailsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : detailsError ? (
            <Alert severity="error">{detailsError}</Alert>
          ) : selectedBooking ? (
            (() => {
              const service = normalizeFirst(selectedBooking.services);
              const pack = normalizeFirst(selectedBooking.packages);
              const voucherStatusColor =
                selectedBooking.voucher_status === "used"
                  ? "error"
                  : selectedBooking.voucher_status === "expired"
                    ? "warning"
                    : selectedBooking.voucher_status === "valid"
                      ? "success"
                      : "default";
              return (
                <Stack spacing={1.25}>
                  <Typography sx={{ fontWeight: 800 }}>
                    {service?.service_name ??
                      `Service #${selectedBooking.service_id ?? "-"}`}
                  </Typography>

                  {service?.location ? (
                    <Typography color="text.secondary">
                      Location: {service.location}
                    </Typography>
                  ) : null}

                  <Divider />

                  {/* Voucher Section - Prominent Display */}
                  {selectedBooking.voucher_code ? (
                    <Box
                      sx={{
                        background:
                          "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
                        borderRadius: 2,
                        p: 2,
                        textAlign: "center",
                        border: "2px solid #FF621F",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#FF621F",
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          letterSpacing: 2,
                          mb: 0.5,
                        }}
                      >
                        🎫 Voucher Code
                      </Typography>
                      <Typography
                        sx={{
                          color: "#fff",
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          fontFamily: "monospace",
                          letterSpacing: 3,
                          mb: 1,
                        }}
                      >
                        {selectedBooking.voucher_code}
                      </Typography>
                      <Chip
                        label={selectedBooking.voucher_status ?? "valid"}
                        color={voucherStatusColor}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  ) : null}

                  <Divider />

                  <Typography>
                    <strong>Booking ID:</strong> {selectedBooking.id}
                  </Typography>
                  <Typography>
                    <strong>Date:</strong> {selectedBooking.booking_date}
                  </Typography>
                  {selectedBooking.departure_arrival_time ? (
                    <Typography>
                      <strong>Time:</strong>{" "}
                      {selectedBooking.departure_arrival_time}
                    </Typography>
                  ) : null}
                  {selectedBooking.type ? (
                    <Typography>
                      <strong>Type:</strong> {selectedBooking.type}
                    </Typography>
                  ) : null}
                  {selectedBooking.type === "dropoff" &&
                  selectedBooking.address ? (
                    <Typography>
                      <strong>Address:</strong> {selectedBooking.address}
                    </Typography>
                  ) : null}
                  {pack?.name ? (
                    <Typography>
                      <strong>Package:</strong> {pack.name}
                    </Typography>
                  ) : null}
                  <Typography>
                    <strong>Status:</strong>{" "}
                    {selectedBooking.payment_status ?? "unknown"}
                  </Typography>
                  <Typography>
                    <strong>Amount:</strong>{" "}
                    {formatAmount(
                      selectedBooking.amount,
                      selectedBooking.currency,
                    )}
                  </Typography>
                  {selectedBooking.payment_intent_id ? (
                    <Typography sx={{ wordBreak: "break-all" }}>
                      <strong>Payment Intent:</strong>{" "}
                      {selectedBooking.payment_intent_id}
                    </Typography>
                  ) : null}
                  {selectedBooking.created_at ? (
                    <Typography color="text.secondary">
                      Created: {selectedBooking.created_at}
                    </Typography>
                  ) : null}
                </Stack>
              );
            })()
          ) : (
            <Alert severity="info">Select a booking to view details.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBookingDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          My Bookings
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap" }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <Chip key={status} label={`${status}: ${count}`} size="small" />
          ))}
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : bookings.length === 0 ? (
          <Alert severity="info">No bookings yet.</Alert>
        ) : (
          <Stack spacing={2}>
            {bookings.map((b) => {
              const service = normalizeFirst(b.services);
              const pack = normalizeFirst(b.packages);

              return (
                <Paper
                  key={b.id}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    transition: "box-shadow 120ms ease",
                    "&:hover": {
                      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                    },
                  }}
                  elevation={0}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography
                        sx={{ fontWeight: 700, fontSize: "1.05rem", mb: 0.5 }}
                      >
                        {service?.service_name ??
                          `Service #${b.service_id ?? "-"}`}
                      </Typography>
                      {service?.location && (
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: "0.9rem" }}
                        >
                          📍 {service.location}
                        </Typography>
                      )}
                      <Typography
                        color="text.secondary"
                        sx={{ fontSize: "0.9rem" }}
                      >
                        📅 {b.booking_date}
                        {b.departure_arrival_time &&
                          ` • 🕒 ${b.departure_arrival_time}`}
                      </Typography>
                      {b.type && (
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: "0.9rem" }}
                        >
                          �{" "}
                          {b.type === "pickup"
                            ? "Airport Pickup"
                            : b.type === "dropoff"
                              ? "Airport Drop-off"
                              : b.type}
                        </Typography>
                      )}
                      {b.type === "dropoff" && b.address && (
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: "0.85rem" }}
                        >
                          🏠 {b.address}
                        </Typography>
                      )}
                      {pack?.name && (
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: "0.9rem" }}
                        >
                          📦 {pack.name}
                        </Typography>
                      )}
                    </Box>

                    <Stack
                      spacing={1}
                      alignItems={{ xs: "flex-start", sm: "flex-end" }}
                    >
                      <Chip
                        label={b.payment_status ?? "unknown"}
                        color={
                          b.payment_status === "succeeded" ||
                          b.payment_status === "completed" ||
                          b.payment_status === "paid"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />
                      <Typography sx={{ fontWeight: 800 }}>
                        {formatAmount(b.amount, b.currency)}
                      </Typography>
                      <Typography color="text.secondary">
                        Booking ID: {b.id}
                      </Typography>

                      {/* Voucher Code Badge */}
                      {b.voucher_code && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            background:
                              "linear-gradient(135deg, #1a1a1a 0%, #333 100%)",
                            borderRadius: 1,
                            px: 1.5,
                            py: 0.5,
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#FF621F",
                              fontSize: "0.65rem",
                              fontWeight: 600,
                            }}
                          >
                            🎫
                          </Typography>
                          <Typography
                            sx={{
                              color: "#fff",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              fontFamily: "monospace",
                              letterSpacing: 1,
                            }}
                          >
                            {b.voucher_code}
                          </Typography>
                          {b.voucher_status && b.voucher_status !== "valid" && (
                            <Chip
                              label={b.voucher_status}
                              size="small"
                              color={
                                b.voucher_status === "used"
                                  ? "error"
                                  : b.voucher_status === "expired"
                                    ? "warning"
                                    : "default"
                              }
                              sx={{
                                height: 18,
                                fontSize: "0.6rem",
                                ml: 0.5,
                              }}
                            />
                          )}
                        </Box>
                      )}

                      {/* Action buttons */}
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => void openBookingDetails(b.id)}
                          sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            fontWeight: 600,
                          }}
                        >
                          View Details
                        </Button>
                        {/* Write a Review button for completed bookings */}
                        {(b.payment_status === "succeeded" ||
                          b.payment_status === "completed" ||
                          b.payment_status === "paid") &&
                          !reviewedBookingIds.has(b.id) && (
                            <ReviewSubmission
                              bookingId={b.id}
                              serviceName={service?.service_name || undefined}
                              onReviewSubmitted={() => {
                                setTimeout(() => {
                                  setRefreshKey((key) => key + 1);
                                }, 300);
                              }}
                            />
                          )}
                      </Stack>
                    </Stack>
                  </Stack>
                  <Divider sx={{ mt: 2 }} />
                </Paper>
              );
            })}

            {totalCount > PAGE_SIZE ? (
              <Stack alignItems="center" sx={{ pt: 1 }}>
                <Pagination
                  count={Math.ceil(totalCount / PAGE_SIZE)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                />
              </Stack>
            ) : null}
          </Stack>
        )}
      </Box>
    </Box>
  );
};
