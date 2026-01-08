import { useState, useEffect } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import React from "react";
import TeacherNavbar from "./TeacherNavbar";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Layout component for teacher pages
const TeacherLayout = ({ user }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <TeacherNavbar user={user} />
      <main className="flex-1">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
};

function TeacherRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    useLocation().state?.user ? true : null
  );
  const [user, setUser] = useState(useLocation().state?.user || null);
  const [isTeacher, setIsTeacher] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.user) {
      setIsTeacher(location.state.user.role === 'teacher');
      return;
    }

    // Check for dev user
    const devUserRaw = localStorage.getItem("dev_user");
    if (devUserRaw) {
      try {
        const devUser = JSON.parse(devUserRaw);
        setUser(devUser);
        setIsAuthenticated(true);
        setIsTeacher(devUser.role === 'teacher');
        return;
      } catch (e) {
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
        setIsTeacher(userData.role === 'teacher');
      } catch (error) {
        setIsAuthenticated(false);
        setIsTeacher(false);
      }
    };

    checkAuth();
  }, [location]);

  // Loading state
  if (isAuthenticated === null || isTeacher === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cit-navy"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Not a teacher
  if (!isTeacher) {
    return <Navigate to="/community" replace />;
  }

  return children
    ? React.cloneElement(children, { user })
    : <TeacherLayout user={user} />;
}

export default TeacherRoute;
