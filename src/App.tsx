import "./App.css";
import AppRouter from "./router/AppRouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { WhatsAppWidget } from "./components";

function App() {
  return <ErrorBoundary>
    <AppRouter />
    <WhatsAppWidget phoneNumber="+971586257508" message="Hello! I'm interested in your travel services." />
  </ErrorBoundary>;
}
export default App;
