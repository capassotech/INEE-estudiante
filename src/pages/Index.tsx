import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import userService from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { Course, Ebook, Evento } from "@/types/types";
import Products from "@/components/Products";
import progressService from "@/services/progressService";

const Index = () => {
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const isInitialMount = useRef(true);

  // Estados para cursos
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [currentPageCourses, setCurrentPageCourses] = useState(1);
  const [pageSizeCourses, setPageSizeCourses] = useState(3);
  const [totalPagesCourses, setTotalPagesCourses] = useState(1);
  const [totalCountCourses, setTotalCountCourses] = useState(0);
  const [pageHistoryCourses, setPageHistoryCourses] = useState<Map<number, string | null>>(new Map([[1, null]]));
  const pageHistoryCoursesRef = useRef<Map<number, string | null>>(new Map([[1, null]]));
  const [searchQueryCourses, setSearchQueryCourses] = useState("");
  const [coursesProgress, setCoursesProgress] = useState<Map<string, number>>(new Map());

  // Estados para ebooks
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [isLoadingEbooks, setIsLoadingEbooks] = useState(false);
  const [currentPageEbooks, setCurrentPageEbooks] = useState(1);
  const [pageSizeEbooks, setPageSizeEbooks] = useState(3);
  const [totalPagesEbooks, setTotalPagesEbooks] = useState(1);
  const [totalCountEbooks, setTotalCountEbooks] = useState(0);
  const [pageHistoryEbooks, setPageHistoryEbooks] = useState<Map<number, string | null>>(new Map([[1, null]]));
  const pageHistoryEbooksRef = useRef<Map<number, string | null>>(new Map([[1, null]]));
  const [searchQueryEbooks, setSearchQueryEbooks] = useState("");

  // Estados para eventos
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoadingEventos, setIsLoadingEventos] = useState(false);
  const [currentPageEventos, setCurrentPageEventos] = useState(1);
  const [pageSizeEventos, setPageSizeEventos] = useState(3);
  const [totalPagesEventos, setTotalPagesEventos] = useState(1);
  const [totalCountEventos, setTotalCountEventos] = useState(0);
  const [pageHistoryEventos, setPageHistoryEventos] = useState<Map<number, string | null>>(new Map([[1, null]]));
  const pageHistoryEventosRef = useRef<Map<number, string | null>>(new Map([[1, null]]));
  const [searchQueryEventos, setSearchQueryEventos] = useState("");

  // Tab activa
  const [activeTab, setActiveTab] = useState("formaciones");
  
  useEffect(() => { pageHistoryCoursesRef.current = pageHistoryCourses }, [pageHistoryCourses]);
  useEffect(() => { pageHistoryEbooksRef.current = pageHistoryEbooks }, [pageHistoryEbooks]);
  useEffect(() => { pageHistoryEventosRef.current = pageHistoryEventos }, [pageHistoryEventos]);

  const banners = [
    "https://universidad.gruposuperior.com.co/wp-content/uploads/2021/05/BANNER-PROMOCIONAL-1.png",
    "https://alehlatam.org/wp-content/uploads/2024/12/BANNER-V-Curso-HCC.png",
    "https://calate.com.mx/wp-content/uploads/2024/02/banner-tuyo-cursoserigrafia-cursosublimacio-monterrey-2048x583-1.png",
    "https://cui.edu.ar/images/becas/promoverano_ed_bannerweb.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Función para cargar el progreso de múltiples cursos
  const loadCoursesProgress = useCallback(async (courseIds: string[]) => {
    if (!user?.uid || courseIds.length === 0) return;

    try {
      const progressPromises = courseIds.map(async (courseId) => {
        // Primero intentar obtener el progreso desde localStorage (calculado en CourseDetail)
        // Usar clave con userId para que sea específico por usuario
        try {
          const key = `courseProgress_${user.uid}_${courseId}`;
          const saved = localStorage.getItem(key);
          if (saved) {
            const { progress, timestamp } = JSON.parse(saved);
            // Usar progreso de localStorage si es reciente (menos de 5 minutos)
            if (progress !== undefined && Date.now() - timestamp < 5 * 60 * 1000) {
              return { courseId, progress };
            }
          }
        } catch (error) {
          // Si hay error leyendo localStorage, continuar con el backend
        }

        // Si no hay progreso en localStorage o es antiguo, obtener del backend
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
        // Crear un nuevo Map para forzar la actualización de React
        return new Map(newMap);
      });
    } catch (error) {
      console.error("Error al cargar progreso de cursos:", error);
    }
  }, [user?.uid]);

  const loadCourses = useCallback(async (page: number, size: number, resetHistory = false, currentSearch?: string) => {
    if (!user?.uid) {
      setIsLoadingCourses(false);
      setCourses([]);
      return;
    }

    try {
      setIsLoadingCourses(true);
      
      if (resetHistory) {
        setPageHistoryCourses(new Map([[1, null]]));
      }

      let lastIdForPage: string | null = null;
      if (page > 1 && !currentSearch) {
        lastIdForPage = pageHistoryCoursesRef.current.get(page - 1) || null;
        
        if (!lastIdForPage && page > 1) {
          let currentLastId: string | null = null;
          for (let p = 1; p < page; p++) {
            const params: { limit: number; lastId?: string } = { limit: size };
            if (currentLastId) {
              params.lastId = currentLastId;
            }
            const data = await userService.getCoursesPerUser(user.uid, params);
            if (data.courses && data.courses.length > 0) {
              currentLastId = data.pagination?.lastId || null;
              setPageHistoryCourses(prev => {
                const newMap = new Map(prev);
                newMap.set(p + 1, currentLastId);
                return newMap;
              });
            } else {
              break;
            }
          }
          lastIdForPage = currentLastId;
        }
      }

      const params: { limit: number; lastId?: string; search?: string } = { limit: size };
      if (lastIdForPage && !currentSearch) {
        params.lastId = lastIdForPage;
      }
      if (currentSearch && currentSearch.trim()) {
        params.search = currentSearch.trim();
      }

      const data = await userService.getCoursesPerUser(user.uid, params);
      
      let coursesData: Course[] = [];
      if (data.courses) {
        coursesData = data.courses;
        const newLastId = data.pagination?.lastId || null;
        
        setPageHistoryCourses(prev => {
          const newMap = new Map(prev);
          newMap.set(page, newLastId);
          if (page === 1) {
            newMap.set(1, null);
          }
          return newMap;
        });

        if (data.pagination?.hasMore) {
          setTotalPagesCourses(prev => Math.max(prev, page + 1));
        } else {
          setTotalPagesCourses(page);
        }
        
        setTotalCountCourses((page - 1) * size + coursesData.length);
      } else if (Array.isArray(data)) {
        coursesData = data;
        setTotalPagesCourses(1);
        setTotalCountCourses(coursesData.length);
      }
      
      const uniqueCourses = coursesData.filter((course, index, self) =>
        index === self.findIndex((c) => c.id === course.id)
      );
      
      setCourses(uniqueCourses);

      // Cargar progreso de los cursos
      if (uniqueCourses.length > 0 && user?.uid) {
        loadCoursesProgress(uniqueCourses.map(c => c.id));
      }
    } catch (error) {
      console.error("❌ Error al cargar los cursos:", error);
      setCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  }, [user?.uid, loadCoursesProgress]);

  const loadEbooks = useCallback(async (page: number, size: number, resetHistory = false, currentSearch?: string) => {
    if (!user?.uid) {
      setIsLoadingEbooks(false);
      setEbooks([]);
      return;
    }

    try {
      setIsLoadingEbooks(true);
      
      if (resetHistory) {
        setPageHistoryEbooks(new Map([[1, null]]));
      }

      let lastIdForPage: string | null = null;
      if (page > 1 && !currentSearch) {
        lastIdForPage = pageHistoryEbooksRef.current.get(page - 1) || null;
        
        if (!lastIdForPage && page > 1) {
          let currentLastId: string | null = null;
          for (let p = 1; p < page; p++) {
            const params: { limit: number; lastId?: string } = { limit: size };
            if (currentLastId) {
              params.lastId = currentLastId;
            }
            const data = await userService.getEbooksPerUser(user.uid, params);
            if (data.ebooks && data.ebooks.length > 0) {
              currentLastId = data.pagination?.lastId || null;
              setPageHistoryEbooks(prev => {
                const newMap = new Map(prev);
                newMap.set(p + 1, currentLastId);
                return newMap;
              });
            } else {
              break;
            }
          }
          lastIdForPage = currentLastId;
        }
      }

      const params: { limit: number; lastId?: string; search?: string } = { limit: size };
      if (lastIdForPage && !currentSearch) {
        params.lastId = lastIdForPage;
      }
      if (currentSearch && currentSearch.trim()) {
        params.search = currentSearch.trim();
      }

      const data = await userService.getEbooksPerUser(user.uid, params);
      
      let ebooksData: Ebook[] = [];
      if (data.ebooks) {
        ebooksData = data.ebooks;
        const newLastId = data.pagination?.lastId || null;
        
        setPageHistoryEbooks(prev => {
          const newMap = new Map(prev);
          newMap.set(page, newLastId);
          if (page === 1) {
            newMap.set(1, null);
          }
          return newMap;
        });

        if (data.pagination?.hasMore) {
          setTotalPagesEbooks(prev => Math.max(prev, page + 1));
        } else {
          setTotalPagesEbooks(page);
        }
        
        setTotalCountEbooks((page - 1) * size + ebooksData.length);
      } else if (Array.isArray(data)) {
        ebooksData = data;
        setTotalPagesEbooks(1);
        setTotalCountEbooks(ebooksData.length);
      }
      
      const uniqueEbooks = ebooksData.filter((ebook, index, self) =>
        index === self.findIndex((e) => e.id === ebook.id)
      );
      
      setEbooks(uniqueEbooks);
    } catch (error) {
      console.error("❌ Error al cargar los ebooks:", error);
      setEbooks([]);
    } finally {
      setIsLoadingEbooks(false);
    }
  }, [user?.uid]);

  const loadEventos = useCallback(async (page: number, size: number, resetHistory = false, currentSearch?: string) => {
    if (!user?.uid) {
      setIsLoadingEventos(false);
      setEventos([]);
      return;
    }

    try {
      setIsLoadingEventos(true);
      
      if (resetHistory) {
        setPageHistoryEventos(new Map([[1, null]]));
      }

      let lastIdForPage: string | null = null;
      if (page > 1 && !currentSearch) {
        lastIdForPage = pageHistoryEventosRef.current.get(page - 1) || null;
        
        if (!lastIdForPage && page > 1) {
          let currentLastId: string | null = null;
          for (let p = 1; p < page; p++) {
            const params: { limit: number; lastId?: string } = { limit: size };
            if (currentLastId) {
              params.lastId = currentLastId;
            }
            const data = await userService.getEventosPerUser(user.uid, params);
            if (data.eventos && data.eventos.length > 0) {
              currentLastId = data.pagination?.lastId || null;
              setPageHistoryEventos(prev => {
                const newMap = new Map(prev);
                newMap.set(p + 1, currentLastId);
                return newMap;
              });
            } else {
              break;
            }
          }
          lastIdForPage = currentLastId;
        }
      }

      const params: { limit: number; lastId?: string; search?: string } = { limit: size };
      if (lastIdForPage && !currentSearch) {
        params.lastId = lastIdForPage;
      }
      if (currentSearch && currentSearch.trim()) {
        params.search = currentSearch.trim();
      }

      const data = await userService.getEventosPerUser(user.uid, params);
      
      let eventosData: Evento[] = [];
      if (data.eventos) {
        eventosData = data.eventos;
        const newLastId = data.pagination?.lastId || null;
        
        setPageHistoryEventos(prev => {
          const newMap = new Map(prev);
          newMap.set(page, newLastId);
          if (page === 1) {
            newMap.set(1, null);
          }
          return newMap;
        });

        if (data.pagination?.hasMore) {
          setTotalPagesEventos(prev => Math.max(prev, page + 1));
        } else {
          setTotalPagesEventos(page);
        }
        
        setTotalCountEventos((page - 1) * size + eventosData.length);
      } else if (Array.isArray(data)) {
        eventosData = data;
        setTotalPagesEventos(1);
        setTotalCountEventos(eventosData.length);
      }
      
      const uniqueEventos = eventosData.filter((evento, index, self) =>
        index === self.findIndex((e) => e.id === evento.id)
      );
      
      setEventos(uniqueEventos);
    } catch (error) {
      console.error("❌ Error al cargar los eventos:", error);
      setEventos([]);
    } finally {
      setIsLoadingEventos(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (authLoading) { return }
    
    if (user?.uid && activeTab === "formaciones") {
      loadCourses(currentPageCourses, pageSizeCourses, currentPageCourses === 1, searchQueryCourses);
      isInitialMount.current = false;
    } else if (!user?.uid) {
      setIsLoadingCourses(false);
      setCourses([]);
    }
  }, [user?.uid, authLoading, currentPageCourses, pageSizeCourses, location.pathname, loadCourses, searchQueryCourses, activeTab]);

  // Actualizar progreso cuando el usuario vuelve al listado después de estar en el detalle
  useEffect(() => {
    if (location.pathname === "/" && activeTab === "formaciones" && courses.length > 0 && user?.uid) {
      // Recargar progreso de los cursos visibles para obtener valores actualizados de localStorage
      const courseIds = courses.map(c => c.id);
      loadCoursesProgress(courseIds);
    }
  }, [location.pathname, activeTab, courses, user?.uid, loadCoursesProgress]);

  useEffect(() => {
    if (authLoading) { return }
    
    if (user?.uid && activeTab === "ebooks") { loadEbooks(currentPageEbooks, pageSizeEbooks, currentPageEbooks === 1, searchQueryEbooks); } 
    else if (!user?.uid) {
      setIsLoadingEbooks(false);
      setEbooks([]);
    }
  }, [user?.uid, authLoading, currentPageEbooks, pageSizeEbooks, loadEbooks, searchQueryEbooks, activeTab]);

  useEffect(() => {
    if (authLoading) { return }
    
    if (user?.uid && activeTab === "eventos") { loadEventos(currentPageEventos, pageSizeEventos, currentPageEventos === 1, searchQueryEventos) } 
    else if (!user?.uid) {
      setIsLoadingEventos(false);
      setEventos([]);
    }
  }, [user?.uid, authLoading, currentPageEventos, pageSizeEventos, loadEventos, searchQueryEventos, activeTab]);

  useEffect(() => {
    if (!isInitialMount.current && user?.uid && activeTab === "formaciones") {
      setCurrentPageCourses(1);
      loadCourses(1, pageSizeCourses, true, searchQueryCourses);
    }
  }, [searchQueryCourses, loadCourses, pageSizeCourses, user?.uid, activeTab]);

  useEffect(() => {
    if (user?.uid && activeTab === "ebooks") {
      setCurrentPageEbooks(1);
      loadEbooks(1, pageSizeEbooks, true, searchQueryEbooks);
    }
  }, [searchQueryEbooks, loadEbooks, pageSizeEbooks, user?.uid, activeTab]);

  useEffect(() => {
    if (user?.uid && activeTab === "eventos") {
      setCurrentPageEventos(1);
      loadEventos(1, pageSizeEventos, true, searchQueryEventos);
    }
  }, [searchQueryEventos, loadEventos, pageSizeEventos, user?.uid, activeTab]);

  const goToPageCourses = (page: number) => {
    if (page >= 1 && page <= totalPagesCourses) {
      setCurrentPageCourses(page);
    }
  };

  const goToPageEbooks = (page: number) => {
    if (page >= 1 && page <= totalPagesEbooks) {
      setCurrentPageEbooks(page);
    }
  };

  const goToPageEventos = (page: number) => {
    if (page >= 1 && page <= totalPagesEventos) {
      setCurrentPageEventos(page);
    }
  };

  const handleSetPageSizeCourses = async (size: number) => {
    setPageSizeCourses(size);
    setCurrentPageCourses(1);
    await loadCourses(1, size, true);
  };

  const handleSetPageSizeEbooks = async (size: number) => {
    setPageSizeEbooks(size);
    setCurrentPageEbooks(1);
    await loadEbooks(1, size, true);
  };

  const handleSetPageSizeEventos = async (size: number) => {
    setPageSizeEventos(size);
    setCurrentPageEventos(1);
    await loadEventos(1, size, true);
  };

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
        courses={courses}
        isLoadingCourses={isLoadingCourses}
        currentPageCourses={currentPageCourses}
        totalPagesCourses={totalPagesCourses}
        totalCountCourses={totalCountCourses}
        searchQueryCourses={searchQueryCourses}
        setSearchQueryCourses={setSearchQueryCourses}
        pageSizeCourses={pageSizeCourses}
        handleSetPageSizeCourses={handleSetPageSizeCourses}
        goToPageCourses={goToPageCourses}
        // Ebooks
        ebooks={ebooks}
        isLoadingEbooks={isLoadingEbooks}
        currentPageEbooks={currentPageEbooks}
        totalPagesEbooks={totalPagesEbooks}
        totalCountEbooks={totalCountEbooks}
        searchQueryEbooks={searchQueryEbooks}
        setSearchQueryEbooks={setSearchQueryEbooks}
        pageSizeEbooks={pageSizeEbooks}
        handleSetPageSizeEbooks={handleSetPageSizeEbooks}
        goToPageEbooks={goToPageEbooks}
        // Eventos
        eventos={eventos}
        isLoadingEventos={isLoadingEventos}
        currentPageEventos={currentPageEventos}
        totalPagesEventos={totalPagesEventos}
        totalCountEventos={totalCountEventos}
        searchQueryEventos={searchQueryEventos}
        setSearchQueryEventos={setSearchQueryEventos}
        pageSizeEventos={pageSizeEventos}
        handleSetPageSizeEventos={handleSetPageSizeEventos}
        goToPageEventos={goToPageEventos}
        // Tab activa
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        coursesProgress={coursesProgress}
      />
      
    </div>
  );
};

export default Index;