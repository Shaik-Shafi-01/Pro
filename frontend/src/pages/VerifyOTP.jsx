import { useState } from "react";
import { apiRequest } from "../api";

export default function VerifyOTP() {
  const [email, setEmail] = useState("");
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
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div>
      <h2>Verify OTP</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Enter OTP"
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button type="submit">Verify</button>
      </form>

      <p>{msg}</p>
    </div>
  );
}