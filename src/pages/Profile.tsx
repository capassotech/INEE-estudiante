import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2, LogOut, Crown, CheckCircle, Clock, Mail, CreditCard, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RutasAprendizajeModal from "@/components/RutasAprendizajeModal";
import { toast } from "sonner";
import { Membership } from "@/types/types";
import membershipService from "@/services/membershipService";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";

export default function Profile() {
  const { user, isLoading, refreshUser, updateRouteUser } = useAuth();
  const navigate = useNavigate();
  const [rutaAprendizaje, setRutaAprendizaje] = useState<string | null>(null);
  const [isLoadingRuta, setIsLoadingRuta] = useState(true);
  // const [membresia, setMembresia] = useState<Membership | null>(null);
  // const [isLoadingMembresia, setIsLoadingMembresia] = useState(false);
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

  // Funcionalidad de membresías deshabilitada temporalmente
  // useEffect(() => {
  //   if (user) {
  //     // Extraer el ID de membresía (puede ser string o objeto con id)
  //     let membresiaId: string | null = null;
  //     if (user.membresia) {
  //       if (typeof user.membresia === 'string') {
  //         membresiaId = user.membresia;
  //       } else if (typeof user.membresia === 'object' && user.membresia !== null && 'id' in user.membresia) {
  //         membresiaId = (user.membresia as any).id;
  //       }
  //     }

  //     if (membresiaId) {
  //       setIsLoadingMembresia(true);
  //       const fetchMembresia = async () => {
  //         try {
  //           const membresiaResult = await membershipService.getMembresia(membresiaId!);
  //           if (membresiaResult && membresiaResult.data) {
  //             setMembresia(membresiaResult.data);
  //           } else if (membresiaResult) {
  //             // Si la respuesta no tiene .data, usar directamente
  //             setMembresia(membresiaResult);
  //           }
  //         } catch (error) {
  //           console.error("Error al obtener membresía:", error);
  //           setMembresia(null);
  //         } finally {
  //           setIsLoadingMembresia(false);
  //         }
  //       };
  //       fetchMembresia();
  //     } else {
  //       setMembresia(null);
  //       setIsLoadingMembresia(false);
  //     }
  //   }
  // }, [user?.membresia, user]);

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
    return <Loader fullScreen size="lg" showText={true} />;
  }

  const getPerfilNombre = (ruta: string | null): string => {
    if (!ruta) return "No determinado";
    const rutas: { [key: string]: string } = {
      "consultoria": "Consultoría",
      "liderazgo": "Liderazgo",
      "emprendimiento": "Emprendimiento",
      "consultor-lider": "Consultor-Líder",
      "lider-emprendedor": "Líder-Emprendedor",
      "emprendedor-consultor": "Emprendedor-Consultor"
    };
    return rutas[ruta] || ruta;
  };

  return (
    <React.Fragment>
      <div className="fixed inset-0 bg-[#f4f2f0] -z-10" style={{ top: 0 }}></div>
      <div className="font-sans min-h-screen relative" style={{ backgroundColor: '#f4f2f0' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Mi Perfil
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gestiona tu información personal y preferencias
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Columna izquierda - Información principal */}
        <div className="space-y-6">
          {/* Tarjeta de información personal */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                  {user.nombre.charAt(0)}
                  {user.apellido.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                    {user.nombre} {user.apellido}
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CreditCard className="w-4 h-4" />
                      <span>DNI: {user.dni}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta de ruta de aprendizaje */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Ruta de Aprendizaje
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Tu perfil predominante de desarrollo profesional
                  </p>
                </div>
              </div>

              {isLoadingRuta ? (
                <div className="flex items-center justify-center gap-3 py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Cargando ruta de aprendizaje...
                  </p>
                </div>
              ) : rutaAprendizaje ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Perfil predominante
                        </p>
                        <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                          {getPerfilNombre(rutaAprendizaje)}
                        </p>
                      </div>
                      <BookOpen className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                    </div>
                  </div>
                  <Button 
                    onClick={() => setIsOpen(true)} 
                    variant="outline"
                    className="w-full border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    Cambiar mi ruta de aprendizaje
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 w-16 h-16 mx-auto flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      Aún no tienes una ruta asignada
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                      Completa el test vocacional para conocer tu perfil predominante
                    </p>
                    <Button
                      onClick={() => navigate("/test-vocacional")}
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                    >
                      Realizar test vocacional
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Funcionalidad de membresías deshabilitada temporalmente */}
        {/* Columna derecha - Membresía */}
        {/* <div className="lg:col-span-1">
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm sticky top-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Mi Membresía
                </h3>
              </div>
              
              {isLoadingMembresia ? ( 
                <div className="flex items-center justify-center gap-2 py-8">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Cargando...
                  </p>
                </div>
              ) : membresia !== null ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {membresia.nombre}
                      </h4>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        membresia.estado === 'activo' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {membresia.estado === 'activo' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {membresia.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      {membresia.descripcion}
                    </p>
                    <div className="text-xs text-slate-500 dark:text-slate-500 pt-3 border-t border-amber-200 dark:border-amber-800">
                      Fecha de alta: {new Date(membresia.fecha_alta).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 w-16 h-16 mx-auto flex items-center justify-center">
                    <Crown className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Sin membresía activa
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                      Explora nuestros planes y beneficios
                    </p>
                    <Button 
                      onClick={() => navigate("/membresias")} 
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm"
                    >
                      Explorar Membresías
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div> */}
        </div>
        </div>
        
        <RutasAprendizajeModal 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          perfilActual={rutaAprendizaje || user.ruta_aprendizaje || ''} 
          onSelectRoute={onSelectRoute} 
        />
      </div>
    </React.Fragment>
  );
}
