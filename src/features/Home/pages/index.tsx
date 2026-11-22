import { firstServiceImage } from "../../../utils/serviceImages";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Search, Star, Ticket, Headphones, Route } from "lucide-react";
import { Header, Footer } from "../../../components";
import { useCountry } from "../../../context/CountryContext";
import { supabase } from "../../../supabaseClient";
import "./index.css";

type Experience = {
  id: number;
  service_name: string;
  location?: string;
  country_code?: string;
  service_image?: unknown;
  service_type?: string;
  default_price?: number | null;
  is_active?: boolean;
  average_rating?: number;
  total_reviews?: number;
  packages?: { duration_days?: number; is_active?: boolean }[];
};

const destinationImages: Record<string, string> = { AE: "/assets/AbuDhabi.jpg", AZ: "/assets/destinations/baku.jpg", MY: "/assets/destinations/malaysia.jpg" };

const categories = [
  { label: "All experiences", value: "all", icon: Ticket },
  { label: "Tours & day trips", value: "tour", icon: MapPin },
  { label: "Multi-day trips", value: "multi", icon: CalendarDays },
  { label: "Activities", value: "activity", icon: Ticket },
  { label: "Transfers", value: "transport", icon: Route },
];

export const Homepage = () => {
  const { countries, countryCode, country, setCountryCode } = useCountry();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from("services").select("*, packages(duration_days, is_active)").order("created_at", { ascending: false });
      if (!active) return;
      if (error) setError("We couldn’t load the experiences. Please try again.");
      else setExperiences(data || []);
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, []);

  const inCountry = useMemo(() => experiences.filter(s => s.is_active !== false && (!countryCode || s.country_code === countryCode)), [experiences, countryCode]);
  const visible = inCountry.filter(s => category === "all" || (category === "multi"
    ? s.packages?.some(p => p.is_active !== false && (p.duration_days || 1) > 1)
    : category === "tour" ? ["tour", "safari", "cruise", "experience"].includes(s.service_type || "") : s.service_type === category));
  const heroImage = country?.hero_image || (countryCode ? destinationImages[countryCode] : undefined) || inCountry.map(s => firstServiceImage(s.service_image)).find(Boolean) || (!countryCode || countryCode === "AE" ? "/assets/AbuDhabi.jpg" : undefined);
  const search = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(`/services${query.trim() ? `?query=${encodeURIComponent(query.trim())}` : ""}`);
  };

  return <div className="home-page">
    <Header />
    <main>
      <section className="travel-hero" style={heroImage ? { backgroundImage: `linear-gradient(90deg, rgba(12,24,27,.78), rgba(12,24,27,.18)), url("${heroImage}")` } : undefined}>
        <div className="home-container hero-inner">
          <p className="hero-eyebrow">{country ? `Explore ${country.name}` : "Day trips, local experiences & longer escapes"}</p>
          <h1>{country ? `Make time for ${country.destination_label}.` : <>Your next trip.<br />More to look forward to.</>}</h1>
          <p className="hero-intro">{country?.description || "Find things to do, compare packages, and plan your days in one place."}</p>
          <form className="destination-search" onSubmit={search} role="search">
            <Search size={22} aria-hidden="true" />
            <label className="sr-only" htmlFor="home-search">Search destinations or experiences</label>
            <input id="home-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Where do you want to go?" />
            <button type="submit">Search</button>
          </form>
          <div className="hero-suggestions"><span>Explore</span>{countries.slice(0, 4).map(c => <button key={c.code} onClick={() => { setCountryCode(c.code); setCategory("all"); }}>{c.destination_label}</button>)}</div>
        </div>
      </section>

      <div className="home-container">
        <nav className="experience-categories" aria-label="Experience categories">
          {categories.map(({ label, value, icon: Icon }) => <button key={value} className={category === value ? "category-button active" : "category-button"} aria-pressed={category === value} onClick={() => { setCategory(value); document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><Icon size={20} strokeWidth={1.7} />{label}</button>)}
        </nav>

        {countries.length > 0 && <section className="home-section" aria-labelledby="destination-heading">
          <div className="section-heading"><div><h2 id="destination-heading">Where to next?</h2><p>Start with a destination. Build the trip around you.</p></div>{countryCode && <button className="text-button" onClick={() => setCountryCode("")}>View all destinations</button>}</div>
          <div className="destination-grid">{countries.map(c => {
            const photo = c.hero_image || destinationImages[c.code] || experiences.filter(s => s.country_code === c.code).map(s => firstServiceImage(s.service_image)).find(Boolean) || (c.code === "AE" ? "/assets/AbuDhabi.jpg" : undefined);
            return <button className={`destination-tile${countryCode === c.code ? " selected" : ""}`} key={c.code} onClick={() => { setCountryCode(c.code); setCategory("all"); document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth" }); }}>
              {photo ? <img src={photo} alt="" loading="lazy" onError={e => { e.currentTarget.style.visibility = "hidden"; }} /> : <MapPin className="destination-placeholder" size={44} strokeWidth={1} />}
              <span className="destination-caption"><strong>{c.destination_label}</strong><span>{c.name}</span></span>
            </button>;
          })}</div>
        </section>}

        <section className="home-section" id="experiences" aria-labelledby="experience-heading">
          <div className="section-heading"><div><h2 id="experience-heading">{category === "multi" ? "A few more days away" : country ? `Things to do in ${country.destination_label}` : "Find your kind of experience"}</h2><p>{category === "multi" ? "Compare trip lengths and see what’s planned for each day." : "Browse the options, check the details, and choose what fits."}</p></div><Link to="/services" className="text-button">View all experiences</Link></div>
          {loading ? <div className="experience-grid" aria-busy="true" aria-label="Loading experiences">{[1, 2, 3, 4].map(i => <div key={i} className="experience-skeleton" />)}</div>
            : error ? <div className="catalog-empty" role="alert"><h3>Experiences are unavailable</h3><p>{error}</p><button onClick={() => window.location.reload()}>Try again</button></div>
            : visible.length === 0 ? <div className="catalog-empty"><h3>No experiences here yet</h3><p>Try another destination or browse all experience types.</p><button onClick={() => { setCountryCode(""); setCategory("all"); }}>Browse all experiences</button></div>
            : <div className="experience-grid">{visible.slice(0, 8).map(service => {
              const photo = firstServiceImage(service.service_image);
              const multi = service.packages?.filter(p => p.is_active !== false && (p.duration_days || 1) > 1).map(p => p.duration_days as number) || [];
              return <Link to={`/bookings/${service.id}`} state={service} className="experience-card" key={service.id}>
                <div className="experience-photo">{photo ? <img src={photo} alt={service.service_name} loading="lazy" onError={e => { e.currentTarget.src = "/Travel-Guru-Logo-Final.png"; e.currentTarget.onerror = null; }} /> : <div className="experience-placeholder"><MapPin size={32} strokeWidth={1} /></div>}{multi.length > 0 && <span className="trip-label">{Math.min(...multi)}{Math.max(...multi) !== Math.min(...multi) ? `–${Math.max(...multi)}` : ""} days</span>}</div>
                <div className="experience-content"><p className="experience-location"><MapPin size={13} />{service.location || countries.find(c => c.code === service.country_code)?.name || "Experience"}</p><h3>{service.service_name}</h3>
                  {Number(service.total_reviews) > 0 && Number(service.average_rating) > 0 && <p className="experience-rating"><Star size={14} fill="currentColor" /><strong>{Number(service.average_rating).toFixed(1)}</strong><span>({service.total_reviews} reviews)</span></p>}
                  <div className="experience-price">{service.default_price != null ? <><span>From</span><strong>AED {Number(service.default_price).toLocaleString()}</strong><span>per person</span></> : <span>View packages for pricing</span>}</div>
                </div>
              </Link>;
            })}</div>}
        </section>

        <section className="trip-planning-banner"><div><span className="section-kicker">Stay a little longer</span><h2>One trip. Every day planned.</h2><p>Compare multi-day packages, read the itinerary, and see your full travel dates before you book.</p><button onClick={() => { setCategory("multi"); document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth" }); }}>Explore multi-day trips</button></div><img src="/assets/DhowCruise.jpg" alt="An evening on the water in Dubai" loading="lazy" /></section>

        <section className="booking-benefits" aria-label="Booking information">
          <div><CalendarDays size={25} strokeWidth={1.5} /><div><h3>Know your dates</h3><p>See the full trip length before checkout.</p></div></div>
          <div><Ticket size={25} strokeWidth={1.5} /><div><h3>Compare the details</h3><p>Review inclusions, prices, and cancellation terms.</p></div></div>
          <div><Headphones size={25} strokeWidth={1.5} /><div><h3>Talk to our team</h3><p><Link to="/contact">Get help planning or managing your booking.</Link></p></div></div>
        </section>
      </div>
    </main>
    <Footer />
  </div>;
};
