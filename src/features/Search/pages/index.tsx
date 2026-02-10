import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header, Footer } from "../../../components";
import { supabase } from "../../../supabaseClient";
import { Box, Container, Card, CardContent, CardMedia, Typography, TextField, Slider, Button, MenuItem, Select, FormControl, Skeleton, Checkbox, FormControlLabel, } from "@mui/material";
import { LocationOn, AccessTime } from "@mui/icons-material";
import "./styles.css";
interface Service {
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
}
export const SearchPage = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [searchQuery] = useState(searchParams.get("query") || "");
    const [priceRange, setPriceRange] = useState<number[]>([0, 2000]);
    const [sortBy, setSortBy] = useState("recommended");
    const [instantConfirmation, setInstantConfirmation] = useState(false);
    const [maxPrice, setMaxPrice] = useState<number>(2000);
    const formatAED = (value: number) => new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
    const formatTime = (t: string | null | undefined) => {
        if (!t)
            return null;
        const d = new Date(`1970-01-01T${t}`);
        if (Number.isNaN(d.getTime()))
            return t;
        return d.toLocaleTimeString("en-AE", {
            hour: "numeric",
            minute: "2-digit",
        });
    };
    const formatDuration = (hours: number | string | null | undefined) => {
        const v = Number(hours);
        if (!Number.isFinite(v) || v <= 0)
            return null;
        return v === 1 ? "1 hour" : `${v} hours`;
    };
    const formatDays = (value: any): string | null => {
        if (!value)
            return null;
        try {
            if (Array.isArray(value))
                return value.join(", ");
            if (typeof value === "string") {
                const trimmed = value.trim();
                if (!trimmed)
                    return null;
                if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                    const parsed = JSON.parse(trimmed);
                    return formatDays(parsed);
                }
                return trimmed;
            }
            if (typeof value === "object") {
                if (Array.isArray((value as any).days))
                    return (value as any).days.join(", ");
                const keys = Object.keys(value).filter((k) => (value as any)[k]);
                return keys.length ? keys.join(", ") : null;
            }
        }
        catch {
            return null;
        }
        return null;
    };
    const getServiceImages = (service: Service): string[] => {
        try {
            const imgVal: any = service.service_image;
            if (typeof imgVal === "string") {
                const parsed = JSON.parse(imgVal);
                if (Array.isArray(parsed)) {
                    return parsed
                        .map((x) => (typeof x === "string" ? x : x?.url))
                        .filter((u) => typeof u === "string" && u.trim() !== "");
                }
            }
            if (Array.isArray(imgVal)) {
                return imgVal
                    .map((x) => (typeof x === "string" ? x : x?.url))
                    .filter((u) => typeof u === "string" && u.trim() !== "");
            }
            if (Array.isArray((service as any).service_image?.url)) {
                return (service as any).service_image.url.filter((u: unknown) => typeof u === "string" && u.trim() !== "");
            }
            if (typeof imgVal?.url === "string" && imgVal.url.trim() !== "") {
                return [imgVal.url];
            }
        }
        catch (e) {
        }
        return ["/assets/burjKhalifa.jpg"];
    };
    useEffect(() => {
        fetchServices();
    }, []);
    useEffect(() => {
        applyFilters();
    }, [services, searchQuery, priceRange, sortBy, instantConfirmation]);
    const fetchServices = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("services")
                .select("*")
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            setServices(data || []);
            const computedMax = data && data.length
                ? Math.max(...data.map((s: Service) => Number(s.default_price) || 0))
                : 0;
            const safeMax = Math.max(2000, computedMax);
            setMaxPrice(safeMax);
            setPriceRange((prev) => [prev[0], Math.max(prev[1], safeMax)]);
        }
        catch (error) {
        }
        finally {
            setLoading(false);
        }
    };
    const applyFilters = () => {
        let filtered = [...services];
        if (searchQuery) {
            filtered = filtered.filter((service) => service.service_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
                service.service_description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                service.location?.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        filtered = filtered.filter((service) => service.default_price >= priceRange[0] &&
            service.default_price <= priceRange[1]);
        switch (sortBy) {
            case "price-low":
                filtered.sort((a, b) => a.default_price - b.default_price);
                break;
            case "price-high":
                filtered.sort((a, b) => b.default_price - a.default_price);
                break;
            default:
                break;
        }
        setFilteredServices(filtered);
    };
    const handleServiceClick = (service: Service) => {
        const payload = {
            ...service,
            name: service.service_name,
            description: service.service_description ||
                "Premium experience curated by Travel Guroo.",
            price: service.default_price,
        };
        navigate(`/bookings/${service.id}`, { state: payload });
    };
    return (<Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Box sx={{
            width: "280px",
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
              <Box sx={{ mb: 3, pb: 3, borderBottom: "1px solid #e0e0e0" }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Location
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Locations including products found
                </Typography>
                <Button startIcon={<LocationOn />} sx={{
            textTransform: "none",
            color: "#FF621F",
            justifyContent: "flex-start",
            p: 0,
        }}>
                  See all
                </Button>
              </Box>

              <Box sx={{ mb: 3, pb: 3, borderBottom: "1px solid #e0e0e0" }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Dates
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <Button variant="outlined" sx={{
            textTransform: "none",
            borderRadius: 2,
            borderColor: "#ddd",
            color: "#333",
            flex: 1,
        }}>
                    Today
                  </Button>
                  <Button variant="outlined" sx={{
            textTransform: "none",
            borderRadius: 2,
            borderColor: "#ddd",
            color: "#333",
            flex: 1,
        }}>
                    Tomorrow
                  </Button>
                </Box>
                <Button startIcon={<AccessTime />} sx={{
            textTransform: "none",
            color: "#FF621F",
            p: 0,
        }}>
                  All dates
                </Button>
              </Box>

              <Box sx={{ mb: 3, pb: 3, borderBottom: "1px solid #e0e0e0" }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Price range
                </Typography>
                <Box sx={{ px: 1 }}>
                  <Slider value={priceRange} onChange={(_, newValue) => setPriceRange(newValue as number[])} valueLabelDisplay="auto" min={0} max={maxPrice} sx={{
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
            gap: 1,
        }}>
                    <TextField value={priceRange[0]} onChange={(e) => setPriceRange([
            parseInt(e.target.value) || 0,
            priceRange[1],
        ])} size="small" sx={{ flex: 1 }} InputProps={{
            startAdornment: (<Typography sx={{ mr: 0.5, fontSize: "0.875rem" }}>
                            AED
                          </Typography>),
        }}/>
                    <Typography sx={{ alignSelf: "center" }}>-</Typography>
                    <TextField value={priceRange[1]} onChange={(e) => setPriceRange([
            priceRange[0],
            parseInt(e.target.value) || maxPrice,
        ])} size="small" sx={{ flex: 1 }} InputProps={{
            startAdornment: (<Typography sx={{ mr: 0.5, fontSize: "0.875rem" }}>
                            AED
                          </Typography>),
        }}/>
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Others
                </Typography>
                <FormControlLabel control={<Checkbox checked={instantConfirmation} onChange={(e) => setInstantConfirmation(e.target.checked)} sx={{
                color: "#FF621F",
                "&.Mui-checked": { color: "#FF621F" },
            }}/>} label="Instant confirmation"/>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
        }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {filteredServices.length} results found
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
                        <CardMedia component="img" height="200" image={images[0]} alt={service.service_name} sx={{ objectFit: "cover" }}/>

                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: "1rem" }}>
                            {service.service_name}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" sx={{
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                    }}>
                            <LocationOn sx={{ fontSize: 16, mr: 0.5 }}/>{" "}
                            {service.location}
                            {service.service_type
                        ? ` • ${service.service_type}`
                        : ""}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.4 }}>
                            {service.service_description ||
                        "Premium experience curated by Travel Guroo."}
                          </Typography>

                          <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 1 }}>
                            {formatAED(service.default_price)}
                          </Typography>

                          {(service.start_time || service.end_time) && (<Typography variant="caption" color="text.secondary" display="block">
                              Time: {formatTime(service.start_time) ?? "—"} –{" "}
                              {formatTime(service.end_time) ?? "—"}
                            </Typography>)}

                          {service.duration != null && (<Typography variant="caption" color="text.secondary" display="block">
                              Duration:{" "}
                              {formatDuration(service.duration) ?? "—"}
                            </Typography>)}

                          {service.daily_slots != null && (<Typography variant="caption" color="text.secondary" display="block">
                              Daily slots:{" "}
                              {Number(service.daily_slots).toLocaleString("en-AE")}
                            </Typography>)}

                          {service.days && (<Typography variant="caption" color="text.secondary" display="block">
                              Available: {formatDays(service.days) ?? "—"}
                            </Typography>)}
                        </CardContent>
                      </Card>);
            })}
            </Box>

            {!loading && filteredServices.length === 0 && (<Box sx={{
                textAlign: "center",
                py: 8,
                bgcolor: "white",
                borderRadius: 2,
            }}>
                <Typography variant="h6" color="text.secondary">
                  No services found matching your criteria
                </Typography>
                <Button variant="contained" sx={{
                mt: 2,
                bgcolor: "#FF621F",
                "&:hover": { bgcolor: "#e55a1c" },
                textTransform: "none",
            }} onClick={() => {
                setPriceRange([0, maxPrice]);
                setInstantConfirmation(false);
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
