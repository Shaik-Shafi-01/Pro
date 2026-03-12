import { useState } from "react";
import { apiRequest } from "../api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: { email }
      });

      setMsg(res.message || "OTP sent to email");

      navigate("/verify-otp", { state: { email } });

    } catch (err) {
      setMsg(err.message || "Something went wrong");
    }
  };

  return (
    <div className="container section narrow">
      <div className="auth-card">
        <h2>Forgot Password</h2>

        {msg && <p className="alert">{msg}</p>}

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-solid full-width">
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
}