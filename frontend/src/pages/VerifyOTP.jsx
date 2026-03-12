import { useState } from "react";
import { apiRequest } from "../api";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await apiRequest("/auth/verify-otp", {
        method: "POST",
        body: { email, otp }
      });

      setMsg(res.message);

      navigate("/reset-password", { state: { email } });

    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div>
      <h2>Verify OTP</h2>

      <form onSubmit={handleSubmit}>
        <p>Email: {email}</p>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button type="submit">Verify OTP</button>
      </form>

      <p>{msg}</p>
    </div>
  );
}