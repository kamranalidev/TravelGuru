import { createContext, useContext } from "react";

export const CountryContext = createContext(null);
export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) throw new Error("CountryProvider is required");
  return context;
}
