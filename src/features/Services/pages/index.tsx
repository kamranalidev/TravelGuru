import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Stack,
  Button,
  Paper,
  FormControl,
  MenuItem,
  Select,
  Slider,
  InputBase,
} from "@mui/material";
import { Header, Footer } from "../../../components";
import { supabase } from "../../../supabaseClient";
import SearchIcon from "@mui/icons-material/Search";
import "./index.css";

type Service = {
  id: string;
  service_name: string;
  service_description: string;
  location: string;
  service_image: any;
  default_price: number;
  service_type?: string;
  daily_slots?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  duration?: number | null;
  days?: any;
};

const getServiceImages = (service: Service): string[] => {
  try {
    const imgVal: any = service.service_image;

    // service_image may be a JSON string
    if (typeof imgVal === "string") {
      const parsed = JSON.parse(imgVal);
      if (Array.isArray(parsed)) {
        return parsed
          .map((x) => (typeof x === "string" ? x : x?.url))
          .filter((u) => typeof u === "string" && u.trim() !== "");
      }
    }

    // service_image may be an array (jsonb) of either strings or { url, path }
    if (Array.isArray(imgVal)) {
      return imgVal
        .map((x) => (typeof x === "string" ? x : x?.url))
        .filter((u) => typeof u === "string" && u.trim() !== "");
    }

    // legacy shape: { url: string[] }
    if (Array.isArray(imgVal?.url)) {
      return imgVal.url.filter(
        (u: unknown) => typeof u === "string" && u.trim() !== "",
      );
    }

    // single object: { url: string }
    if (typeof imgVal?.url === "string" && imgVal.url.trim() !== "") {
      return [imgVal.url];
    }
  } catch (_e) {}

  return ["/assets/burjKhalifa.jpg"];
};

const formatAED = (amount: number | null | undefined) => {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatTime = (t: string | null | undefined) => {
  if (!t) return null;
  // DB stores time without time zone like "14:30:00".
  // Convert to a safe ISO string for formatting.
  const d = new Date(`1970-01-01T${t}`);
  if (Number.isNaN(d.getTime())) return t;
  return d.toLocaleTimeString("en-AE", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDuration = (hours: number | string | null | undefined) => {
  const v = Number(hours);
  if (!Number.isFinite(v) || v <= 0) return null;
  return v === 1 ? "1 hour" : `${v} hours`;
};

const formatDays = (value: any): string | null => {
  if (!value) return null;
  try {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;
      // might be json string
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed);
        return formatDays(parsed);
      }
      return trimmed;
    }
    if (typeof value === "object") {
      // common cases: { mon: true, tue: false } or { days: [...] }
      if (Array.isArray((value as any).days))
        return (value as any).days.join(", ");
      const keys = Object.keys(value).filter((k) => (value as any)[k]);
      return keys.length ? keys.join(", ") : null;
    }
  } catch {
    return null;
  }
  return null;
};

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<number[]>([0, 6000]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setServices((data || []).filter((service) => service && service.id));
      } catch (e) {
        console.error("Error fetching services:", e);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const derivedMaxPrice = useMemo(() => {
    const max = services.reduce(
      (acc, s) => Math.max(acc, Number(s.default_price ?? 0)),
      0,
    );
    return Math.max(1000, Math.ceil(max / 100) * 100);
  }, [services]);

  useEffect(() => {
    setPriceRange([0, derivedMaxPrice]);
  }, [derivedMaxPrice]);

  const filteredAndSorted = useMemo(() => {
    let list = [...services];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.service_name?.toLowerCase().includes(query) ||
          s.service_description?.toLowerCase().includes(query) ||
          s.location?.toLowerCase().includes(query),
      );
    }

    // Filter by price range
    const [minP, maxP] = priceRange;
    list = list.filter((s) => {
      const p = Number(s.default_price ?? 0);
      return p >= minP && p <= maxP;
    });

    // Sort
    if (sortBy === "price_asc") {
      list.sort(
        (a, b) => Number(a.default_price ?? 0) - Number(b.default_price ?? 0),
      );
    } else if (sortBy === "price_desc") {
      list.sort(
        (a, b) => Number(b.default_price ?? 0) - Number(a.default_price ?? 0),
      );
    }

    return list;
  }, [services, searchQuery, priceRange, sortBy]);

  const resultsCount = loading ? 0 : filteredAndSorted.length;

  const handleServiceClick = (service: Service) => {
    if (!service?.id) return;

    const servicePayload = {
      ...service,
      service_description:
        service.service_description ||
        "Premium experience curated by Travel Guroo.",
      description:
        service.service_description ||
        "Premium experience curated by Travel Guroo.",
      name: service.service_name,
      price: service.default_price,
      default_price: service.default_price,
      service_image: service.service_image,
    };

    // Scroll to top before navigating
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/bookings/${service.id}`, { state: servicePayload });
  };

  type SortChangeEvent = { target: { value: string } };

  const handleSortChange = (e: SortChangeEvent) => {
    setSortBy(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange([0, derivedMaxPrice]);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "280px 1fr" },
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* Sidebar Filters */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #e9ecef",
              bgcolor: "white",
              overflow: "hidden",
              position: { lg: "sticky" },
              top: { lg: 90 },
            }}
          >
            {/* Search */}
            <Box sx={{ p: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 1.5 }}>
                Search
              </Typography>
              <Paper
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                  bgcolor: "#f9fafb",
                }}
              >
                <SearchIcon sx={{ color: "#9ca3af", mr: 1, fontSize: 20 }} />
                <InputBase
                  placeholder="Search experiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    flex: 1,
                    fontSize: 14,
                    "& input::placeholder": {
                      color: "#9ca3af",
                      opacity: 1,
                    },
                  }}
                />
              </Paper>
            </Box>

            {/* Price Range */}
            <Box sx={{ p: 2.5, borderTop: "1px solid #e9ecef" }}>
              <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 1.5 }}>
                Price Range
              </Typography>
              <Slider
                value={priceRange}
                onChange={(_, v) => setPriceRange(v as number[])}
                valueLabelDisplay="off"
                min={0}
                max={derivedMaxPrice}
                sx={{
                  color: "#FF621F",
                  "& .MuiSlider-thumb": {
                    bgcolor: "white",
                    border: "2px solid #FF621F",
                    width: 18,
                    height: 18,
                  },
                  "& .MuiSlider-track": {
                    height: 4,
                  },
                  "& .MuiSlider-rail": {
                    height: 4,
                    bgcolor: "#e5e7eb",
                  },
                }}
              />
              <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    flex: 1,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    borderColor: "#e5e7eb",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}
                  >
                    {formatAED(priceRange[0])}
                  </Typography>
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{
                    flex: 1,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    borderColor: "#e5e7eb",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}
                  >
                    {formatAED(priceRange[1])}
                  </Typography>
                </Paper>
              </Stack>
            </Box>

            {/* Clear Filters */}
            <Box sx={{ p: 2.5, borderTop: "1px solid #e9ecef" }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1,
                  borderColor: "#d0d5dd",
                  color: "#374151",
                  "&:hover": {
                    bgcolor: "#f3f4f6",
                    borderColor: "#d0d5dd",
                  },
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </Paper>

          {/* Main Content */}
          <Box>
            {/* Header with results count and sort */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                mb: 3,
              }}
            >
              <Typography
                sx={{ fontWeight: 700, color: "#111827", fontSize: 15 }}
              >
                {loading ? "Loading..." : `${resultsCount} experiences found`}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  sx={{ color: "#6b7280", fontWeight: 500, fontSize: 14 }}
                >
                  Sort by
                </Typography>
                <FormControl size="small">
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    sx={{
                      borderRadius: 2,
                      bgcolor: "white",
                      minWidth: 170,
                      fontSize: 14,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e5e7eb",
                      },
                    }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>

            {/* Services Grid - Klook Style */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 2.5,
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 8,
                    gap: 2,
                  }}
                >
                  <Box className="services-loader-container">
                    <span className="services-loader"></span>
                    <Typography className="services-loader-text">
                      Loading experiences...
                    </Typography>
                  </Box>
                </Box>
              ) : filteredAndSorted.length === 0 ? (
                <Box
                  sx={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    py: 8,
                  }}
                >
                  <Typography sx={{ color: "#6b7280", fontSize: 16 }}>
                    No experiences found matching your criteria.
                  </Typography>
                  <Button
                    onClick={clearFilters}
                    sx={{
                      mt: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      color: "#FF621F",
                    }}
                  >
                    Clear filters
                  </Button>
                </Box>
              ) : (
                filteredAndSorted.map((service) => {
                  const images = getServiceImages(service);

                  return (
                    <Card
                      key={service.id}
                      onClick={() => handleServiceClick(service)}
                      sx={{
                        borderRadius: "12px",
                        overflow: "hidden",
                        bgcolor: "white",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        border: "1px solid #e5e7eb",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        },
                        "&:hover .service-image": {
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      {/* Image Container */}
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          paddingTop: "75%",
                          overflow: "hidden",
                          borderRadius: "12px",
                          bgcolor: "#f5f5f5",
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={images[0]}
                          alt={service.service_name}
                          className="service-image"
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            bgcolor: "#f5f5f5",
                            transition: "transform 0.3s ease",
                          }}
                        />
                      </Box>

                      {/* Content */}
                      <CardContent sx={{ p: 2.5 }}>
                        <Typography
                          sx={{ fontWeight: 800, fontSize: 18, mb: 0.75 }}
                        >
                          {service.service_name}
                        </Typography>

                        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
                          <Typography sx={{ color: "#6b7280", fontSize: 13 }}>
                            {service.location}
                          </Typography>
                          {service.service_type ? (
                            <Typography sx={{ color: "#6b7280", fontSize: 13 }}>
                              • {service.service_type}
                            </Typography>
                          ) : null}
                        </Stack>

                        <Typography
                          sx={{
                            color: "#374151",
                            fontSize: 14,
                            lineHeight: 1.5,
                            mb: 2,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {service.service_description ||
                            "Premium experience curated by Travel Guroo."}
                        </Typography>

                        <Stack spacing={0.5} sx={{ mb: 2 }}>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: 18,
                              color: "#111827",
                            }}
                          >
                            {formatAED(service.default_price)}
                          </Typography>

                          {service.start_time || service.end_time ? (
                            <Typography sx={{ color: "#6b7280", fontSize: 13 }}>
                              Time: {formatTime(service.start_time) ?? "—"} –{" "}
                              {formatTime(service.end_time) ?? "—"}
                            </Typography>
                          ) : null}

                          {service.duration != null ? (
                            <Typography sx={{ color: "#6b7280", fontSize: 13 }}>
                              Duration:{" "}
                              {formatDuration(service.duration) ?? "—"}
                            </Typography>
                          ) : null}

                          {service.daily_slots != null ? (
                            <Typography sx={{ color: "#6b7280", fontSize: 13 }}>
                              Daily slots:{" "}
                              {Number(service.daily_slots).toLocaleString(
                                "en-AE",
                              )}
                            </Typography>
                          ) : null}

                          {service.days ? (
                            <Typography sx={{ color: "#6b7280", fontSize: 13 }}>
                              Available: {formatDays(service.days) ?? "—"}
                            </Typography>
                          ) : null}
                        </Stack>

                        <Button
                          variant="contained"
                          onClick={() => handleServiceClick(service)}
                          sx={{
                            textTransform: "none",
                            bgcolor: "#FF621F",
                            borderRadius: 2,
                            fontWeight: 700,
                            "&:hover": { bgcolor: "#e45417" },
                          }}
                          fullWidth
                        >
                          View details
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </Box>
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default ServicesPage;
