import "./App.css";
import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import AppRouter from "./router/AppRouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { WhatsAppWidget } from "./components";

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
      <WhatsAppWidget
        phoneNumber="+971586257508"
        message="Hello! I'm interested in your Dubai travel services."
      />
    </ErrorBoundary>
  );
}

export default App;
