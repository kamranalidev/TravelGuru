import {Routes, Route} from 'react-router-dom';
import {LoginPage, SignupPage,Homepage} from '../pages';
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* Add more routes here as needed */}
      
    </Routes>
  );
}