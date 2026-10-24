import React, { useState } from "react";
import "./AuthPage.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";

export default function AuthPage({ mode: initialMode = "login", onAuthSuccess, onNavigate }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupStep, setSignupStep] = useState(1);

  const handleSocialClick = (provider) => {
    // Social login is not yet implemented — show a message instead of faking authentication
    setError(`${provider} login is not yet available. Please use email/password.`);
  };

  const handleSignupNext = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSignupStep(2);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const autoUsername = username.trim() || email.split("@")[0] || "user" + Math.floor(Math.random() * 1000);

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: autoUsername,
          email: email.trim(),
          password: password
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setError(data.message || "User already exists. Please log in.");
        } else {
          setError(data.message || "Sign up failed. Please try again.");
        }
      } else {
        if (onAuthSuccess) onAuthSuccess(data);
      }
    } catch (err) {
      setError("Could not connect to backend server. Make sure port 8081 is active.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Incorrect username or password.");
      } else {
        if (onAuthSuccess) onAuthSuccess(data);
      }
    } catch (err) {
      setError("Could not reach backend on port 8081.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="spotify-auth-page">
      {/* Top Header Logo */}
      <header className="spotify-auth-header">
        <div 
          className="spotify-auth-logo" 
          onClick={() => onNavigate ? onNavigate("home") : null}
          title="Spotifix"
        >
          <img src="/logo.png" alt="Spotifix" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
        </div>
      </header>

      {/* Main Container */}
      <main className="spotify-auth-container">
        {mode === "signup" ? (
          /* ══════════ SIGN UP (Image 1 replica) ══════════ */
          <div className="spotify-auth-card">
            <h1 className="spotify-auth-title">Sign up to<br />start listening</h1>

            {signupStep === 1 ? (
              <form onSubmit={handleSignupNext} className="spotify-auth-form">
                <div className="spotify-input-group">
                  <label className="spotify-input-label">Email address</label>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="spotify-input"
                    autoFocus
                  />
                </div>

                {error && <div className="spotify-auth-error">{error}</div>}

                <button type="submit" className="spotify-btn-cyan">
                  Next
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="spotify-auth-form">
                <div className="spotify-input-group">
                  <label className="spotify-input-label">Email address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="spotify-input spotify-input-disabled"
                  />
                </div>

                <div className="spotify-input-group">
                  <label className="spotify-input-label">Create a username</label>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="spotify-input"
                    autoFocus
                  />
                </div>

                <div className="spotify-input-group">
                  <label className="spotify-input-label">Create a password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="spotify-input"
                  />
                </div>

                {error && <div className="spotify-auth-error">{error}</div>}

                <button type="submit" className="spotify-btn-cyan" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </button>

                <button 
                  type="button" 
                  className="spotify-back-link" 
                  onClick={() => setSignupStep(1)}
                >
                  ← Edit email address
                </button>
              </form>
            )}

            <div className="spotify-divider">
              <span>or</span>
            </div>

            {/* Social Buttons */}
            <div className="spotify-social-group">
              <button 
                type="button" 
                className="spotify-social-btn" 
                onClick={() => handleSocialClick("Google")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign up with Google</span>
              </button>

              <button 
                type="button" 
                className="spotify-social-btn" 
                onClick={() => handleSocialClick("Apple")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 0.93-2.84-.9.04-1.98.6-2.62 1.34-.56.63-.99 1.68-.86 2.7.99.08 2.03-.5 2.55-1.2z"/>
                </svg>
                <span>Sign up with Apple</span>
              </button>
            </div>

            <div className="spotify-auth-footer">
              <span>Already have an account? </span>
              <button 
                type="button" 
                className="spotify-link" 
                onClick={() => { setMode("login"); setError(""); }}
              >
                Log in here.
              </button>
            </div>
          </div>
        ) : (
          /* ══════════ LOG IN (Image 2 replica) ══════════ */
          <div className="spotify-auth-card">
            <h1 className="spotify-auth-title">Welcome back</h1>

            <form onSubmit={handleLoginSubmit} className="spotify-auth-form">
              <div className="spotify-input-group">
                <label className="spotify-input-label">Email or username</label>
                <input
                  type="text"
                  placeholder="Email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="spotify-input"
                  autoFocus
                />
              </div>

              <div className="spotify-input-group">
                <label className="spotify-input-label">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="spotify-input"
                />
              </div>

              {error && <div className="spotify-auth-error">{error}</div>}

              <button type="submit" className="spotify-btn-cyan" disabled={loading}>
                {loading ? "Logging in..." : "Continue"}
              </button>
            </form>

            <div className="spotify-divider">
              <span>or</span>
            </div>

            {/* Social Buttons */}
            <div className="spotify-social-group">
              <button 
                type="button" 
                className="spotify-social-btn" 
                onClick={() => handleSocialClick("Google")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button 
                type="button" 
                className="spotify-social-btn" 
                onClick={() => handleSocialClick("Facebook")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Continue with Facebook</span>
              </button>

              <button 
                type="button" 
                className="spotify-social-btn" 
                onClick={() => handleSocialClick("Apple")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 0.93-2.84-.9.04-1.98.6-2.62 1.34-.56.63-.99 1.68-.86 2.7.99.08 2.03-.5 2.55-1.2z"/>
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            <div className="spotify-auth-footer">
              <span>Don't have an account? </span>
              <button 
                type="button" 
                className="spotify-link" 
                onClick={() => { setMode("signup"); setError(""); setSignupStep(1); }}
              >
                Sign up for Spotifix.
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
