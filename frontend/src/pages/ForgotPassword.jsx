import { useState } from "react";
import { apiRequest } from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: { email }
      });

      setMsg(res.message || "OTP sent to email");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Send OTP</button>
      </form>

      <p>{msg}</p>
    </div>
  );
}