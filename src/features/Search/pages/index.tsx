import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header, Footer } from "../../../components";
import { supabase } from "../../../supabaseClient";
import {
  Box,
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Slider,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Skeleton,
  Grid,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  LocationOn,
  Star,
} from "@mui/icons-material";
import "./styles.css";

interface Service {
  id: string;
  service_name: string;
  service_description: string;
  location: string;
  service_image: any;
  default_price: number;
}

export const SearchPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // Filter states
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || ""
  );
  const [priceRange, setPriceRange] = useState<number[]>([0, 2000]);
  const [sortBy, setSortBy] = useState("recommended");

  // Get unique locations from services
  const locations = Array.from(new Set(services.map((s) => s.location).filter(Boolean)));

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [services, searchQuery, priceRange, sortBy]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...services];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.service_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter((service) => service.location === selectedLocation);
    }

    // Price filter
    filtered = filtered.filter(
      (service) =>
        service.default_price >= priceRange[0] &&
        service.default_price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.default_price - b.default_price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.default_price - a.default_price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "popular":
        filtered.sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0));
        break;
      default:
        // Recommended (default order)
        break;
    }

    setFilteredServices(filtered);
  };

  const toggleFavorite = (serviceId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(serviceId)) {
        newFavorites.delete(serviceId);
      } else {
        newFavorites.add(serviceId);
      }
      return newFavorites;
    });
  };

  const getServiceImages = (service: Service): string[] => {
    try {
      if (typeof service.service_image === "string") {
        const parsed = JSON.parse(service.service_image);
        if (Array.isArray(parsed)) return parsed.filter((img) => img);
      }
      if (Array.isArray(service.service_image?.url)) {
        return service.service_image.url.filter((img: string) => img);
      }
      if (Array.isArray(service.service_image)) {
        return service.service_image.filter((img) => img);
      }
    } catch (e) {
      console.warn("Error parsing images:", e);
    }
    return ["/assets/burjKhalifa.jpg"];
  };

  const handleServiceClick = (service: Service) => {
    navigate(`/booking?serviceId=${service.id}`, {
      state: {
        service: {
          ...service,
          name: service.service_name,
          description: service.service_description,
          price: service.default_price,
        },
      },
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Left Sidebar - Filters */}
          <Grid xs={12} md={3}>
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: 2,
                p: 3,
                position: "sticky",
                top: 20,
              }}
            >
              {/* Location Filter */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Location
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Locations including products found with "{searchQuery || "dhow cruise"}"
                </Typography>
                <Button
                  startIcon={<LocationOn />}
                  sx={{
                    textTransform: "none",
                    color: "#FF621F",
                    justifyContent: "flex-start",
                  }}
                >
                  See all
                </Button>
              </Box>

              {/* Date Filter */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Dates
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      borderColor: "#ddd",
                      color: "#333",
                    }}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      borderColor: "#ddd",
                      color: "#333",
                    }}
                  >
                    Tomorrow
                  </Button>
                </Box>
                <Button
                  startIcon={<AccessTime />}
                  sx={{
                    textTransform: "none",
                    color: "#FF621F",
                    mt: 1,
                  }}
                >
                  All dates
                </Button>
              </Box>

              {/* Price Range Filter */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Price range
                </Typography>
                <Box sx={{ px: 1 }}>
                  <Slider
                    value={priceRange}
                    onChange={(_, newValue) => setPriceRange(newValue as number[])}
                    valueLabelDisplay="auto"
                    min={0}
                    max={2000}
                    sx={{
                      color: "#FF621F",
                      "& .MuiSlider-thumb": {
                        bgcolor: "white",
                        border: "2px solid #FF621F",
                      },
                    }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                    <TextField
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
                      }
                      size="small"
                      sx={{ width: "45%" }}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 0.5 }}>US$</Typography>,
                      }}
                    />
                    <Typography sx={{ alignSelf: "center" }}>-</Typography>
                    <TextField
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value) || 2000])
                      }
                      size="small"
                      sx={{ width: "45%" }}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 0.5 }}>US$</Typography>,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Others Filter */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Others
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={instantConfirmation}
                      onChange={(e) => setInstantConfirmation(e.target.checked)}
                      sx={{ color: "#FF621F", "&.Mui-checked": { color: "#FF621F" } }}
                    />
                  }
                  label="Instant confirmation"
                />
              </Box>
            </Box>
          </Grid>

          {/* Right Content - Services Grid */}
          <Grid xs={12} md={9}>
            {/* Header with results count and sort */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {filteredServices.length} results found
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2">Sort by</Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="recommended">Recommended</MenuItem>
                    <MenuItem value="price-low">Price: Low to High</MenuItem>
                    <MenuItem value="price-high">Price: High to Low</MenuItem>
                    <MenuItem value="rating">Top Rated</MenuItem>
                    <MenuItem value="popular">Most Popular</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Services Grid */}
            <Grid container spacing={3}>
              {loading
                ? Array.from(new Array(6)).map((_, index) => (
                    <Grid xs={12} sm={6} lg={4} key={index}>
                      <Card sx={{ borderRadius: 2 }}>
                        <Skeleton variant="rectangular" height={200} />
                        <CardContent>
                          <Skeleton />
                          <Skeleton width="60%" />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                : filteredServices.map((service) => {
                    const images = getServiceImages(service);
                    const isFavorite = favorites.has(service.id);

                    return (
                      <Grid xs={12} sm={6} lg={4} key={service.id}>
                        <Card
                          sx={{
                            borderRadius: 2,
                            cursor: "pointer",
                            transition: "all 0.3s",
                            position: "relative",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: 6,
                            },
                          }}
                          onClick={() => handleServiceClick(service)}
                        >
                          {/* Badge */}
                          {service.category && (
                            <Chip
                              label="Klook's choice"
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                bgcolor: "#FF621F",
                                color: "white",
                                fontWeight: 600,
                                zIndex: 1,
                              }}
                            />
                          )}

                          {/* Favorite Button */}
                          <IconButton
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              bgcolor: "rgba(255,255,255,0.9)",
                              zIndex: 1,
                              "&:hover": { bgcolor: "white" },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(service.id);
                            }}
                          >
                            {isFavorite ? (
                              <Favorite sx={{ color: "#FF621F" }} />
                            ) : (
                              <FavoriteBorder />
                            )}
                          </IconButton>

                          {/* Image */}
                          <CardMedia
                            component="img"
                            height="200"
                            image={images[0]}
                            alt={service.service_name}
                            sx={{ objectFit: "cover" }}
                          />

                          <CardContent sx={{ p: 2 }}>
                            {/* Category */}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mb: 0.5 }}
                            >
                              {service.category || "Sightseeing cruises"} •{" "}
                              {service.location || "Dubai"}
                            </Typography>

                            {/* Title */}
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                mb: 1,
                                fontSize: "1rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {service.service_name}
                            </Typography>

                            {/* Tags */}
                            <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
                              <Chip
                                label="Hotel pick-up"
                                size="small"
                                sx={{ fontSize: "0.7rem", height: 20 }}
                              />
                              <Chip
                                label="Book now for today"
                                size="small"
                                sx={{ fontSize: "0.7rem", height: 20 }}
                              />
                            </Box>

                            {/* Rating */}
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                              <Star sx={{ color: "#FFB400", fontSize: 16, mr: 0.5 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {service.rating || "4.3"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 0.5 }}
                              >
                                ({service.reviews_count || "1,000"}+) • 10K+ booked
                              </Typography>
                            </Box>

                            {/* Price */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: 700, color: "#FF621F" }}
                              >
                                From US$ {service.default_price.toFixed(2)}
                              </Typography>
                              {service.default_price > 30 && (
                                <Chip
                                  label="30% off"
                                  size="small"
                                  sx={{
                                    bgcolor: "#fff0eb",
                                    color: "#FF621F",
                                    fontSize: "0.7rem",
                                    height: 20,
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
            </Grid>

            {/* No Results */}
            {!loading && filteredServices.length === 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  bgcolor: "white",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No services found matching your criteria
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    mt: 2,
                    bgcolor: "#FF621F",
                    "&:hover": { bgcolor: "#e55a1c" },
                  }}
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLocation("all");
                    setPriceRange([0, 2000]);
                    setSelectedCategories([]);
                  }}
                >
                  Clear Filters
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};

export default SearchPage;
