import React, { useEffect, useState } from "react";
import HomePage from "./HomePage";
import AuthPage from "./AuthPage";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState(null); // null (home), 'login', or 'signup'
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/session`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser({ username: data.username });
        }
      } catch (e) {
        // no session, browse as guest
      } finally {
        setCheckingSession(false);
      }
    };

    loadSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (e) {
      console.error(e);
    }
    setUser(null);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setAuthView(null);
  };

  if (checkingSession) {
    return (
      <div className="spotify-splash">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="#fb790d">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.306c-.215.353-.674.464-1.027.249-2.812-1.718-6.353-2.106-10.523-1.153-.403.092-.806-.16-.898-.563-.092-.403.16-.806.563-.898 4.567-1.044 8.49-.607 11.636 1.338.353.215.464.674.249 1.027zm1.465-3.26c-.27.44-.848.578-1.288.308-3.219-1.978-8.127-2.55-11.935-1.393-.497.151-1.026-.135-1.177-.632-.151-.497.135-1.026.632-1.177 4.354-1.321 9.773-.679 13.46 1.586.44.27.578.848.308 1.288zm.126-3.41c-3.86-2.292-10.228-2.503-13.897-1.389-.593.18-1.22-.162-1.4-.755-.18-.593.162-1.22.755-1.4 4.218-1.281 11.246-1.036 15.688 1.6c.532.316.706 1.004.39 1.536-.316.532-1.004.706-1.536.39z"/>
        </svg>
      </div>
    );
  }

  // If user requested Login (Image 2) or Signup (Image 1)
  if (authView === "login" || authView === "signup") {
    return (
      <AuthPage
        mode={authView}
        onAuthSuccess={handleAuthSuccess}
        onNavigate={() => setAuthView(null)}
      />
    );
  }

  // Exact Spotify Home Page (Image 3)
  return (
    <div className="App">
      <HomePage
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setAuthView("login")}
        onOpenSignup={() => setAuthView("signup")}
      />
    </div>
  );
}

export default App;
