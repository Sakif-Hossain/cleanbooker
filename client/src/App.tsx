import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Booking from "./pages/Booking";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./App.css";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/:role" element={<Register />} />

          {/* Client routes  */}
          <Route element={<ProtectedRoute requireClient />}>
            <Route path="/booking" element={<Booking />} />
          </Route>

          {/* Business routes */}
          <Route element={<ProtectedRoute requireBusiness />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            {/* <Route path="/profile" element={<Profile />} /> */}
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
