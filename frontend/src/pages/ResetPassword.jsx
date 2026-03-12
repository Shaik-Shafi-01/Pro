import { useState } from "react";
import { apiRequest } from "../api";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await apiRequest("/auth/reset-password", {
        method: "POST",
        body: { email, password }
      });

      setMsg(res.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <p>Email: {email}</p>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Reset Password</button>
      </form>

      <p>{msg}</p>
    </div>
  );
}