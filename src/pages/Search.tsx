
import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchIcon, BookOpen, Filter, GraduationCap, Calendar, Book, FolderOpen, Loader2 } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import userService from "@/services/userService"
import courseService from "@/services/courseService"
import { Course } from "@/types/types"
import axios from "axios"
import { auth } from "../../config/firebase-client"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://inee-backend.onrender.com"

const Search = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [filter, setFilter] = useState<"all" | "formacion" | "ebook" | "evento" | "modulo">("all")
  const [allItems, setAllItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Cargar todos los recursos (formaciones, ebooks, eventos, módulos)
  useEffect(() => {
    let isMounted = true;
    
    const loadAllResources = async () => {
      if (!user?.uid) {
        setAllItems([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const allItemsArray: any[] = [];
        
        // 1. Obtener formaciones del usuario
        const coursesData = await userService.getCoursesPerUser(user.uid, { limit: 100 });
        const courses: Course[] = coursesData.courses || [];
        
        console.log("📚 [Search] Loaded courses:", courses.length);
        
        // Cargar todos los módulos en paralelo
        const modulePromises: Promise<any[]>[] = [];
        const courseModuleMap = new Map<string, string[]>(); // courseId -> moduleIds
        
        for (const course of courses) {
          // Agregar formación
          allItemsArray.push({
            id: `formacion-${course.id}`,
            resourceType: "formacion",
            title: course.titulo || "",
            description: course.descripcion || "",
            image: course.imagen || "",
            href: `/curso/${course.id}`,
          });
          
          // Preparar carga de módulos
          if (course.id_modulos && course.id_modulos.length > 0) {
            courseModuleMap.set(course.id, course.id_modulos);
            modulePromises.push(courseService.getAllModules(course.id_modulos));
          }
        }
        
        // Cargar todos los módulos en paralelo
        if (modulePromises.length > 0) {
          const allModulesArrays = await Promise.all(modulePromises);
          let moduleIndex = 0;
          
          for (const course of courses) {
            if (course.id_modulos && course.id_modulos.length > 0) {
              const modules = allModulesArrays[moduleIndex] || [];
              moduleIndex++;
              
              for (const module of modules) {
                // Generar ID único para evitar duplicados
                const uniqueId = `modulo-${course.id}-${module.id}`;
                allItemsArray.push({
                  id: uniqueId,
                  resourceType: "modulo",
                  title: module.titulo || "",
                  description: module.descripcion || "",
                  courseId: course.id,
                  courseName: course.titulo || "",
                  href: `/curso/${course.id}`,
                });
              }
            }
          }
        }
        
        // 3. Obtener ebooks (opcional, no crítico)
        try {
          const idToken = await auth.currentUser?.getIdToken();
          if (idToken) {
            const ebooksResponse = await axios.get(`${API_BASE_URL}/api/ebooks`, {
              headers: { Authorization: `Bearer ${idToken}` },
              params: { limit: 100 }
            });
            
            const ebooks = ebooksResponse.data?.ebooks || (Array.isArray(ebooksResponse.data) ? ebooksResponse.data : []);
            for (const ebook of ebooks) {
              allItemsArray.push({
                id: `ebook-${ebook.id}`,
                resourceType: "ebook",
                title: ebook.title || ebook.titulo || "",
                description: ebook.description || ebook.descripcion || "",
                image: ebook.imagen || "",
                href: `/ebook/${ebook.id}`,
              });
            }
            console.log("📖 [Search] Loaded ebooks:", ebooks.length);
          }
        } catch (error) {
          console.warn("⚠️ [Search] Could not load ebooks (non-critical):", error);
        }
        
        // 4. Obtener eventos (opcional, no crítico)
        try {
          const idToken = await auth.currentUser?.getIdToken();
          if (idToken) {
            const eventsResponse = await axios.get(`${API_BASE_URL}/api/eventos`, {
              headers: { Authorization: `Bearer ${idToken}` },
              params: { limit: 100 }
            });
            
            const events = eventsResponse.data?.events || (Array.isArray(eventsResponse.data) ? eventsResponse.data : []);
            for (const event of events) {
              // Convertir fecha de Firestore Timestamp a string si es necesario
              let dateString = "";
              if (event.date) {
                if (typeof event.date === 'string') {
                  dateString = event.date;
                } else if (event.date._seconds) {
                  // Es un Timestamp de Firestore
                  dateString = new Date(event.date._seconds * 1000).toLocaleDateString();
                } else if (event.date instanceof Date) {
                  dateString = event.date.toLocaleDateString();
                }
              } else if (event.fecha) {
                if (typeof event.fecha === 'string') {
                  dateString = event.fecha;
                } else if (event.fecha._seconds) {
                  dateString = new Date(event.fecha._seconds * 1000).toLocaleDateString();
                } else if (event.fecha instanceof Date) {
                  dateString = event.fecha.toLocaleDateString();
                }
              }
              
              allItemsArray.push({
                id: `evento-${event.id}`,
                resourceType: "evento",
                title: event.title || event.titulo || "",
                description: event.description || event.descripcion || "",
                image: event.image || event.imagen || "",
                date: dateString,
                href: `/evento/${event.id}`,
              });
            }
            console.log("📅 [Search] Loaded events:", events.length);
          }
        } catch (error) {
          console.warn("⚠️ [Search] Could not load events (non-critical):", error);
        }
        
        if (!isMounted) return;
        
        console.log("✅ [Search] Loaded resources:", {
          total: allItemsArray.length,
          formaciones: allItemsArray.filter(i => i.resourceType === "formacion").length,
          modulos: allItemsArray.filter(i => i.resourceType === "modulo").length,
          ebooks: allItemsArray.filter(i => i.resourceType === "ebook").length,
          eventos: allItemsArray.filter(i => i.resourceType === "evento").length,
        });
        
        setAllItems(allItemsArray);
      } catch (error) {
        console.error("❌ [Search] Error loading resources:", error);
        if (isMounted) {
          setAllItems([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadAllResources();
    
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  // Actualizar query cuando cambie el parámetro de la URL
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  const filteredResults = useMemo(() => {
    let results = allItems

    console.log("🔍 [Search] Filtering results:", {
      totalItems: allItems.length,
      filter,
      query,
      beforeFilter: results.length
    });

    // Aplicar filtro por tipo de recurso
    if (filter !== "all") {
      results = results.filter((item) => item.resourceType === filter)
      console.log("🔍 [Search] After filter:", results.length);
    }

    // Aplicar búsqueda por texto
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      results = results.filter(
        (item) =>
          (item.title && item.title.toLowerCase().includes(searchTerm)) ||
          (item.description && item.description.toLowerCase().includes(searchTerm)) ||
          (item.courseName && item.courseName.toLowerCase().includes(searchTerm)),
      )
      console.log("🔍 [Search] After search:", results.length);
    }

    console.log("✅ [Search] Final results:", results.length);
    return results
  }, [query, filter, allItems])

  const getIcon = (resourceType: string) => {
    switch (resourceType) {
      case "formacion":
        return <GraduationCap className="w-6 h-6" />
      case "ebook":
        return <Book className="w-6 h-6" />
      case "evento":
        return <Calendar className="w-6 h-6" />
      case "modulo":
        return <FolderOpen className="w-6 h-6" />
      default:
        return <BookOpen className="w-6 h-6" />
    }
  }

  const getTypeColor = (resourceType: string) => {
    switch (resourceType) {
      case "formacion":
        return "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
      case "ebook":
        return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
      case "evento":
        return "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
      case "modulo":
        return "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400"
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400"
    }
  }

  const getTypeLabel = (resourceType: string) => {
    switch (resourceType) {
      case "formacion":
        return "Formación"
      case "ebook":
        return "Ebook"
      case "evento":
        return "Evento"
      case "modulo":
        return "Módulo"
      default:
        return "Recurso"
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleItemClick = (item: any) => {
    if (item.href) {
      navigate(item.href)
    } else if (item.resourceType === "modulo" && item.courseId) {
      navigate(`/curso/${item.courseId}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Buscar Recursos</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Encuentra formaciones, ebooks, eventos y módulos
        </p>
      </div>

      {/* Barra de búsqueda */}
      <form onSubmit={handleSearch} className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="search"
          placeholder="Buscar formaciones, ebooks, eventos o módulos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 h-12 text-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        />
      </form>

      {/* Filtros */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="whitespace-nowrap"
        >
          Todo
        </Button>
        <Button
          variant={filter === "formacion" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("formacion")}
          className="whitespace-nowrap"
        >
          Formaciones
        </Button>
        <Button
          variant={filter === "ebook" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("ebook")}
          className="whitespace-nowrap"
        >
          Ebooks
        </Button>
        <Button
          variant={filter === "evento" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("evento")}
          className="whitespace-nowrap"
        >
          Eventos
        </Button>
        <Button
          variant={filter === "modulo" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("modulo")}
          className="whitespace-nowrap"
        >
          Módulos
        </Button>
      </div>

      {/* Resultados */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : filteredResults.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredResults.length} resultado{filteredResults.length !== 1 ? "s" : ""} encontrado{filteredResults.length !== 1 ? "s" : ""}
            </p>
            {filteredResults.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(item.resourceType)}`}
                    >
                      {getIcon(item.resourceType)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{item.title}</h3>
                        <Badge variant="outline" className={`ml-2 ${getTypeColor(item.resourceType)} border-current`}>
                          {getTypeLabel(item.resourceType)}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{item.description}</p>

                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {item.courseName && (
                          <>
                            <span>{item.courseName}</span>
                            <span>•</span>
                          </>
                        )}
                        {item.date && typeof item.date === 'string' && (
                          <>
                            <span>{item.date}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Intenta con otros términos de búsqueda o cambia los filtros
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
