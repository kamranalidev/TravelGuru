import {Routes, Route} from 'react-router-dom';
import {LoginPage, SignupPage,Homepage,BookingPage} from '../pages';
import { Navigate } from 'react-router-dom';
 function ProtectedRoute({ children }:any) {
  const isAuthenticated = !!localStorage.getItem('token'); // Or use context

  return isAuthenticated ? children : <Navigate to="/login" />;
}
export function PublicRoute({ children }:any) {
  const isAuthenticated = !!localStorage.getItem('token'); // Or use context

  return !isAuthenticated ? children : <Navigate to="/" />;
}
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute><Homepage /></PublicRoute>
        
        } />
      <Route path="/signup" element={
        <PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/bookings" element={
       <PublicRoute><BookingPage /></PublicRoute> } />
      {/* Add more routes here as needed */}
      
    </Routes>
  );
}