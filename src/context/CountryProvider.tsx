import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { CountryContext } from "./CountryContext";
import type { Country } from "./CountryContext";
export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [countryCode, setCode] = useState(() => {
    try { return localStorage.getItem("travelguru-country") || ""; } catch { return ""; }
  });
  const refreshCountries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("countries").select("*").order("name");
      if (error) throw error;
      setCountries(data || []);
      setError("");
    } catch {
      setError("Unable to load countries. Check that the country migration has been applied.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void refreshCountries(); }, []);
  const selectedCode = countries.some(c => c.code === countryCode) ? countryCode : "";
  const setCountryCode = (code: string) => {
    setCode(code);
    try { localStorage.setItem("travelguru-country", code); } catch { /* Storage can be disabled. */ }
  };
  const country = countries.find(c => c.code === selectedCode);
  return <CountryContext.Provider value={{ countries, countryCode: selectedCode, country, setCountryCode, refreshCountries, error, loading }}>{children}</CountryContext.Provider>;
}
