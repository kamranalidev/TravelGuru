import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  Chip,
  Divider,
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);

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

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Header />

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
                  onClick={() => navigate(`/bookings/${b.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/bookings/${b.id}`);
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
