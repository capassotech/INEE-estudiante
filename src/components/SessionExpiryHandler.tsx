import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerSessionExpiredHandler } from "@/lib/apiClient";
import authService from "@/services/authService";

type SessionExpiryHandlerProps = {
  onSessionExpired: () => void;
};

/**
 * Registra el manejo global de 401. Debe montarse dentro de BrowserRouter y AuthProvider.
 */
const SessionExpiryHandler = ({ onSessionExpired }: SessionExpiryHandlerProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    registerSessionExpiredHandler(async () => {
      await authService.logout();
      onSessionExpired();
      navigate("/login", { replace: true });
    });
  }, [navigate, onSessionExpired]);

  return null;
};

export default SessionExpiryHandler;
