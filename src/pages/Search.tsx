
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
        
        // 1. Obtener formaciones vigentes del usuario
        const coursesData = await userService.getCoursesPerUser(user.uid, { limit: 100 });
        const allCourses: Course[] = coursesData.courses || [];
        
        // Filtrar solo formaciones vigentes (estado "vigente" o "activo" o si no tiene estado, considerar vigente)
        const courses: Course[] = allCourses.filter((course) => {
          const estado = course.estado?.toLowerCase() || "";
          // Considerar vigentes si el estado es "vigente", "activo", o si no tiene estado definido
          return !estado || estado === "vigente" || estado === "activo" || estado === "disponible";
        });
        
        
        // Cargar todos los módulos en paralelo solo para formaciones vigentes
        const modulePromises: Array<{ course: Course; promise: Promise<any[]> }> = [];
        
        for (const course of courses) {
          // Agregar formación vigente
          allItemsArray.push({
            id: `formacion-${course.id}`,
            resourceType: "formacion",
            title: course.titulo || "",
            description: course.descripcion || "",
            image: course.imagen || "",
            href: `/curso/${course.id}`,
            courseId: course.id,
            tags: course.tags || [], // Incluir tags para búsqueda
            nivel: course.nivel || "", // Incluir nivel para búsqueda
            pilar: course.pilar || "", // Incluir pilar para búsqueda
          });
          
          // Preparar carga de módulos solo para formaciones vigentes
          if (course.id_modulos && course.id_modulos.length > 0) {
            modulePromises.push({
              course,
              promise: courseService.getAllModules(course.id_modulos).catch((error) => {
                console.warn(`⚠️ [Search] Error loading modules for course ${course.id}:`, error);
                return []; // Retornar array vacío en caso de error
              }),
            });
          }
        }
        
        // Cargar todos los módulos en paralelo
        if (modulePromises.length > 0) {
          const allModulesResults = await Promise.all(
            modulePromises.map(({ promise }) => promise)
          );
          
          modulePromises.forEach(({ course }, index) => {
            const modules = allModulesResults[index] || [];
            
            for (const module of modules) {
              if (!module || !module.id) continue; // Saltar módulos inválidos
              
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
                temas: module.temas || [], // Incluir temas para búsqueda
                tags: course.tags || [], // Incluir tags del curso
              });
            }
          });
        }
        
        // 3. Obtener ebooks (opcional, no crítico)
        // NOTA: Los ebooks están temporalmente deshabilitados en la búsqueda porque no hay una ruta configurada para verlos
        // Descomentar cuando se cree la página /ebook/:id
        /*
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
          }
        } catch (error) {
          console.warn("⚠️ [Search] Could not load ebooks (non-critical):", error);
        }
        */
        
        // 4. Obtener eventos (opcional, no crítico)
        // NOTA: Los eventos están temporalmente deshabilitados en la búsqueda porque no hay una ruta configurada para verlos
        // Descomentar cuando se cree la página /evento/:id
        /*
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
          }
        } catch (error) {
          console.warn("⚠️ [Search] Could not load events (non-critical):", error);
        }
        */
        
        if (!isMounted) return;
        
        
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
  }, [searchParams, query]);

  const filteredResults = useMemo(() => {
    let results = [...allItems] // Crear copia para no mutar el array original


    // Aplicar filtro por tipo de recurso
    if (filter !== "all") {
      results = results.filter((item) => item.resourceType === filter)
    }

    // Aplicar búsqueda por texto
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim()
      
      // Filtrar resultados que coincidan con el término de búsqueda
      results = results.filter((item) => {
        // Buscar en título
        const titleMatch = item.title && item.title.toLowerCase().includes(searchTerm)
        
        // Buscar en descripción
        const descriptionMatch = item.description && item.description.toLowerCase().includes(searchTerm)
        
        // Buscar en nombre del curso (para módulos)
        const courseNameMatch = item.courseName && item.courseName.toLowerCase().includes(searchTerm)
        
        // Buscar en tags si existen
        const tagsMatch = item.tags && Array.isArray(item.tags) && 
          item.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
        
        // Para módulos, también buscar en temas si existen
        const temasMatch = item.temas && Array.isArray(item.temas) && 
          item.temas.some((tema: string) => tema.toLowerCase().includes(searchTerm))
        
        // Buscar en nivel y pilar para formaciones
        const nivelMatch = item.nivel && item.nivel.toLowerCase().includes(searchTerm)
        const pilarMatch = item.pilar && item.pilar.toLowerCase().includes(searchTerm)
        
        return titleMatch || descriptionMatch || courseNameMatch || tagsMatch || temasMatch || nivelMatch || pilarMatch
      })
      
    }

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
    if (item.resourceType === "modulo" && item.courseId) {
      // Extraer el moduleId del ID único (formato: "modulo-${courseId}-${moduleId}")
      const moduleId = item.id.split('-').slice(2).join('-'); // Esto maneja IDs de módulos que puedan contener guiones
      
      // Navegar al curso pasando el moduleId en el state
      navigate(`/curso/${item.courseId}`, { 
        state: { 
          highlightModuleId: moduleId,
          fromSearch: true 
        } 
      });
    } else if (item.href) {
      navigate(item.href)
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
          placeholder="Buscar en tus formaciones y módulos vigentes..."
          value={query}
          onChange={(e) => {
            const newQuery = e.target.value;
            setQuery(newQuery);
            // Actualizar URL cuando el usuario escribe (opcional, puedes comentar esto si prefieres solo al presionar Enter)
            if (newQuery.trim()) {
              setSearchParams({ q: newQuery.trim() });
            } else {
              setSearchParams({});
            }
          }}
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
