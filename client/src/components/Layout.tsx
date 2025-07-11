import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [registerOpen, setRegisterOpen] = useState(false);

  const toggleRegister = () => {
    setRegisterOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">
            CleanBooker
          </Link>

          <div className="space-x-4 flex items-center">
            {isAuthenticated ? (
              <>
                {/* Profile visible to everyone when logged in */}
                <Link to="/profile" className="hover:underline">
                  Profile
                </Link>

                {/* Client-only: Book Now */}
                {user?.role === "customer" && (
                  <Link to="/booking" className="hover:underline">
                    Book Now
                  </Link>
                )}

                {/* Business-only: Dashboard */}
                {user?.role === "business" && (
                  <Link to="/dashboard" className="hover:underline">
                    Dashboard
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="hover:underline focus:outline-none"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Single Login link */}
                <Link to="/login" className="hover:underline">
                  Login
                </Link>

                {/* Register Dropdown */}
                <div className="relative inline-block">
                  <button
                    onClick={toggleRegister}
                    className="hover:underline focus:outline-none"
                  >
                    Register
                  </button>
                  {registerOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg z-50">
                      <Link
                        to="/register/client"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setRegisterOpen(false)}
                      >
                        Register as Client
                      </Link>
                      <Link
                        to="/register/business"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setRegisterOpen(false)}
                      >
                        Register Business
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-400 py-4">
        &copy; {new Date().getFullYear()} CleanBooker. All rights reserved.
      </footer>
    </div>
  );
}
