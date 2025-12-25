import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Grid,
  Stack,
  Button,
  Rating,
  Paper,
  Divider,
  FormControl,
  MenuItem,
  Select,
  Slider,
  IconButton,
} from "@mui/material";
import { Header, Footer } from "../../../components";
import { supabase } from "../../../supabaseClient";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

type Service = {
  id: string;
  service_name: string;
  service_description: string;
  location: string;
  service_image: any;
  default_price: number;
};

const getServiceImages = (service: Service): string[] => {
  try {
    if (typeof service.service_image === "string") {
      const parsed = JSON.parse(service.service_image);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (img) => typeof img === "string" && img.trim() !== ""
        );
      }
    }
    if (Array.isArray(service.service_image?.url)) {
      return service.service_image.url.filter(
        (img: string) => typeof img === "string" && img.trim() !== ""
      );
    }
    if (Array.isArray(service.service_image)) {
      return service.service_image.filter(
        (img: string) => typeof img === "string" && img.trim() !== ""
      );
    }
  } catch (_e) {}
  return ["/assets/burjKhalifa.jpg"];
};

const formatAED = (amount: number | null | undefined) => {
  const value = Number(amount ?? 0);
  return `AED ${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
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
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [datePreset, setDatePreset] = useState<"today" | "tomorrow" | "all">(
    "all"
  );
  const [instantConfirmOnly, setInstantConfirmOnly] = useState(false);
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

  const locationOptions = useMemo(() => {
    const set = new Set(
      services.map((s) => (s.location ?? "").trim()).filter((v) => v.length > 0)
    );
    return Array.from(set).sort();
  }, [services]);

  const derivedMaxPrice = useMemo(() => {
    const max = services.reduce(
      (acc, s) => Math.max(acc, Number(s.default_price ?? 0)),
      0
    );
    return Math.max(1000, Math.ceil(max / 100) * 100);
  }, [services]);

  useEffect(() => {
    setPriceRange([0, derivedMaxPrice]);
  }, [derivedMaxPrice]);

  const filteredAndSorted = useMemo(() => {
    let list = [...services];

    if (selectedLocations.length > 0) {
      list = list.filter((s) => selectedLocations.includes(s.location));
    }

    const [minP, maxP] = priceRange;
    list = list.filter((s) => {
      const p = Number(s.default_price ?? 0);
      return p >= minP && p <= maxP;
    });

    if (instantConfirmOnly) {
      list = list;
    }

    if (datePreset) {
      list = list;
    }

    if (sortBy === "price_asc") {
      list.sort(
        (a, b) => Number(a.default_price ?? 0) - Number(b.default_price ?? 0)
      );
    } else if (sortBy === "price_desc") {
      list.sort(
        (a, b) => Number(b.default_price ?? 0) - Number(a.default_price ?? 0)
      );
    }

    return list;
  }, [
    services,
    selectedLocations,
    priceRange,
    instantConfirmOnly,
    datePreset,
    sortBy,
  ]);

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

    navigate(`/bookings/${service.id}`, { state: servicePayload });
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((x) => x !== loc) : [...prev, loc]
    );
  };

  type SortChangeEvent = { target: { value: string } };

  const handleSortChange = (e: SortChangeEvent) => {
    setSortBy(e.target.value);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "360px 1fr" },
            gap: 3,
            alignItems: "start",
          }}
        >
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
            <Box sx={{ p: 2.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 1.5 }}>
                Location
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {locationOptions.length === 0 ? (
                  <Chip label="Dubai" size="small" variant="outlined" />
                ) : (
                  locationOptions.map((loc) => (
                    <Chip
                      key={loc}
                      label={loc}
                      onClick={() => toggleLocation(loc)}
                      variant={
                        selectedLocations.includes(loc) ? "filled" : "outlined"
                      }
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        mb: 1,
                        bgcolor: selectedLocations.includes(loc)
                          ? "#111827"
                          : "transparent",
                        color: selectedLocations.includes(loc)
                          ? "white"
                          : "#111827",
                        borderColor: "#d0d5dd",
                        "&:hover": {
                          bgcolor: selectedLocations.includes(loc)
                            ? "#111827"
                            : "#f3f4f6",
                        },
                      }}
                    />
                  ))
                )}
              </Stack>
            </Box>

            <Divider />

            <Box sx={{ p: 2.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 1.5 }}>
                Dates
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Button
                  variant={datePreset === "today" ? "contained" : "outlined"}
                  onClick={() => setDatePreset("today")}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: datePreset === "today" ? "#111827" : "transparent",
                    borderColor: "#d0d5dd",
                    color: datePreset === "today" ? "white" : "#111827",
                    "&:hover": {
                      bgcolor: datePreset === "today" ? "#111827" : "#f3f4f6",
                    },
                  }}
                >
                  Today
                </Button>
                <Button
                  variant={datePreset === "tomorrow" ? "contained" : "outlined"}
                  onClick={() => setDatePreset("tomorrow")}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor:
                      datePreset === "tomorrow" ? "#111827" : "transparent",
                    borderColor: "#d0d5dd",
                    color: datePreset === "tomorrow" ? "white" : "#111827",
                    "&:hover": {
                      bgcolor:
                        datePreset === "tomorrow" ? "#111827" : "#f3f4f6",
                    },
                  }}
                >
                  Tomorrow
                </Button>
                <Button
                  variant={datePreset === "all" ? "contained" : "outlined"}
                  onClick={() => setDatePreset("all")}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: datePreset === "all" ? "#111827" : "transparent",
                    borderColor: "#d0d5dd",
                    color: datePreset === "all" ? "white" : "#111827",
                    "&:hover": {
                      bgcolor: datePreset === "all" ? "#111827" : "#f3f4f6",
                    },
                  }}
                >
                  All dates
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Box sx={{ p: 2.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 1.5 }}>
                Price range
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
                  },
                }}
              />
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    flex: 1,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    borderColor: "#e5e7eb",
                  }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: 14 }}>
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
                  }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: 14 }}>
                    {formatAED(priceRange[1])}
                  </Typography>
                </Paper>
              </Stack>
            </Box>

            <Divider />

            <Box sx={{ p: 2.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 1.5 }}>
                Others
              </Typography>
              <Button
                variant={instantConfirmOnly ? "contained" : "outlined"}
                onClick={() => setInstantConfirmOnly((p) => !p)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                  bgcolor: instantConfirmOnly ? "#111827" : "transparent",
                  borderColor: "#d0d5dd",
                  color: instantConfirmOnly ? "white" : "#111827",
                  "&:hover": {
                    bgcolor: instantConfirmOnly ? "#111827" : "#f3f4f6",
                  },
                }}
              >
                Instant confirmation
              </Button>
            </Box>
          </Paper>

          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "center" },
                gap: 2,
                mb: 2,
              }}
            >
              <Typography sx={{ fontWeight: 700, color: "#111827" }}>
                {loading ? "Loading..." : `${resultsCount} results found`}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ color: "#6b7280", fontWeight: 600 }}>
                  Sort by
                </Typography>
                <FormControl size="small">
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    sx={{
                      borderRadius: 2,
                      bgcolor: "white",
                      minWidth: 190,
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

            <Grid container spacing={3}>
              {loading
                ? Array.from(new Array(4)).map((_, index) => (
                    // @ts-ignore
                    <Grid item xs={12} sm={6} lg={4} key={index}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          height: 360,
                          bgcolor: "white",
                          border: "1px solid #eee",
                        }}
                      />
                    </Grid>
                  ))
                : filteredAndSorted.map((service) => {
                    const images = getServiceImages(service);
                    return (
                      // @ts-ignore
                      <Grid item xs={12} sm={6} lg={4} key={service.id}>
                        <Card
                          sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            bgcolor: "white",
                            border: "1px solid #e9ecef",
                            boxShadow: "0 10px 26px rgba(16, 24, 40, 0.06)",
                            transition:
                              "transform 140ms ease, box-shadow 140ms ease",
                            cursor: "pointer",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: "0 14px 32px rgba(16, 24, 40, 0.12)",
                            },
                          }}
                          onClick={() => handleServiceClick(service)}
                        >
                          <Box sx={{ position: "relative" }}>
                            <CardMedia
                              component="img"
                              height="220"
                              image={images[0]}
                              alt={service.service_name}
                              sx={{ objectFit: "cover" }}
                            />
                            <IconButton
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                bgcolor: "rgba(0,0,0,0.30)",
                                color: "white",
                                "&:hover": { bgcolor: "rgba(0,0,0,0.45)" },
                              }}
                            >
                              <FavoriteBorderIcon />
                            </IconButton>
                            <Chip
                              label="Recommended"
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                bgcolor: "#FF621F",
                                color: "white",
                                fontWeight: 800,
                                borderRadius: 1,
                              }}
                            />
                          </Box>

                          <CardContent sx={{ p: 2.5 }}>
                            <Typography
                              sx={{
                                color: "#6b7280",
                                fontWeight: 600,
                                fontSize: 14,
                                mb: 0.5,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <LocationOnIcon sx={{ fontSize: 16 }} />
                              {service.location || "Dubai"}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 18,
                                fontWeight: 800,
                                color: "#111827",
                                lineHeight: 1.2,
                                mb: 1,
                                minHeight: 44,
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {service.service_name}
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{ mb: 1.5 }}
                            >
                              <Rating
                                value={4.2}
                                readOnly
                                size="small"
                                sx={{ color: "#FFB800" }}
                              />
                              <Typography
                                sx={{
                                  color: "#6b7280",
                                  fontWeight: 700,
                                  fontSize: 13,
                                }}
                              >
                                4.2
                              </Typography>
                              <Typography
                                sx={{ color: "#6b7280", fontSize: 13 }}
                              >
                                (1k+ booked)
                              </Typography>
                            </Stack>

                            <Typography
                              sx={{
                                color: "#6b7280",
                                fontSize: 14,
                                mb: 2,
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {service.service_description || ""}
                            </Typography>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 2,
                              }}
                            >
                              <Box>
                                <Typography
                                  sx={{
                                    color: "#6b7280",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  From
                                </Typography>
                                <Typography
                                  sx={{
                                    fontWeight: 900,
                                    fontSize: 18,
                                    color: "#111827",
                                  }}
                                >
                                  {formatAED(service.default_price)}
                                </Typography>
                              </Box>

                              <Button
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleServiceClick(service);
                                }}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: "none",
                                  fontWeight: 900,
                                  px: 2.5,
                                  bgcolor: "#111827",
                                  "&:hover": { bgcolor: "#374151" },
                                }}
                              >
                                Book now
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
            </Grid>
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default ServicesPage;
