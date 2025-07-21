import {Routes, Route} from 'react-router-dom';
import {LoginPage, SignupPage} from '../pages';
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {/* Add more routes here as needed */}
    </Routes>
  );
}