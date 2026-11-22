import { createContext, useContext } from "react";
export type Country = { code: string; name: string; destination_label: string; description: string; hero_image: string };
type CountryState = { countries: Country[]; countryCode: string; country?: Country; setCountryCode: (code: string) => void; refreshCountries: () => Promise<void>; error: string; loading: boolean };
export const CountryContext = createContext<CountryState | null>(null);
export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) throw new Error("CountryProvider is required");
  return context;
}
