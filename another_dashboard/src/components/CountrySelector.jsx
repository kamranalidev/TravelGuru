import { Select, Tooltip } from "antd";
import { useCountry } from "../context/CountryContext";
export default function CountrySelector() {
  const { countries, countryCode, setCountryCode, loading, error } = useCountry();
  return <Tooltip title={error}><Select aria-label="Country scope" style={{ width: "min(230px, 48vw)" }} value={countryCode} loading={loading} disabled={!!error}
    onChange={setCountryCode} options={[{ value: "", label: "All countries" }, ...countries.map(c => ({ value: c.code, label: `${c.name} · ${c.destination_label}` }))]} /></Tooltip>;
}
