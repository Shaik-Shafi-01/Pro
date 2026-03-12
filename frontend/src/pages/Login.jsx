import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section narrow">
      <div className="auth-card">
        <h2>Login</h2>
        <p>Access your orders, reservations, and account.</p>

        {error && <p className="alert error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Forgot Password Link */}
          <p className="muted" style={{ marginTop: "8px", marginBottom: "12px" }}>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>

          <button
            type="submit"
            className="btn btn-solid full-width"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <p className="muted">
          New user? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;