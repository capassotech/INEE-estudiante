import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import userService from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { Course } from "@/types/types";

const Index = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const banners = [
    "https://universidad.gruposuperior.com.co/wp-content/uploads/2021/05/BANNER-PROMOCIONAL-1.png",
    "https://alehlatam.org/wp-content/uploads/2024/12/BANNER-V-Curso-HCC.png",
    "https://calate.com.mx/wp-content/uploads/2024/02/banner-tuyo-cursoserigrafia-cursosublimacio-monterrey-2048x583-1.png",
    "https://cui.edu.ar/images/becas/promoverano_ed_bannerweb.jpg",
  ];

  // Carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await userService.getCoursesPerUser(user.uid);
        setCourses(courses);
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [user.uid]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Carrusel de banners */}
      <div className="relative w-full overflow-hidden rounded-lg sm:rounded-xl shadow-lg mb-6 sm:mb-10">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img
                src={banner.trim() || "/placeholder.svg?height=200&width=800&query=course banner"}
                alt={`Banner ${index + 1}`}
                className="w-full h-32 sm:h-48 md:h-56 lg:h-64 object-cover"
              />
            </div>
          ))}
        </div>
        {/* Puntos de navegación */}
        <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center space-x-1 sm:space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentBannerIndex ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setCurrentBannerIndex(index)}
              aria-label={`Ir a banner ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Logo */}
      <div className="text-center mt-4">
        <div className="rounded-lg flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-32 sm:w-40 md:w-52 block dark:hidden"
          />
          <img
            src="/logo-blanco.png"
            alt="Logo blanco"
            className="w-32 sm:w-40 md:w-52 hidden dark:block"
          />
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 ml-1">
          Mis formaciones
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                Aún no tienes cursos activos. Cuando adquieras una formación, aparecerá aquí.
              </p>
            </div>
          ) : (
            courses.map((course) => (
              <Card
                key={course.id}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/curso/${course.id}`)}
              >
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  <div className="w-full sm:w-1/3 h-40 sm:h-32 md:h-40 relative overflow-hidden flex-shrink-0">
                    <img
                      src={course.imagen || "/placeholder.svg?height=160&width=240&query=course image"}
                      alt={course.titulo}
                      className="object-cover w-full h-full transition-transform hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                    <div className="mb-3 sm:mb-4">
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 break-words">
                        {course.titulo}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 break-words">
                        {course.descripcion}
                      </p>
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full whitespace-nowrap">
                            {course.nivel}
                          </span>
                          <span className="text-xs whitespace-nowrap">
                            {course.id_modulos.length} módulos
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 self-end sm:self-center" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <a
        href="https://inee-beta.web.app/formaciones"
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Card className="bg-primary hover:bg-primary/90 border-2 border-primary text-white dark:bg-primary dark:hover:bg-primary/90 dark:border-primary transition-colors duration-300">
          <CardHeader className="text-center py-6 sm:py-8">
            <h3 className="text-lg sm:text-xl font-bold">
              Adquirir más formaciones
            </h3>
            <p className="text-white/80 mt-2 text-sm sm:text-base">
              Explora nuestra plataforma de formaciones completas
            </p>
          </CardHeader>
        </Card>
      </a>
    </div>
  );
};

export default Index;