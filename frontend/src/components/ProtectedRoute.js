import { useState, useEffect } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import React from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    useLocation().state?.user ? true : null
  );
  const [user, setUser] = useState(useLocation().state?.user || null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.user) return;

    // First, check for a local dev user (static MVP flow)
    const devUserRaw = localStorage.getItem("dev_user");
    if (devUserRaw) {
      try {
        const devUser = JSON.parse(devUserRaw);
        setUser(devUser);
        setIsAuthenticated(true);

        // Create a mock session for API calls
        const mockSession = `dev_session_${btoa(
          JSON.stringify(devUser)
        ).substring(0, 24)}`;
        localStorage.setItem("session_token", mockSession);

        return;
      } catch (e) {
        // fall through to backend check
        console.warn("Failed to parse dev_user from localStorage", e);
      }
    }

    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) throw new Error("Not authenticated");

        const userData = await response.json();
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [location]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children
    ? React.cloneElement(children, { user })
    : React.cloneElement(<Outlet />, { user });
}

export default ProtectedRoute;
