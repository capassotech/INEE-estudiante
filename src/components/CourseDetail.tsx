import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Loader2,
  Trophy,
  Award,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ContentItem from "@/components/content-item";
import PDFModal from "@/components/PDFModal";
import VideoModal from "@/components/video-modal";
import { Course, Module, ContentItem as ContentItemType } from "@/types/types";
import courseService from "@/services/courseService";
import progressService from "@/services/progressService";
import reviewService from "@/services/reviewService";
import certificateService from "@/services/certificateService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ImageWithPlaceholder } from "@/components/ImageWithPlaceholder";
import { Download } from "lucide-react";

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [completedContents, setCompletedContents] = useState<Set<string>>(new Set());
  const [hasUserReview, setHasUserReview] = useState(false);

  // Función para guardar progreso en localStorage como respaldo
  // Usar userId en la clave para que sea específico por usuario
  const saveProgressToLocalStorage = (courseId: string, completed: Set<string>) => {
    try {
      if (!user?.uid) return;
      const key = `progress_${user.uid}_${courseId}`;
      localStorage.setItem(key, JSON.stringify(Array.from(completed)));
    } catch (error) {
      console.warn("Error al guardar progreso en localStorage:", error);
    }
  };

  // Función para cargar progreso desde localStorage
  // Usar userId en la clave para que sea específico por usuario
  const loadProgressFromLocalStorage = (courseId: string): Set<string> => {
    try {
      if (!user?.uid) return new Set<string>();
      const key = `progress_${user.uid}_${courseId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (error) {
      console.warn("Error al cargar progreso desde localStorage:", error);
    }
    return new Set<string>();
  };

  const [progressData, setProgressData] = useState<{
    progreso_general: number;
    total_contenidos: number;
    contenidos_completados: number;
  } | null>(null);
  const [updatingContent, setUpdatingContent] = useState<Set<string>>(new Set());
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(null);
  const [isDownloadingCertificate, setIsDownloadingCertificate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      const course = await courseService.getCourseById(courseId);
      setCourseData(course);
      setIsLoadingCourse(false);
    };
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    const checkUserReview = async () => {
      if (!user?.uid || !courseId) return;
      
      try {
        const responseReviews = await reviewService.getReviewsByCourse(courseId);
        console.log(responseReviews.reviews);
        console.log(user.uid);
        let foundReview = false;
        
        if (responseReviews?.reviews && Array.isArray(responseReviews.reviews)) {
          for (const review of responseReviews.reviews) {
            if (review.userId === user.uid) {
              console.log("tiene review el usuario");
              foundReview = true;
              break;
            }
          }
        }
        
        setHasUserReview(foundReview);
      } catch (error) {
        console.warn("Error al verificar reseña del usuario:", error);
        setHasUserReview(false);
      }
    };

    checkUserReview();
  }, [user?.uid, courseId]);

  useEffect(() => {
    if (courseData) {
      const fetchModules = async () => {
        try {
          const modulesData = await courseService.getAllModules(courseData.id_modulos);
          setModules(modulesData || []);
          setIsLoadingModules(false);

          // Cargar progreso desde localStorage primero (para mostrar algo inmediatamente)
          let cachedProgress = new Set<string>();
          if (courseId && user?.uid) {
            cachedProgress = loadProgressFromLocalStorage(courseId);
            if (cachedProgress.size > 0) {
              setCompletedContents(cachedProgress);
            }
          }

          // Cargar progreso desde el backend después de cargar los módulos
          // Pasar el cache como parámetro para usarlo como respaldo
          if (user?.uid && courseId && modulesData) {
            await loadProgressFromBackend(modulesData, cachedProgress);
          } else {
            setIsLoadingProgress(false);
          }
        } catch (error) {
          console.error("Error al cargar módulos:", error);
          setIsLoadingModules(false);
          setIsLoadingProgress(false);
        }
      };
      fetchModules();


    }
  }, [courseData, user, courseId]);

  /**
   * Cargar progreso desde el backend
   */
  const loadProgressFromBackend = async (modulesData: Module[], cachedProgress: Set<string> = new Set()) => {
    if (!user?.uid || !courseId || !modulesData || modulesData.length === 0) {
      setIsLoadingProgress(false);
      return;
    }

    try {
      setIsLoadingProgress(true);

      const response = await progressService.obtenerProgresoCurso(courseId);

      if (response.success && response.data) {
        const { modulos, progreso_general, total_contenidos, contenidos_completados } = response.data;

        // Actualizar estado de progreso general
        setProgressData({
          progreso_general,
          total_contenidos,
          contenidos_completados,
        });

        // Mapear contenidos completados desde el backend
        // El backend normaliza los IDs a índices, así que usamos el índice como identificador
        let completedSet = new Set<string>();

        // Crear un mapa de módulos del backend por ID
        const modulosBackendMap = new Map(
          modulos.map(m => [m.modulo_id, m])
        );

        // Verificar estado de TODOS los contenidos en paralelo usando índices
        const checkPromises: Array<Promise<{ contentKey: string; completed: boolean; moduleId: string }>> = [];

        for (const module of modulesData) {
          if (!module.contenido || module.contenido.length === 0) continue;

          const moduloBackend = modulosBackendMap.get(module.id);
          const contenidosCompletadosModulo = moduloBackend?.contenidos_completados || 0;

          // Verificar TODOS los contenidos del módulo usando el índice (excluyendo contenido_extra)
          for (let index = 0; index < module.contenido.length; index++) {
            const content = module.contenido[index];
            
            // Excluir contenido_extra de la verificación de progreso
            if (content.tipo_contenido === "contenido_extra") {
              continue;
            }

            const contentKey = `${module.id}-${index}`;

            // Crear promesa para verificar estado usando el índice
            const checkPromise = progressService
              .obtenerEstadoContenido(module.id, index.toString())
              .then((estadoResponse) => {
                const completed = estadoResponse.success && estadoResponse.data.completado;
                // console.log(`🔍 Verificando contenido ${module.id}-${index}:`, {
                //   completado: completed,
                //   respuesta: estadoResponse.data
                // });
                return { contentKey, completed, moduleId: module.id };
              })
              .catch((error) => {
                console.error(`❌ Error al verificar estado de contenido ${index} en módulo ${module.id}:`, {
                  error: error.message,
                  response: error.response?.data,
                  status: error.response?.status
                });
                // Retornar no completado si hay error
                return { contentKey, completed: false, moduleId: module.id };
              });

            checkPromises.push(checkPromise);
          }
        }

        // Esperar todas las verificaciones en paralelo
        const results = await Promise.allSettled(checkPromises);

        // Procesar resultados
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            const { contentKey, completed } = result.value;
            if (completed) {
              completedSet.add(contentKey);
            }
          } else {
            console.error('❌ Error al procesar resultado de progreso:', result.reason);
          }
        });


        // Guardar en localStorage como respaldo
        saveProgressToLocalStorage(courseId, completedSet);

        if (completedSet.size === 0 && contenidos_completados > 0) {
          // Si hay progreso en localStorage y el backend también reporta progreso,
          // usar el localStorage como fuente de verdad (es más confiable que las verificaciones que fallan)
          if (cachedProgress.size > 0) {
            completedSet = cachedProgress;
            const realProgress = total_contenidos > 0
              ? Math.round((cachedProgress.size / total_contenidos) * 100)
              : 0;
            setProgressData({
              progreso_general: realProgress,
              total_contenidos: total_contenidos,
              contenidos_completados: cachedProgress.size,
            });
            // Guardar de nuevo en localStorage para asegurar que esté actualizado
            saveProgressToLocalStorage(courseId, cachedProgress);
          } else {
            // Si no hay nada en localStorage pero el backend reporta progreso,
            // intentar construir el conjunto de contenidos completados basado en el reporte del backend
            const completedByBackend = new Set<string>();

            for (const module of modulesData) {
              if (!module.contenido || module.contenido.length === 0) continue;

              const moduloBackend = modulosBackendMap.get(module.id);
              const contenidosCompletadosModulo = moduloBackend?.contenidos_completados || 0;

              if (contenidosCompletadosModulo > 0) {
                // Verificar cada contenido del módulo (excluyendo contenido_extra)
                for (let index = 0; index < module.contenido.length; index++) {
                  const content = module.contenido[index];
                  
                  // Excluir contenido_extra de la verificación de progreso
                  if (content.tipo_contenido === "contenido_extra") {
                    continue;
                  }

                  const contentKey = `${module.id}-${index}`;

                  try {
                    const estadoResponse = await progressService.obtenerEstadoContenido(
                      module.id,
                      index.toString()
                    );
                    if (estadoResponse.success && estadoResponse.data.completado) {
                      completedByBackend.add(contentKey);
                    }
                  } catch (error) {
                    // Continuar con el siguiente
                  }
                }
              }
            }

            if (completedByBackend.size > 0) {
              completedSet = completedByBackend;
              const realProgress = total_contenidos > 0
                ? Math.round((completedByBackend.size / total_contenidos) * 100)
                : 0;
              setProgressData({
                progreso_general: realProgress,
                total_contenidos: total_contenidos,
                contenidos_completados: completedByBackend.size,
              });
              saveProgressToLocalStorage(courseId, completedByBackend);
            } else {
              // Si todo falla, mantener el progreso del backend aunque no podamos marcar checkboxes
              setProgressData({
                progreso_general: progreso_general,
                total_contenidos: total_contenidos,
                contenidos_completados: contenidos_completados,
              });
            }
          }
        } else if (completedSet.size === 0 && contenidos_completados === 0) {
          setProgressData({
            progreso_general: 0,
            total_contenidos: total_contenidos,
            contenidos_completados: 0,
          });
          // Limpiar localStorage si no hay progreso
          if (courseId && user?.uid) {
            localStorage.removeItem(`progress_${user.uid}_${courseId}`);
          }
        } else if (completedSet.size !== contenidos_completados) {
          // Usar el valor verificado como fuente de verdad
          const realProgress = total_contenidos > 0
            ? Math.round((completedSet.size / total_contenidos) * 100)
            : 0;
          setProgressData({
            progreso_general: realProgress,
            total_contenidos: total_contenidos,
            contenidos_completados: completedSet.size,
          });
          // Actualizar localStorage con los valores verificados
          saveProgressToLocalStorage(courseId, completedSet);
        } else {
          // Todo coincide, actualizar localStorage con los valores verificados
          saveProgressToLocalStorage(courseId, completedSet);
        }

        setCompletedContents(completedSet);
      } else {
        console.warn("⚠️ Respuesta del backend sin éxito:", response);
      }
    } catch (error: any) {
      console.error("❌ Error al cargar progreso:", error);
      console.error("Detalles del error:", error.response?.data || error.message);
      toast.error("Error al cargar el progreso del curso");
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  /**
   * Marcar/desmarcar contenido como completado
   */
  const toggleContentComplete = async (moduleId: string, contentIndex: number) => {
    if (!user?.uid || !courseId) {
      toast.error("Debes estar autenticado para marcar progreso");
      return;
    }

    // Encontrar el módulo y contenido correspondiente usando el índice
    const targetModule = modules.find((m) => m.id === moduleId);

    if (!targetModule || !targetModule.contenido || !targetModule.contenido[contentIndex]) {
      console.error("❌ No se encontró el contenido:", { moduleId, contentIndex });
      toast.error("No se pudo encontrar el contenido");
      return;
    }

    const targetContent = targetModule.contenido[contentIndex];

    // Prevenir que contenido_extra se marque como completado (aunque no debería ser posible desde la UI)
    if (targetContent.tipo_contenido === "contenido_extra") {
      console.warn("⚠️ Intento de marcar contenido_extra como completado, ignorando...");
      toast.error("La bibliografía complementaria no se puede marcar como completada");
      return;
    }

    // console.log("✅ Contenido encontrado para marcar/desmarcar:", {
    //   contentIndex,
    //   moduloId: targetModule.id,
    //   cursoId: courseId,
    //   userId: user.uid,
    //   contenido: targetContent
    // });

    const contentKey = `${moduleId}-${contentIndex}`;
    const isCurrentlyCompleted = completedContents.has(contentKey);

    // console.log(`🔄 Estado antes de toggle:`, {
    //   contentKey,
    //   isCurrentlyCompleted,
    //   totalCompletados: completedContents.size,
    //   todosLosCompletados: Array.from(completedContents)
    // });

    // Optimistic update
    setUpdatingContent((prev) => new Set(prev).add(contentKey));
    let updatedSet: Set<string>;
    setCompletedContents((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlyCompleted) {
        newSet.delete(contentKey);
        console.log(`➖ Eliminando ${contentKey} del estado local`);
      } else {
        newSet.add(contentKey);
        console.log(`➕ Agregando ${contentKey} al estado local`);
      }
      updatedSet = newSet;
      // Guardar en localStorage inmediatamente después de la actualización optimista
      if (courseId) {
        saveProgressToLocalStorage(courseId, newSet);
      }
      console.log(`💾 Nuevo estado local:`, {
        totalCompletados: newSet.size,
        todosLosCompletados: Array.from(newSet)
      });
      return newSet;
    });

    try {
      let response;
      const dataToSend = {
        userId: user.uid,
        cursoId: courseId,
        moduloId: targetModule.id,
        contenidoId: contentIndex.toString(), // Enviar el índice como string
      };

      // console.log(`📤 Enviando al backend (${isCurrentlyCompleted ? 'desmarcar' : 'marcar'}):`, dataToSend);

      if (isCurrentlyCompleted) {
        // Desmarcar
        response = await progressService.desmarcarCompletado(dataToSend);
      } else {
        // Marcar
        response = await progressService.marcarCompletado(dataToSend);
      }

      // console.log("📥 Respuesta del backend:", response);

      if (response.success) {
        // console.log(`✅ Backend confirmó la operación. Estado optimista aplicado:`, {
        //   contentKey,
        //   estaCompletadoEnUpdatedSet: updatedSet.has(contentKey),
        //   deberiaEstar: !isCurrentlyCompleted,
        //   coincide: updatedSet.has(contentKey) === !isCurrentlyCompleted
        // });

        // NO hay necesidad de actualizar el estado nuevamente porque ya hicimos optimistic update
        // Solo actualizar el progreso general
        if (response.progreso) {
          setProgressData({
            progreso_general: response.progreso.progreso,
            total_contenidos: response.progreso.total_contenidos,
            contenidos_completados: response.progreso.contenidos_completados,
          });
        }
      }
    } catch (error: any) {
      // Revertir cambio optimista
      setCompletedContents((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyCompleted) {
          newSet.add(contentKey);
        } else {
          newSet.delete(contentKey);
        }
        // Actualizar localStorage con el estado revertido
        if (courseId) {
          saveProgressToLocalStorage(courseId, newSet);
        }
        return newSet;
      });

      toast.error(
        error.message || "Error al actualizar el progreso. Intenta nuevamente."
      );
    } finally {
      setUpdatingContent((prev) => {
        const newSet = new Set(prev);
        newSet.delete(contentKey);
        return newSet;
      });
    }
  };

  const handleContentClick = (content: ContentItemType) => {
    if (content.tipo_contenido.toUpperCase() === "PDF") {
      setSelectedContent(content);
      setPdfModalOpen(true);
    } else if (content.tipo_contenido.toUpperCase() === "VIDEO") {
      setSelectedContent(content);
      setVideoModalOpen(true);
    }
  };

  const closePdfModal = () => {
    setPdfModalOpen(false);
    setSelectedContent(null);
  };

  const closeVideoModal = () => {
    setVideoModalOpen(false);
    setSelectedContent(null);
  };

  /**
   * Descargar certificado
   */
  const handleDownloadCertificate = async () => {
    if (!courseId || progressPercentage < 100) {
      toast.error("Debes completar el curso para descargar el certificado");
      return;
    }

    setIsDownloadingCertificate(true);
    try {
      await certificateService.generarCertificado(courseId);
      toast.success("Certificado descargado exitosamente");
    } catch (error: any) {
      console.error("Error al descargar certificado:", error);
      toast.error(error.message || "Error al descargar el certificado");
    } finally {
      setIsDownloadingCertificate(false);
    }
  };

  // Excluir contenido_extra del cálculo del progreso ya que no se pueden marcar como completados
  // Siempre calcular desde los módulos locales para excluir contenido_extra, no usar el valor del backend
  const totalContents = modules.reduce(
    (acc, m) => acc + (m.contenido?.filter(c => c.tipo_contenido !== "contenido_extra").length || 0),
    0
  );

  // Usar el tamaño real del Set de contenidos completados como fuente de verdad
  // El progressData puede tener valores desactualizados, así que priorizamos completedContents
  const actualCompletedCount = completedContents.size;
  const completedCount = actualCompletedCount > 0 ? actualCompletedCount : (progressData?.contenidos_completados || 0);

  // Calcular el progreso basado en el estado actual, no en datos potencialmente desactualizados
  const progressPercentage = totalContents > 0
    ? Math.round((actualCompletedCount / totalContents) * 100)
    : (progressData?.progreso_general || 0);

  // Consideramos el curso completado cuando el progreso llega al 100%
  const isCourseCompleted = progressPercentage === 100;

  useEffect(() => {
    const fromReview = (location.state as any)?.fromReview;

    // Solo redirigir a la reseña cuando se completa el curso
    // y NO venimos de haber omitido/completado la reseña en esta visita
    // y el usuario NO tiene ya una reseña enviada
    if (progressPercentage === 100 && courseData && !fromReview && !hasUserReview) {
      const timer = setTimeout(() => {
        navigate(`/course/${courseId}/review`, { state: { course: courseData } });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progressPercentage, courseData, courseId, navigate, location.state, hasUserReview]);
  
  if (isLoadingCourse) {
    return (
      <div className="container mx-auto px-4 py-6 text-center flex justify-center items-center h-screen">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Curso no encontrado
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          No pudimos encontrar el curso que buscas.
        </p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="self-start sm:mt-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 break-words">
            {courseData.titulo}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 break-words">
            {courseData.descripcion}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
            <Badge variant="outline" className="text-xs sm:text-sm">
              {courseData.nivel}
            </Badge>
            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
              {courseData.id_modulos.length} módulos
            </span>
          </div>
        </div>
      </div>

      {/* IMAGEN DEL CURSO */}
      <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 rounded-lg overflow-hidden">
        <ImageWithPlaceholder
          src={courseData.imagen || "/placeholder.svg"}
          alt={courseData.titulo}
          className="rounded-lg"
          aspectRatio="auto"
          style={{ width: '100%', height: '100%' }}
          placeholderIcon="book"
          placeholderText=""
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4 z-10">
          <div className="text-center text-white max-w-full">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 break-words">
              {courseData.titulo}
            </h2>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white text-xs sm:text-sm"
            >
              Nivel {courseData.nivel}
            </Badge>
          </div>
        </div>
      </div>

      {/* PANEL DE PROGRESO GENERAL */}
      {totalContents > 0 && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl break-words text-gray-900 dark:text-gray-100">
                  Progreso del Curso
                  {isLoadingProgress && (
                    <Loader2 className="w-4 h-4 inline-block ml-2 animate-spin" />
                  )}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                  {completedCount} de {totalContents} elementos completados
                </p>
              </div>
              <div className="text-center sm:text-right flex-shrink-0">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {progressPercentage}%
                </div>
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mt-2 text-primary" />
              </div>
            </div>
            <Progress
              value={progressPercentage}
              className="mt-4 h-2 sm:h-3 [&>div]:bg-primary"
            />
          </CardHeader>
        </Card>
      )}

      {/* CERTIFICADO */}
      {progressPercentage > 0 && (
        <Card className="border-2 border-dashed border-primary/50">
          <CardContent className="p-4 sm:p-6 text-center">
            <Award className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold mb-2 text-sm sm:text-base">
              Certificado de Finalización
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4">
              {progressPercentage === 100
                ? "¡Felicitaciones! Has completado el curso."
                : `Completa el ${100 - progressPercentage}% restante para obtener tu certificado.`}
            </p>
            <Button
              variant={progressPercentage === 100 ? "default" : "outline"}
              disabled={progressPercentage < 100 || isDownloadingCertificate}
              onClick={handleDownloadCertificate}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {isDownloadingCertificate ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando certificado...
                </>
              ) : progressPercentage === 100 ? (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Certificado
                </>
              ) : (
                "Certificado Bloqueado"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* MÓDULOS */}
      <div className="space-y-3 sm:space-y-4">
        {isLoadingModules ? (
          <div className="flex justify-center items-center h-full mt-40">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          modules.map((module) => {
            const moduleCompletedCount = module.contenido
              ? module.contenido.filter((c) => {
                const cId = c.id || (c.titulo + (c.descripcion ? " " + c.descripcion : ""));
                return completedContents.has(cId);
              }).length
              : 0;
            const moduleProgress = module.contenido
              ? Math.round(
                (moduleCompletedCount / module.contenido.length) * 100
              )
              : 0;

            return (
              <Card
                key={module.id}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <Collapsible
                  open={expandedModules.has(module.id)}
                  onOpenChange={() => toggleModule(module.id)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <CardTitle className="text-base sm:text-lg break-words">
                              {module.titulo}
                            </CardTitle>
                            {module.contenido && (
                              <Badge
                                variant="secondary"
                                className="self-start text-xs sm:text-sm"
                              >
                                {moduleCompletedCount}/{module.contenido.length}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words">
                            {module.descripcion}
                          </p>
                          <Progress
                            value={moduleProgress}
                            className="h-2 mt-2"
                          />
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {expandedModules.has(module.id) ? (
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 mt-2 p-4 sm:p-6 sm:pt-0 space-y-2 sm:space-y-3">
                      {module.contenido && module.contenido.length > 0 ? (
                        module.contenido.map((content, index) => {
                          // Usar el índice del contenido como identificador único
                          const contentKey = `${module.id}-${index}`;
                          const isUpdating = updatingContent.has(contentKey);
                          const uniqueKey = `${module.id}-${index}-${content.titulo}`;

                          return (
                            <div key={uniqueKey} className="relative">
                              {isUpdating && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10 rounded-lg">
                                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                </div>
                              )}
                              <ContentItem
                                content={{
                                  ...content,
                                  completed: completedContents.has(contentKey),
                                }}
                                contentIndex={index}
                                isCourseCompleted={isCourseCompleted}
                                onToggleComplete={() =>
                                  toggleContentComplete(module.id, index)
                                }
                                onContentClick={handleContentClick}
                              />
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          No hay contenido disponible en este módulo
                        </p>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })
        )}
      </div>

      {selectedContent && selectedContent.tipo_contenido.toUpperCase() === "PDF" && (
        <PDFModal
          isOpen={pdfModalOpen}
          onClose={closePdfModal}
          pdfUrl={
            selectedContent.url_contenido ||
            (selectedContent.urls_contenido && selectedContent.urls_contenido.length > 0
              ? selectedContent.urls_contenido[0]
              : "")
          }
          title={selectedContent.titulo || "Documento PDF"}
        />
      )}

      {selectedContent && selectedContent.tipo_contenido.toUpperCase() === "VIDEO" && (
        <VideoModal
          isOpen={videoModalOpen}
          onClose={closeVideoModal}
          content={{
            id: selectedContent.id,
            title: selectedContent.titulo,
            description: selectedContent.descripcion,
            url: selectedContent.urls_contenido && selectedContent.urls_contenido.length > 0
              ? selectedContent.urls_contenido[0]
              : selectedContent.url_contenido,
            duration: selectedContent.duracion.toString(),
            thumbnail: selectedContent.url_miniatura,
            topics: [], // Los temas están en el módulo, no en el contenido individual
          }}
        />
      )}
    </div>
  );
};

export default CourseDetail;
