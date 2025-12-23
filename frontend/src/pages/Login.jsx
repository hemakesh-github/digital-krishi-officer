import { useState } from "react";
import LoginForm from "../components/LoginForm";
import { loginUser } from "../api_services/api_services";

export default function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (userId, password) => {
    setLoading(true);
    try {
      const response = await loginUser(userId, password);
      if (response.success) {
        onLoginSuccess(response);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
    setLoading(false);
  };

  return <LoginForm onLogin={handleLogin} />;
}
