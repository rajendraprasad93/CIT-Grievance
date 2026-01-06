import { useEffect, useState, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthCallback from "@/components/AuthCallback";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import CommunityFeed from "@/pages/CommunityFeed";
import IssueList from "@/pages/IssueList";
import IssueDetail from "@/pages/IssueDetail";
import Opportunities from "@/pages/Opportunities";
import OpportunityDetail from "@/pages/OpportunityDetail";
import ReportIssue from "@/pages/ReportIssue";
import Profile from "@/pages/Profile";

// Create a context to pass user to all pages
const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

// Layout component that renders Navbar + page content
const ProtectedLayout = ({ user }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar user={user} />
    <main className="flex-1">
      <Outlet context={{ user }} />
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth-callback" element={<AuthCallback />} />

          {/* Protected Routes with Navbar */}
          <Route
            element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/community" element={<CommunityFeed />} />
            <Route path="/issues" element={<IssueList />} />
            <Route path="/issues/:issueId" element={<IssueDetail />} />
            <Route path="/report-issue" element={<ReportIssue />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route
              path="/opportunities/:oppId"
              element={<OpportunityDetail />}
            />
            <Route path="/profile/:userId" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
