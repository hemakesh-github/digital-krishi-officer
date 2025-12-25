import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../api_services/api_services";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LogoutModal from "../components/LogoutModal";

export default function Logout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const handleCancel = () => {
    setOpen(false);
    navigate(-1);
  };
  const handleLogout = async () => {
    await logoutUser();
    navigate("/login", { replace: true });
  };
  return (
    <div className="min-h-screen w-screen flex flex-col bg-black bg-opacity-80 justify-center items-center">
      <LogoutModal open={open} onCancel={handleCancel} onLogout={handleLogout} />
    </div>
  );
}
