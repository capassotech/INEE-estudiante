import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/ui/loader";

const AuthRedirectRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loader fullScreen size="lg" showText={true} />;
  }

  if (isAuthenticated && user.ruta_aprendizaje !== undefined) return <Navigate to="/perfil" replace />;
  if (isAuthenticated && user.ruta_aprendizaje === undefined) return <Navigate to="/test-vocacional" replace />;

  return <Outlet />;
};

export default AuthRedirectRoute;
