import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/ui/loader";

const AuthRedirectRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loader fullScreen size="lg" showText={true} />;
  }

  // Si el usuario tiene ruta_aprendizaje (no es undefined ni null), redirigir a perfil
  if (isAuthenticated && user && user.ruta_aprendizaje !== undefined && user.ruta_aprendizaje !== null) {
    return <Navigate to="/perfil" replace />;
  }
  // Si el usuario no tiene ruta_aprendizaje, redirigir a test vocacional
  // (solo para rutas de login/registro, las rutas protegidas manejan esto en ProtectedRoute)
  if (isAuthenticated && user && (user.ruta_aprendizaje === undefined || user.ruta_aprendizaje === null)) {
    return <Navigate to="/test-vocacional" replace />;
  }

  return <Outlet />;
};

export default AuthRedirectRoute;
