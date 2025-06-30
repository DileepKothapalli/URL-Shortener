// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Auth       from './pages/Auth';         // login / signup screen
import Shorten from './pages/Shorten';   // form to shorten URL
import MyLinks    from './pages/MyLinks';      // table with links + stats
import Navbar     from './components/Navbar';  // navbar + outlet
import PrivateRoute from './routes/PrivateRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- public routes ---------- */}
        <Route path="/"      element={<Navigate to="/auth" replace />} />
        <Route path="/auth"  element={<Auth />} />

        {/* ---------- protected routes ---------- */}
        <Route element={<PrivateRoute />}>
          <Route element={<Navbar />}>
            <Route path="/shorten"  element={<Shorten />} />
            <Route path="/my-links" element={<MyLinks />} />
          </Route>
        </Route>

        {/* ---------- catch‑all ---------- */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
