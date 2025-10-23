import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RutasAprendizajeModal from "@/components/RutasAprendizajeModal";
import { toast } from "sonner";

export default function Profile() {
  const { user, isLoading, refreshUser, updateRouteUser } = useAuth();
  const navigate = useNavigate();
  const [rutaAprendizaje, setRutaAprendizaje] = useState<string | null>(null);
  const [isLoadingRuta, setIsLoadingRuta] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.ruta_aprendizaje) {
        setRutaAprendizaje(user.ruta_aprendizaje);
        setIsLoadingRuta(false);
      } else {
        const timeout = setTimeout(() => {
          setIsLoadingRuta(false);
        }, 1000);

        return () => clearTimeout(timeout);
      }
    }
  }, [user?.ruta_aprendizaje, user]);

  useEffect(() => {
    const handleFocus = async () => {
      if (!rutaAprendizaje && user && refreshUser) {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Error al refrescar usuario:', error);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [rutaAprendizaje, user, refreshUser]);


  const onSelectRoute = async (routeName: string) => {
    setRutaAprendizaje(routeName);
    toast.success("Ruta de aprendizaje actualizada correctamente");
    await updateRouteUser(routeName);
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="font-sans container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 min-h-screen text-[#4B4B4C]">
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="self-start sm:mt-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="">
          <h1 className="text-3xl font-bold tracking-wide text-black dark:text-white">
            Perfil
          </h1>
          <p className="text-base text-[#4B4B4C] dark:text-zinc-300 mt-1">
            Información personal y edición de tu cuenta.
          </p>
        </div>
      </div>

      <section className=" rounded-xl shadow-lg p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[#8B3740] flex items-center justify-center text-white text-xl font-bold">
            {user.nombre.charAt(0)}
            {user.apellido.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#8B3740] dark:text-white">
              {user.nombre} {user.apellido}
            </h2>
            <p className="text-sm text-[#4B4B4C] dark:text-zinc-300">
              {user.email}
            </p>
            <p className="text-sm text-[#4B4B4C] dark:text-zinc-300">
              DNI: {user.dni}
            </p>
            {isLoadingRuta ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                <p className="text-sm text-gray-400 dark:text-zinc-500">
                  Cargando ruta de aprendizaje...
                </p>
              </div>
            ) : rutaAprendizaje ? (
              <p className="bg-gradient-to-r bg-clip-text text-transparent from-zinc-800/80 to-primary font-semibold dark:text-zinc-300">
                Ruta de aprendizaje: <span className="text-primary">{rutaAprendizaje}</span>
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-400 dark:text-zinc-500 italic">
                  Completa el test vocacional para conocer tu ruta de aprendizaje
                </p>
                <Button
                  onClick={async () => {
                    setIsLoadingRuta(true);
                    try {
                      await refreshUser();
                    } catch (error) {
                      console.error('Error al refrescar:', error);
                    } finally {
                      setTimeout(() => setIsLoadingRuta(false), 1000);
                    }
                  }}
                  size="sm"
                  variant="outline"
                  className="text-xs px-3 py-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Refrescar datos
                </Button>
              </div>
            )}
            <Button 
              onClick={() => setIsOpen(true)} 
              size="sm" 
              variant="outline" 
              className="text-xs px-3 border-gray-300 mt-1"
              >
                Ver mas formaciones
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4B4B4C] dark:text-zinc-200">
              Nombre completo
            </label>
            <input
              type="text"
              disabled
              defaultValue={`${user.nombre} ${user.apellido}`}
              className="mt-1 w-full border border-[#D8D3CA] dark:text-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#D8A848]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4B4B4C] dark:text-zinc-200">
              Correo electrónico
            </label>
            <input
              type="email"
              disabled
              defaultValue={user.email}
              className="mt-1 w-full border border-[#D8D3CA] dark:text-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#D8A848]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            className="px-6 py-3 bg-[#8B3740] dark:bg-zinc-700 text-white rounded-lg hover:bg-[#D8A848] transition-colors font-medium"
          >
            Guardar cambios
          </Button>
        </div>
      </section>
      <RutasAprendizajeModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        perfilActual={user.ruta_aprendizaje || ''} 
        onSelectRoute={onSelectRoute} 
      />
    </div>
  );
}
