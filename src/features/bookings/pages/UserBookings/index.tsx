import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
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
import { Header } from "../../../../components/index.tsx";

type BookingRow = {
  id: number;
  booking_date: string;
  payment_status: string | null;
  amount: number | null;
  currency: string | null;
  service_id: number | null;
  package_id: number | null;
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
  return Array.isArray(value) ? value[0] ?? null : value;
};

const formatAmount = (
  amountMinor: number | null | undefined,
  currency: string | null | undefined
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

export const UserBookingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);

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

      const { data, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          "id, booking_date, payment_status, amount, currency, service_id, package_id, services(service_name, location), packages(name)"
        )
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      if (bookingsError) {
        setError(bookingsError.message);
        setLoading(false);
        return;
      }

      setBookings((data as BookingRow[]) ?? []);
      setLoading(false);
    };

    void load();
  }, []);

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
          "id, created_at, booking_date, payment_status, amount, currency, service_id, package_id, payment_intent_id, departure_arrival_time, type, address, services(service_name, location), packages(name)"
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
                      selectedBooking.currency
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
                    cursor: "pointer",
                    transition: "transform 120ms ease, box-shadow 120ms ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                    },
                  }}
                  elevation={0}
                  onClick={() => void openBookingDetails(b.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      void openBookingDetails(b.id);
                    }
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>
                        {service?.service_name ??
                          `Service #${b.service_id ?? "-"}`}
                      </Typography>
                      <Typography color="text.secondary">
                        {service?.location ? `📍 ${service.location}` : ""}
                      </Typography>
                      <Typography color="text.secondary">
                        📅 {b.booking_date}
                      </Typography>
                      {pack?.name ? (
                        <Typography color="text.secondary">
                          📦 {pack.name}
                        </Typography>
                      ) : null}
                    </Box>

                    <Stack
                      spacing={1}
                      alignItems={{ xs: "flex-start", sm: "flex-end" }}
                    >
                      <Chip
                        label={b.payment_status ?? "unknown"}
                        color={
                          b.payment_status === "succeeded"
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
                    </Stack>
                  </Stack>
                  <Divider sx={{ mt: 2 }} />
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};
