import { useState, useEffect } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import React from "react";
import TeacherNavbar from "./TeacherNavbar";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function TeacherProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check for dev user first
    const devUserRaw = localStorage.getItem("dev_user");
    if (devUserRaw) {
      try {
        const devUser = JSON.parse(devUserRaw);
        if (devUser.role === "teacher") {
          setUser(devUser);
          setIsAuthenticated(true);
          return;
        }
      } catch (e) {
        console.warn("Failed to parse dev_user", e);
      }
    }

    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) throw new Error("Not authenticated");

        const userData = await response.json();
        
        // Check if user has teacher role
        if (userData.role !== "teacher") {
          setIsAuthenticated(false);
          return;
        }
        
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Teacher Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ message: "Teacher access required" }} replace />;
  }

  return children
    ? React.cloneElement(children, { user })
    : <Outlet context={{ user }} />;
}

// Layout wrapper for teacher pages
export function TeacherLayout({ user }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TeacherNavbar user={user} />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}

export default TeacherProtectedRoute;
