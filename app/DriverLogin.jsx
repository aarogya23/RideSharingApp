import React, { useState } from "react";

export default function DriverLogin() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [driver, setDriver] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDriver(null);

    // client-side validation
    if (!usernameOrEmail.trim()) {
      setError("Username or email is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8084/api/driver/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usernameOrEmail: usernameOrEmail.trim(), password }),
      });

      if (!res.ok) {
        // backend sometimes returns plain text error message
        const text = await res.text();
        setError(text || `Login failed (status ${res.status})`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      // expected response structure:
      // { message: "Login successful", driver: { ... } }
      setDriver(data.driver || data);
      setLoading(false);
    } catch (err) {
      console.error("Login error:", err);
      setError("Network or server error. Check backend is running.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Driver Login</h2>

        <label style={styles.label}>Username or Email</label>
        <input
          style={styles.input}
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          placeholder="username or email"
          autoComplete="username"
        />

        <label style={styles.label}>Password</label>
        <div style={styles.passwordRow}>
          <input
            style={{ ...styles.input, marginRight: 8 }}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            style={styles.toggleBtn}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" style={styles.submit} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {driver && (
          <div style={styles.success}>
            <strong>Login successful — driver info:</strong>
            <pre style={styles.pre}>{JSON.stringify(driver, null, 2)}</pre>
          </div>
        )}
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f3f4f6",
    padding: 20,
  },
  card: {
    width: 420,
    maxWidth: "95%",
    padding: 20,
    borderRadius: 8,
    background: "#fff",
    boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
  },
  title: { margin: 0, marginBottom: 16, fontSize: 20, textAlign: "center" },
  label: { fontSize: 13, marginBottom: 6, marginTop: 8 },
  input: {
    padding: "10px 12px",
    fontSize: 14,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    outline: "none",
  },
  passwordRow: { display: "flex", alignItems: "center", marginBottom: 8 },
  toggleBtn: {
    padding: "8px 10px",
    fontSize: 13,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
  },
  submit: {
    marginTop: 12,
    padding: "10px 12px",
    fontSize: 15,
    borderRadius: 6,
    border: "none",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
  error: {
    marginTop: 10,
    color: "#b91c1c",
    background: "#fee2e2",
    padding: 8,
    borderRadius: 6,
    fontSize: 13,
  },
  success: {
    marginTop: 12,
    color: "#064e3b",
    background: "#ecfdf5",
    padding: 12,
    borderRadius: 6,
    fontSize: 13,
  },
  pre: {
    marginTop: 8,
    background: "#f9fafb",
    padding: 8,
    borderRadius: 6,
    overflowX: "auto",
  },
};
