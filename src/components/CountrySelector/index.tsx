import { useCountry } from "../../context/CountryContext";
export function CountrySelector() {
  const { countries, countryCode, setCountryCode, error, loading } = useCountry();
  return <select aria-label="Destination country" title={error || "Choose your destination"}
    value={countryCode} onChange={e => setCountryCode(e.target.value)} disabled={loading || !!error}
    style={{ maxWidth: 190, minWidth: 110, padding: "9px 6px", borderRadius: 8, border: "1px solid #ddd", background: "white", color: "#333" }}>
    <option value="">{loading ? "Loading destinations…" : error ? "Destinations unavailable" : "All destinations"}</option>
    {countries.map(c => <option key={c.code} value={c.code}>{c.name} · {c.destination_label}</option>)}
  </select>;
}
