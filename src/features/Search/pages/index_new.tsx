import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header, Footer } from "../../../components";
import { supabase } from "../../../supabaseClient";
import { Box, Container, Card, CardContent, CardMedia, Typography, Slider, Button, Chip, IconButton, MenuItem, Select, FormControl, Skeleton, } from "@mui/material";
import { Favorite, FavoriteBorder, LocationOn, Star, } from "@mui/icons-material";
import "../pages/index";
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
    const [searchQuery] = useState(searchParams.get("query") || "");
    const [priceRange, setPriceRange] = useState<number[]>([0, 2000]);
    const [sortBy, setSortBy] = useState("recommended");
    useEffect(() => {
        fetchServices();
    }, []);
    useEffect(() => {
        applyFilters();
    }, [services, searchQuery, priceRange, sortBy]);
    const fetchServices = async () => {
        try {
            setLoading(false);
            const { data, error } = await supabase
                .from("services")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) {
                console.error("Supabase error:", error);
                throw error;
            }
            setServices(data || []);
        }
        catch (error) {
            console.error("Error fetching services:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const applyFilters = () => {
        let filtered = [...services];
        // Search filter
        if (searchQuery) {
            filtered = filtered.filter((service) => service.service_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
                service.service_description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                service.location?.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        // Price filter
        filtered = filtered.filter((service) => service.default_price >= priceRange[0] &&
            service.default_price <= priceRange[1]);
        // Sort
        switch (sortBy) {
            case "price-low":
                filtered.sort((a, b) => a.default_price - b.default_price);
                break;
            case "price-high":
                filtered.sort((a, b) => b.default_price - a.default_price);
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
            }
            else {
                newFavorites.add(serviceId);
            }
            return newFavorites;
        });
    };
    const getServiceImages = (service: Service): string[] => {
        try {
            if (typeof service.service_image === "string") {
                const parsed = JSON.parse(service.service_image);
                if (Array.isArray(parsed))
                    return parsed.filter((img) => img);
            }
            if (Array.isArray(service.service_image?.url)) {
                return service.service_image.url.filter((img: string) => img);
            }
            if (Array.isArray(service.service_image)) {
                return service.service_image.filter((img) => img);
            }
        }
        catch (e) {
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
    return (<Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", gap: 3 }}>
          {/* Left Sidebar - Filters */}
          <Box sx={{
            width: 280,
            flexShrink: 0,
            display: { xs: "none", md: "block" },
        }}>
            <Box sx={{
            bgcolor: "white",
            borderRadius: 2,
            p: 3,
            position: "sticky",
            top: 20,
        }}>
              {/* Price Range Filter */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Price range
                </Typography>
                <Box sx={{ px: 1 }}>
                  <Slider value={priceRange} onChange={(_, newValue) => setPriceRange(newValue as number[])} valueLabelDisplay="auto" min={0} max={2000} sx={{
            color: "#FF621F",
            "& .MuiSlider-thumb": {
                bgcolor: "white",
                border: "2px solid #FF621F",
            },
        }}/>
                  <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 2,
        }}>
                    <Typography variant="body2" color="text.secondary">
                      US$ {priceRange[0]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      US$ {priceRange[1]}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Reset Button */}
              <Button fullWidth variant="outlined" sx={{
            borderColor: "#FF621F",
            color: "#FF621F",
            "&:hover": {
                borderColor: "#e55a1c",
                bgcolor: "rgba(255, 98, 31, 0.04)",
            },
        }} onClick={() => {
            setPriceRange([0, 2000]);
            setSortBy("recommended");
        }}>
                Reset Filters
              </Button>
            </Box>
          </Box>

          {/* Right Content - Services Grid */}
          <Box sx={{ flex: 1 }}>
            {/* Header with results count and sort */}
            <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
        }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {filteredServices.length} result
                {filteredServices.length !== 1 ? "s" : ""} found
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2">Sort by</Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} sx={{ borderRadius: 2 }}>
                    <MenuItem value="recommended">Recommended</MenuItem>
                    <MenuItem value="price-low">Price: Low to High</MenuItem>
                    <MenuItem value="price-high">Price: High to Low</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Services Grid */}
            <Box sx={{
            display: "grid",
            gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
            },
            gap: 3,
        }}>
              {loading
            ? Array.from(new Array(6)).map((_, index) => (<Card key={index} sx={{ borderRadius: 2 }}>
                      <Skeleton variant="rectangular" height={200}/>
                      <CardContent>
                        <Skeleton />
                        <Skeleton width="60%"/>
                      </CardContent>
                    </Card>))
            : filteredServices.map((service) => {
                const images = getServiceImages(service);
                const isFavorite = favorites.has(service.id);
                return (<Card key={service.id} sx={{
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.3s",
                        position: "relative",
                        "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: 6,
                        },
                    }} onClick={() => handleServiceClick(service)}>
                        {/* Favorite Button */}
                        <IconButton sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "rgba(255,255,255,0.9)",
                        zIndex: 1,
                        "&:hover": { bgcolor: "white" },
                    }} onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(service.id);
                    }}>
                          {isFavorite ? (<Favorite sx={{ color: "#FF621F" }}/>) : (<FavoriteBorder />)}
                        </IconButton>

                        {/* Image */}
                        <CardMedia component="img" height="200" image={images[0]} alt={service.service_name} sx={{ objectFit: "cover" }}/>

                        <CardContent sx={{ p: 2 }}>
                          {/* Location */}
                          <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 1,
                    }}>
                            <LocationOn sx={{ fontSize: 16, color: "#FF621F" }}/>
                            <Typography variant="caption" color="text.secondary">
                              {service.location || "Dubai"}
                            </Typography>
                          </Box>

                          {/* Title */}
                          <Typography variant="h6" sx={{
                        fontWeight: 600,
                        mb: 1,
                        fontSize: "1rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: "3em",
                    }}>
                            {service.service_name}
                          </Typography>

                          {/* Description */}
                          <Typography variant="body2" color="text.secondary" sx={{
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: "2.8em",
                    }}>
                            {service.service_description}
                          </Typography>

                          {/* Rating */}
                          <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1,
                    }}>
                            <Star sx={{ color: "#FFB400", fontSize: 16, mr: 0.5 }}/>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              4.5
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                              (100+ reviews)
                            </Typography>
                          </Box>

                          {/* Price */}
                          <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#FF621F" }}>
                              US$ {service.default_price.toFixed(2)}
                            </Typography>
                            <Chip label="Book Now" size="small" sx={{
                        bgcolor: "#FF621F",
                        color: "white",
                        fontWeight: 600,
                        "&:hover": { bgcolor: "#e55a1c" },
                    }}/>
                          </Box>
                        </CardContent>
                      </Card>);
            })}
            </Box>

            {/* No Results */}
            {!loading && filteredServices.length === 0 && (<Box sx={{
                textAlign: "center",
                py: 8,
                bgcolor: "white",
                borderRadius: 2,
            }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No services found matching your criteria
                </Typography>
                <Button variant="contained" sx={{
                bgcolor: "#FF621F",
                "&:hover": { bgcolor: "#e55a1c" },
            }} onClick={() => {
                setPriceRange([0, 2000]);
                setSortBy("recommended");
            }}>
                  Clear Filters
                </Button>
              </Box>)}
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>);
};
export default SearchPage;
