import { useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Course, Ebook, Evento, Recomendacion } from "@/types/types";
import Products from "@/components/Products";
import progressService from "@/services/progressService";
import recommendationService from "@/services/recommendationService";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { coursesAdapter, ebooksAdapter, eventosAdapter } from "@/hooks/dataAdapters";

const Index = () => {
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  // const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("formaciones");
  const [coursesProgress, setCoursesProgress] = useState<Map<string, number>>(new Map());
  
  // Estados para recomendaciones
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [isLoadingRecomendaciones, setIsLoadingRecomendaciones] = useState(false);

  // Hooks de paginación para cada tipo de dato
  const courses = usePaginatedData<Course>({
    fetchFunction: coursesAdapter,
    initialPageSize: 3,
    uid: user?.uid,
    activeTab,
    tabName: "formaciones",
    enabled: !authLoading,
  });

  const ebooks = usePaginatedData<Ebook>({
    fetchFunction: ebooksAdapter,
    initialPageSize: 3,
    uid: user?.uid,
    activeTab,
    tabName: "ebooks",
    enabled: !authLoading,
  });

  const eventos = usePaginatedData<Evento>({
    fetchFunction: eventosAdapter,
    initialPageSize: 3,
    uid: user?.uid,
    activeTab,
    tabName: "eventos",
    enabled: !authLoading,
  });

  // const banners = [
  //   "https://universidad.gruposuperior.com.co/wp-content/uploads/2021/05/BANNER-PROMOCIONAL-1.png",
  //   "https://alehlatam.org/wp-content/uploads/2024/12/BANNER-V-Curso-HCC.png",
  //   "https://calate.com.mx/wp-content/uploads/2024/02/banner-tuyo-cursoserigrafia-cursosublimacio-monterrey-2048x583-1.png",
  //   "https://cui.edu.ar/images/becas/promoverano_ed_bannerweb.jpg",
  // ];

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentBannerIndex((prev) =>
  //       prev === banners.length - 1 ? 0 : prev + 1
  //     );
  //   }, 4000);
  //   return () => clearInterval(interval);
  // }, [banners.length]);

  const loadCoursesProgress = useCallback(async (courseIds: string[]) => {
    if (!user?.uid || courseIds.length === 0) return;

    try {
      const progressPromises = courseIds.map(async (courseId) => {
        try {
          const key = `courseProgress_${user.uid}_${courseId}`;
          const saved = localStorage.getItem(key);
          if (saved) {
            const { progress, timestamp } = JSON.parse(saved);
            if (progress !== undefined && Date.now() - timestamp < 5 * 60 * 1000) {
              return { courseId, progress };
            }
          }
        } catch (error) {
          // Si hay error leyendo localStorage, continuar con el backend
        }

        try {
          const response = await progressService.obtenerProgresoCurso(courseId);
          if (response.success && response.data) {
            const progress = response.data.progreso_general || 0;
            return { courseId, progress };
          }
        } catch (error) {
          console.warn(`Error al cargar progreso del curso ${courseId}:`, error);
        }
        return { courseId, progress: 0 };
      });

      const results = await Promise.all(progressPromises);
      setCoursesProgress(prev => {
        const newMap = new Map(prev);
        results.forEach(({ courseId, progress }) => {
          newMap.set(courseId, progress);
        });
        return new Map(newMap);
      });
    } catch (error) {
      console.error("Error al cargar progreso de cursos:", error);
    }
  }, [user?.uid]);

  const loadRecomendaciones = useCallback(async () => {
    try {
      setIsLoadingRecomendaciones(true);
      const data = await recommendationService.getAll();
      if (data && data.recomendaciones) {
        setRecomendaciones(data.recomendaciones);
      } else {
        setRecomendaciones([]);
      }
    } catch (error) {
      console.error("❌ Error al cargar las recomendaciones:", error);
      setRecomendaciones([]);
    } finally {
      setIsLoadingRecomendaciones(false);
    }
  }, []);

  useEffect(() => {
    if (location.pathname === "/" && activeTab === "formaciones" && courses.data.length > 0 && user?.uid) {
      const courseIds = courses.data.map(c => c.id);
      loadCoursesProgress(courseIds);
    }
  }, [location.pathname, activeTab, courses.data, user?.uid, loadCoursesProgress]);

  useEffect(() => { if (activeTab === "info_general") loadRecomendaciones() }, [activeTab, loadRecomendaciones]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* OCULTADO HASTA QUE SE DEFINA QUE IMAGENES MOSTRAR */}
      {/* <div className="relative w-full overflow-hidden rounded-lg sm:rounded-xl shadow-lg mb-6 sm:mb-10">
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
      </div> */}

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

      <Products 
        // Cursos
        courses={courses.data}
        isLoadingCourses={courses.isLoading}
        currentPageCourses={courses.currentPage}
        totalPagesCourses={courses.totalPages}
        totalCountCourses={courses.totalCount}
        searchQueryCourses={courses.searchQuery}
        setSearchQueryCourses={courses.setSearchQuery}
        pageSizeCourses={courses.pageSize}
        handleSetPageSizeCourses={courses.setPageSize}
        goToPageCourses={courses.goToPage}
        // Ebooks
        ebooks={ebooks.data}
        isLoadingEbooks={ebooks.isLoading}
        currentPageEbooks={ebooks.currentPage}
        totalPagesEbooks={ebooks.totalPages}
        totalCountEbooks={ebooks.totalCount}
        searchQueryEbooks={ebooks.searchQuery}
        setSearchQueryEbooks={ebooks.setSearchQuery}
        pageSizeEbooks={ebooks.pageSize}
        handleSetPageSizeEbooks={ebooks.setPageSize}
        goToPageEbooks={ebooks.goToPage}
        // Eventos
        eventos={eventos.data}
        isLoadingEventos={eventos.isLoading}
        currentPageEventos={eventos.currentPage}
        totalPagesEventos={eventos.totalPages}
        totalCountEventos={eventos.totalCount}
        searchQueryEventos={eventos.searchQuery}
        setSearchQueryEventos={eventos.setSearchQuery}
        pageSizeEventos={eventos.pageSize}
        handleSetPageSizeEventos={eventos.setPageSize}
        goToPageEventos={eventos.goToPage}
        // Recomendaciones
        recomendaciones={recomendaciones}
        isLoadingRecomendaciones={isLoadingRecomendaciones}
        // Tab activa
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        coursesProgress={coursesProgress}
      />
      
    </div>
  );
};

export default Index;