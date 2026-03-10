import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Circle, Pencil } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import userService from "@/services/userService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const rutasAprendizajeData = [
  {
    id: 1,
    nombre: "CONSULTORÍA",
    route_name: "consultoria",
    descripcion:
      "Desarrolla habilidades analíticas y estratégicas para resolver problemas complejos en organizaciones. Aprende a diagnosticar situaciones, proponer soluciones y generar valor como un asesor experto.",
    color: "bg-white",
    textColor: "text-gray-700",
  },
  {
    id: 2,
    nombre: "EMPRENDIMIENTO",
    route_name: "emprendimiento",
    descripcion:
      "Convierte ideas en negocios reales. Aprende a identificar oportunidades, validar modelos de negocio, gestionar recursos y construir proyectos innovadores desde cero.",
    color: "bg-white",
    textColor: "text-gray-700",
  },
  {
    id: 3,
    nombre: "LIDERAZGO",
    route_name: "liderazgo",
    descripcion:
      "Fortalece tu capacidad para inspirar, motivar y guiar equipos hacia el éxito. Domina la gestión de personas, la toma de decisiones y la creación de ambientes de alto rendimiento.",
    color: "bg-white",
    textColor: "text-gray-700",
  },
  {
    id: 4,
    nombre: "LÍDER-EMPRENDEDOR",
    route_name: "lider-emprendedor",
    descripcion:
      "Aprende a construir y escalar equipos mientras desarrollas tu propia visión empresarial. Ideal para quienes quieren liderar su propio proyecto con una mentalidad innovadora y orientada al crecimiento.",
    color: "bg-white",
    textColor: "text-gray-700",
  },
  {
    id: 5,
    nombre: "CONSULTOR-LÍDER",
    route_name: "consultor-lider",
    descripcion:
      "Combina expertise técnico con habilidades de gestión. Lidera proyectos de consultoría mientras diriges equipos multidisciplinarios y generas impacto estratégico en las organizaciones.",
    color: "bg-white",
    textColor: "text-gray-700",
  },
  {
    id: 6,
    nombre: "EMPRENDEDOR-CONSULTOR",
    route_name: "emprendedor-consultor",
    descripcion:
      "Desarrolla negocios propios mientras ofreces tu expertise como asesor independiente. Combina la autonomía del emprendimiento con la versatilidad de la consultoría freelance o corporativa.",
    color: "bg-white",
    textColor: "text-gray-700",
  },
];

const getPerfilNombre = (routeName: string | null | undefined): string => {
  if (!routeName) return "Sin definir";
  const ruta = rutasAprendizajeData.find((r) => r.route_name === routeName);
  return ruta ? ruta.nombre : routeName;
};

const Profile = () => {
  const { user, firebaseUser, isLoading, refreshUser, updateRouteUser } = useAuth();
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para el modal de edición de perfil
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Preseleccionar la ruta actual del usuario
  useEffect(() => {
    if (user?.ruta_aprendizaje) {
      const currentRoute = rutasAprendizajeData.find((r) => r.route_name === user.ruta_aprendizaje);
      if (currentRoute) {
        setSelectedRoute(currentRoute.id);
      }
    }
  }, [user?.ruta_aprendizaje]);

  const handleSelectRoute = async (routeId: number) => {
    if (routeId === selectedRoute) return;

    const route = rutasAprendizajeData.find((r) => r.id === routeId);
    if (!route || !user?.uid) return;

    setIsUpdating(true);
    try {
      await updateRouteUser(route.route_name);
      await refreshUser();
      setSelectedRoute(routeId);
      toast.success(`Ruta de aprendizaje actualizada a ${route.nombre}`);
    } catch (error) {
      console.error("Error al actualizar la ruta:", error);
      toast.error("Error al actualizar la ruta de aprendizaje");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenEditProfileModal = () => {
    if (user) {
      setEditFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        dni: user.dni,
      });
    }
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    if (user) {
      setEditFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        dni: user.dni,
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setIsSavingProfile(true);
      await userService.updateUserProfile(user.uid, editFormData);
      if (refreshUser) {
        await refreshUser();
      }
      toast.success("Perfil actualizado correctamente");
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#9B4C5C]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const perfilNombre = getPerfilNombre(user.ruta_aprendizaje);

  const getInitials = () => {
    const firstInitial = user.nombre?.charAt(0) || "";
    const lastInitial = user.apellido?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header con foto de perfil, nombre y perfil predominante */}
        <div className="bg-[#f4f2f0] rounded-t-[4rem] shadow-2xl overflow-hidden mb-8">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              {/* Foto de perfil */}
              <div className="relative">
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-8 border-[#9B4C5C] bg-gradient-to-br from-blue-100 to-purple-100">
                  {firebaseUser?.photoURL ? (
                    <img
                      src={firebaseUser.photoURL}
                      alt={`${user.nombre} ${user.apellido}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-gray-600">
                      {getInitials()}
                    </div>
                  )}
                </div>
              </div>

              {/* Información del usuario */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="ml-7 flex flex-col md:flex-row md:items-center md:gap-4">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-semibold text-gray-700">
                      {user.nombre} {user.apellido}
                    </h1>
                    <p className="text-xl text-gray-700 font-semibold">{user.email}</p>
                  </div>
                  <button
                    onClick={handleOpenEditProfileModal}
                    className="cursor-pointer mt-2 md:mt-0 p-2 rounded-full hover:bg-gray-200 hover:bg-opacity-50 transition-colors self-start md:self-center"
                    aria-label="Editar perfil"
                  >
                    <Pencil size={32} className="text-[#9B4C5C]" />
                  </button>
                </div>

                <div className="space-y-2 bg-white py-5 pr-5 rounded-lg ml-[-50px]">
                  <p className="text-sm text-gray-600 px-20">
                    <span className="font-semibold">Ruta de aprendizaje:</span> Tu perfil predominante de desarrollo personal
                  </p>

                  {/* Banner del perfil predominante */}
                  <div className="bg-[#9B4C5C] text-white py-2 px-6 rounded-lg shadow-lg">
                    <p className="text-base md:text-lg font-bold uppercase tracking-wide px-14">
                      PERFIL PREDOMINANTE {perfilNombre.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/test-vocacional")}
            className="text-[#9B4C5C] hover:text-[#7C3D4C] text-lg transition-all duration-150 border-y-2 border-y-[#edeae6] py-2 w-full hover:bg-white/60"
          >
            Consultar mi ruta de aprendizaje
          </button>
        </div>

        <Link
          to="/"
          rel="noopener noreferrer"
          className="block"
        >
          <button
            type="button"
            className="bg-[#f4f2f0] w-full text-center hover:scale-105 transition-all duration-150 rounded-lg shadow-md py-3 px-8"
          >
            <h2 className="text-2xl font-bold text-center uppercase tracking-wide text-[#9B4C5C]">
              VER MIS FORMACIONES
            </h2>
          </button>
        </Link>

        {/* Sección de Rutas de Aprendizaje */}
        <div className="mt-12 bg-[#f4f2f0] w-[70%] mx-auto rounded-xl shadow-xl overflow-hidden p-8">
          <div className="text-center mb-6 flex flex-col items-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-700">
              RUTAS DE APRENDIZAJE
            </h2>
            <p className="text-lg text-gray-600 mb-1">
              Selecciona tu nueva ruta predominante
            </p>
            <p className="text-sm text-[#9B4C5C] font-semibold bg-white py-1 px-2 rounded-full w-fit">
              Perfil actual: {perfilNombre.toUpperCase()}
            </p>
          </div>

          {isUpdating && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-[#9B4C5C]" />
              <span className="ml-2 text-gray-600">Actualizando ruta...</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rutasAprendizajeData.map((ruta) => {
              const isActual = user?.ruta_aprendizaje === ruta.route_name;
              const isSelected = selectedRoute === ruta.id;

              return (
                <Card
                  key={ruta.id}
                  className={`cursor-pointer transition-all duration-200 border-2 ${
                    ruta.color
                  } ${
                    isSelected
                      ? "bg-[#9B4C5C] shadow-2xl scale-[1.02]"
                      : "border-gray-300 hover:border-[#9B4C5C] hover:shadow-lg"
                  } ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() => handleSelectRoute(ruta.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle
                        className={`text-base md:text-lg font-bold ${ruta.textColor} ${isSelected ? "text-zinc-100" : ""}`}
                      >
                        {ruta.nombre}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {isActual && (
                          <Badge className="text-yellow-300/70 text-sm bg-transparent font-thin">
                            Actual
                          </Badge>
                        )}
                        <Circle
                          className={`h-6 w-6 flex-shrink-0 ${
                            isSelected
                              ? "fill-yellow-300/70 text-yellow-400"
                              : ruta.color === "bg-white"
                              ? "text-gray-400"
                              : "text-white/50"
                          }`}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className={`text-sm leading-relaxed ${isSelected ? "text-zinc-100" : ""}`}>
                      {ruta.descripcion}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        formData={editFormData}
        setFormData={setEditFormData}
        onSave={handleSaveProfile}
        isSaving={isSavingProfile}
      />
    </div>
  );
};

const EditProfileModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
  isSaving,
} : {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    nombre: string;
    apellido: string;
    dni: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      nombre: string;
      apellido: string;
      email: string;
      dni: string;
    }>
  >;
  onSave: () => void;
  isSaving: boolean;
}) => {
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu información personal. Los cambios se guardarán en tu cuenta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nombre
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B4C5C] dark:bg-slate-800 dark:text-white"
              placeholder="Tu nombre"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Apellido
            </label>
            <input
              type="text"
              value={formData.apellido}
              onChange={(e) => handleInputChange("apellido", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B4C5C] dark:bg-slate-800 dark:text-white"
              placeholder="Tu apellido"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              DNI
            </label>
            <input
              type="text"
              value={formData.dni}
              onChange={(e) => handleInputChange("dni", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B4C5C] dark:bg-slate-800 dark:text-white"
              placeholder="Tu DNI"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="min-w-[100px]"
          >
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="min-w-[100px] bg-[#9B4C5C] hover:bg-[#7C3D4C]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Profile;
