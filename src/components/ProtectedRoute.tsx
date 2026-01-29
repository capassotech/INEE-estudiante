import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/ui/loader";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen size="lg" showText={true} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirigir a test vocacional si el usuario no tiene ruta_aprendizaje
  // pero solo si no está ya en la página de test vocacional
  // Verificar tanto undefined como null para cubrir todos los casos
  if (isAuthenticated && user && (user.ruta_aprendizaje === undefined || user.ruta_aprendizaje === null) && location.pathname !== "/test-vocacional") {
    return <Navigate to="/test-vocacional" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;


