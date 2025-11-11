import "./App.css";
import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import AppRouter from "./router/AppRouter";
import ErrorBoundary from "./components/ErrorBoundary";
function App() {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event);
        console.log("Session:", session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;
