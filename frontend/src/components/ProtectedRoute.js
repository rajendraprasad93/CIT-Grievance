import { useState, useEffect } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // First check localStorage for dev_user
      const devUserRaw = localStorage.getItem("dev_user");
      const sessionToken = localStorage.getItem("session_token");
      
      console.log("ProtectedRoute - Checking auth...");
      
      if (devUserRaw && sessionToken) {
        try {
          const devUser = JSON.parse(devUserRaw);
          console.log("Parsed devUser:", devUser);
          console.log("devUser.user_id:", devUser.user_id);
          
          // Try to verify with backend
          try {
            const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
              credentials: "include",
              headers: {
                "Authorization": `Bearer ${sessionToken}`
              }
            });

            if (response.ok) {
              const userData = await response.json();
              console.log("Backend user data:", userData);
              // Use backend data as source of truth
              setUser(userData);
              setIsAuthenticated(true);
              // Update localStorage with latest data
              localStorage.setItem("dev_user", JSON.stringify(userData));
              return;
            }
          } catch (e) {
            console.warn("Backend auth check failed, using local user", e);
          }
          
          // If backend check fails but we have local user, still allow access
          setUser(devUser);
          setIsAuthenticated(true);
          return;
        } catch (e) {
          console.warn("Failed to parse dev_user from localStorage", e);
          localStorage.removeItem("dev_user");
          localStorage.removeItem("session_token");
        }
      }

      // No local user, try backend auth only
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) throw new Error("Not authenticated");

        const userData = await response.json();
        console.log("Backend auth successful:", userData);
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem("dev_user", JSON.stringify(userData));
      } catch (error) {
        console.log("Not authenticated:", error.message);
        setIsAuthenticated(false);
        localStorage.removeItem("dev_user");
        localStorage.removeItem("session_token");
      }
    };

    checkAuth();
  }, [location.pathname]); // Re-check on route change

  // Debug log whenever user changes
  useEffect(() => {
    if (user) {
      console.log("ProtectedRoute - user state:", user);
      console.log("ProtectedRoute - user_id:", user.user_id);
    }
  }, [user]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cit-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cit-navy mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render Navbar and child routes with user context
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <main className="flex-1">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}

export default ProtectedRoute;
