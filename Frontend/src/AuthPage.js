import { useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "", identifier: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
    const payload =
      mode === "register"
        ? { username: form.username, email: form.email, password: form.password }
        : { identifier: form.identifier, password: form.password };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Authentication failed.");
      } else {
        onAuthSuccess(data);
      }
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>
          Spoti<span style={{ color: 'var(--brand-accent)' }}>fix</span>
        </div>
        <h1>{mode === "login" ? "Log in to Spotifix" : "Sign up to start listening"}</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => updateField("username", e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
            </>
          )}

          {mode === "login" && (
            <input
              type="text"
              placeholder="Email or username"
              value={form.identifier}
              onChange={(e) => updateField("identifier", e.target.value)}
              required
            />
          )}

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
          />

          {error && <div className="auth-error-box" style={{ backgroundColor: 'rgba(226, 33, 52, 0.1)', padding: '12px', borderRadius: '4px' }}><p className="auth-error" style={{ margin: 0 }}>{error}</p></div>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
          </button>

          <button
            type="button"
            className="auth-toggle-link"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Don't have an account? Sign up for Spotifix" : "Already have an account? Log in here"}
          </button>
        </form>
      </div>
    </div>
  );
}