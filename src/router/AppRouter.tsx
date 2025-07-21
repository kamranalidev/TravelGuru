import {Routes, Route} from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      {/* Add more routes here as needed */}
    </Routes>
  );
}