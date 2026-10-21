
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const TokenHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      navigate("/");
      return;
    }

    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    navigate("/Problems", { replace: true });
  }, [navigate]);

  return <p>Signing you in...</p>;
};

export default TokenHandler;