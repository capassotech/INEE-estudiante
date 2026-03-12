import { useEffect, useState, useRef } from "react";
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
  FileText,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";
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
import examenService, { type Examen, type ExamenRealizado } from "@/services/examenService";
import certificateService from "@/services/certificateService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ImageWithPlaceholder } from "@/components/ImageWithPlaceholder";
import reviewService from "@/services/reviewService";
import VerExamenRealizadoModal from "@/components/VerExamenRealizadoModal";
import DOMPurify from 'dompurify';

// Función helper para sanitizar HTML de forma segura
const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  
  // Verificar si el contenido ya es HTML (contiene tags HTML)
  const isHTML = /<[a-z][\s\S]*>/i.test(html);
  
  let processedHtml = html;
  
  // Solo convertir saltos de línea a <br> si NO es HTML (texto plano)
  if (!isHTML) {
    processedHtml = html
      .replace(/\r\n/g, '\n') // Normalizar saltos de línea Windows
      .replace(/\r/g, '\n')   // Normalizar saltos de línea Mac
      .replace(/\n/g, '<br>'); // Convertir saltos de línea a <br>
  }
  
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(processedHtml, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div', 'b', 'i'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style']
    });
  }
  return processedHtml;
};

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [completedContents, setCompletedContents] = useState<Set<string>>(new Set());
  const [hasUserReview, setHasUserReview] = useState(false);
  const [hasExamen, setHasExamen] = useState(false);
  const [examenAprobado, setExamenAprobado] = useState(false);
  const [notaExamenAprobado, setNotaExamenAprobado] = useState<number | null>(null);
  const [intento, setIntento] = useState(1);
  const [loadingExamenStatus, setLoadingExamenStatus] = useState(true);
  const isCheckingExamen = useRef(false);
  const [showVerExamenModal, setShowVerExamenModal] = useState(false);
  const [examenParaModal, setExamenParaModal] = useState<Examen | null>(null);
  const [examenRealizadoParaModal, setExamenRealizadoParaModal] = useState<ExamenRealizado | null>(null);
  const [loadingVerExamen, setLoadingVerExamen] = useState(false);
  
  // Refs para los módulos (para scroll automático)
  const moduleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
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
  const [showFullDescription, setShowFullDescription] = useState(false);
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

          // NO usar caché de localStorage para evitar mostrar datos de otro usuario
          // Esperar siempre a que el backend responda
          
          // Cargar progreso desde el backend
          if (user?.uid && courseId && modulesData) {
            await loadProgressFromBackend(modulesData, new Set<string>());
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

  // Efecto para manejar la expansión y scroll cuando viene de búsqueda
  useEffect(() => {
    const locationState = location.state as { highlightModuleId?: string; fromSearch?: boolean } | undefined;
    
    if (locationState?.highlightModuleId && locationState?.fromSearch && modules.length > 0 && !isLoadingModules && !isLoadingProgress) {
      const targetModuleId = locationState.highlightModuleId;
      
      // Verificar que el módulo existe
      const moduleExists = modules.some(m => m.id === targetModuleId);
      
      if (moduleExists) {
        // Expandir el módulo automáticamente
        setExpandedModules((prev) => {
          const newSet = new Set(prev);
          newSet.add(targetModuleId);
          return newSet;
        });
        
        // Limpiar el state inmediatamente para evitar re-ejecuciones
        navigate(location.pathname, { replace: true, state: {} });
        
        // Hacer scroll al módulo con múltiples intentos para asegurar que el DOM esté listo
        let attempts = 0;
        const maxAttempts = 10;
        let hasScrolled = false;
        
        const scrollInterval = setInterval(() => {
          attempts++;
          const moduleElement = moduleRefs.current[targetModuleId];
          
          if (moduleElement && !hasScrolled) {
            hasScrolled = true;
            clearInterval(scrollInterval);
            
            // Esperar un poco más para que la animación del Collapsible termine
            setTimeout(() => {
              moduleElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
              
              // Agregar efecto visual temporal después del scroll
              setTimeout(() => {
                moduleElement.style.transition = 'all 0.3s ease';
                moduleElement.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
                
                setTimeout(() => {
                  moduleElement.style.boxShadow = '';
                }, 2000);
              }, 100);
            }, 400);
          } else if (attempts >= maxAttempts) {
            clearInterval(scrollInterval);
          }
        }, 200);
      }
    }
  }, [modules, isLoadingModules, isLoadingProgress, location.state, navigate]);

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


    const contentKey = `${moduleId}-${contentIndex}`;
    const isCurrentlyCompleted = completedContents.has(contentKey);


    // Optimistic update
    setUpdatingContent((prev) => new Set(prev).add(contentKey));
    let updatedSet: Set<string>;
    setCompletedContents((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlyCompleted) {
        newSet.delete(contentKey);
      } else {
        newSet.add(contentKey);
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

      if (isCurrentlyCompleted) {
        // Desmarcar
        response = await progressService.desmarcarCompletado(dataToSend);
      } else {
        // Marcar
        response = await progressService.marcarCompletado(dataToSend);
      }

      console.log("📥 Respuesta del backend:", response);

      if (response.success) {
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

  const handleDownloadCertificate = async () => {
    if (!courseId) return;
    
    try {
      toast.loading('Generando certificado...', { id: 'certificate-download' });
      
      await certificateService.generarCertificado(courseId);
      
      toast.success('Certificado descargado exitosamente', { id: 'certificate-download' });
    } catch (error: any) {
      console.error('Error downloading certificate:', error);
      
      // Verificar si el error es porque falta aprobar el examen
      if (error.message && error.message.includes('aprobar el examen')) {
        toast.error('Debes aprobar el examen final para obtener el certificado', { id: 'certificate-download' });
        // Forzar re-verificación del estado del examen
        setLoadingExamenStatus(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(error.message || 'Error al descargar el certificado', { id: 'certificate-download' });
      }
    }
  };

  const handleVerExamenRealizado = async () => {
    if (!courseId || !user?.uid) return;
    setShowVerExamenModal(true);
    setLoadingVerExamen(true);
    setExamenParaModal(null);
    setExamenRealizadoParaModal(null);
    try {
      const [examen, ultimoIntento] = await Promise.all([
        examenService.getExamenByFormacion(courseId),
        examenService.getUltimoIntento(user.uid, courseId),
      ]);
      setExamenParaModal(examen || null);
      setExamenRealizadoParaModal(ultimoIntento && ultimoIntento.aprobado ? ultimoIntento : null);
    } catch (error) {
      console.error("Error al cargar examen realizado:", error);
      toast.error("Error al cargar el examen realizado");
    } finally {
      setLoadingVerExamen(false);
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

  // Actualizar el progreso en localStorage para que el listado lo use
  useEffect(() => {
    if (courseId && progressPercentage >= 0 && totalContents > 0 && user?.uid) {
      try {
        const key = `courseProgress_${user.uid}_${courseId}`;
        localStorage.setItem(key, JSON.stringify({
          progress: progressPercentage,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn("Error al guardar progreso en localStorage:", error);
      }
    }
  }, [courseId, progressPercentage, totalContents, user?.uid]);

  // Consideramos el curso completado cuando el progreso llega al 100%
  const isCourseCompleted = progressPercentage === 100;

  // Función para determinar el color del progreso según el porcentaje
  const getProgressColorClass = (percentage: number): string => {
    if (percentage < 33) {
      return "[&>div]:!bg-red-500"; // Rojo para progreso bajo
    } else if (percentage < 67) {
      return "[&>div]:!bg-yellow-500"; // Amarillo para progreso medio
    } else {
      return "[&>div]:!bg-green-500"; // Verde para progreso alto
    }
  };

  // Verificar si hay examen y si está aprobado
  useEffect(() => {
    const checkExamen = async () => {
      if (!courseId || !user?.uid) {
        setLoadingExamenStatus(false);
        return;
      }
      
      // Solo proceder si el progreso está completamente cargado
      if (isLoadingProgress) {
        return;
      }
      
      // Solo verificar examen si el progreso es 100%
      if (progressPercentage !== 100) {
        setLoadingExamenStatus(false);
        setHasExamen(false);
        setExamenAprobado(false);
        return;
      }
      
      // Evitar ejecuciones simultáneas
      if (isCheckingExamen.current) {
        return;
      }
      isCheckingExamen.current = true;
      
      setLoadingExamenStatus(true);
      
      // Verificar si viene del examen con resultado
      const examenState = location.state as { 
        certificadoListo?: boolean; 
        aprobado?: boolean; 
        intento?: number;
        nota?: number;
        examenYaAprobado?: boolean;
        mostrarCertificado?: boolean;
        examenFallido?: boolean;
        examenCompletado?: boolean;
      } | undefined;
      
      // Si viene con examenYaAprobado desde la página de examen
      if (examenState?.examenYaAprobado && examenState?.mostrarCertificado) {
        setHasExamen(true);
        setExamenAprobado(true);
        setLoadingExamenStatus(false);
        isCheckingExamen.current = false;
        // Si no viene la nota en state, se cargará en el efecto que rellena nota cuando falta
        setNotaExamenAprobado(examenState.nota ?? null);
        
        console.log('🎓 ESTADO DEL ESTUDIANTE: Evaluación ya aprobada → MOSTRANDO CERTIFICADO');
        
        // Limpiar el state
        navigate(location.pathname, { replace: true, state: {} });
        return;
      }
      
      // Si viene del examen aprobado, usar esos datos INMEDIATAMENTE (optimistic)
      if (examenState?.certificadoListo && examenState?.aprobado) {
        setHasExamen(true);
        setExamenAprobado(true);
        setIntento(examenState.intento || 1);
        setNotaExamenAprobado(examenState.nota ?? null);
        setLoadingExamenStatus(false);
        isCheckingExamen.current = false;
        
        console.log('🎓 ESTADO DEL ESTUDIANTE: Evaluación recién aprobada → MOSTRANDO CERTIFICADO');
        
        // Limpiar el state
        navigate(location.pathname, { replace: true, state: {} });
        
        // NO verificar en segundo plano - confiar en el estado que viene del examen
        return;
      }
      
      // Si viene de un examen fallido, forzar actualización del estado
      if (examenState?.examenFallido || (examenState?.examenCompletado && !examenState?.aprobado)) {
        // Limpiar el state primero
        navigate(location.pathname, { replace: true, state: {} });
        // Continuar con la verificación normal del backend para obtener el estado actualizado
      }
      
      try {
        // Consultar el backend para obtener el estado real
        const examen = await examenService.getExamenByFormacion(courseId);
        
        if (examen) {
          setHasExamen(true);
          
          // Obtener el último intento del usuario
          const ultimoIntento = await examenService.getUltimoIntento(user.uid, courseId);
          
          if (ultimoIntento) {
            // Si hay un intento previo, el siguiente intento es ultimoIntento.intento + 1
            // Si el último intento fue desaprobado, mostrar interfaz de reintento
            setIntento(ultimoIntento.intento + 1);
            setExamenAprobado(ultimoIntento.aprobado);
            if (ultimoIntento.aprobado) {
              setNotaExamenAprobado(ultimoIntento.nota);
            } else {
              setNotaExamenAprobado(null);
            }
            
            // Log del estado del estudiante
            if (ultimoIntento.aprobado) {
              console.log('🎓 ESTADO DEL ESTUDIANTE: Evaluación aprobada → MOSTRANDO CERTIFICADO');
            } else {
              console.log('📝 ESTADO DEL ESTUDIANTE: Curso completado → MOSTRANDO EVALUACIÓN (Intento ' + (ultimoIntento.intento + 1) + ')');
            }
          } else {
            setIntento(1);
            setExamenAprobado(false);
            setNotaExamenAprobado(null);
            console.log('📝 ESTADO DEL ESTUDIANTE: Curso completado → MOSTRANDO EVALUACIÓN (Primer intento)');
          }
        } else {
          setHasExamen(false);
          setExamenAprobado(false);
          setNotaExamenAprobado(null);
          setIntento(1);
          console.log('✅ ESTADO DEL ESTUDIANTE: Curso completado → MOSTRANDO CERTIFICADO (Sin examen)');
        }
      } catch (error) {
        console.error('❌ Error checking examen:', error);
        setHasExamen(false);
        setExamenAprobado(false);
        setNotaExamenAprobado(null);
        setIntento(1);
      } finally {
        setLoadingExamenStatus(false);
        isCheckingExamen.current = false;
      }
    };

    checkExamen();
  }, [progressPercentage, courseId, user?.uid, isLoadingProgress, location.key]);

  // Cargar la nota del examen aprobado cuando falta (ej: usuario entró con "ya aprobado")
  useEffect(() => {
    if (!courseId || !user?.uid || !examenAprobado || !hasExamen || notaExamenAprobado != null || loadingExamenStatus) return;
    const loadNota = async () => {
      try {
        const ultimo = await examenService.getUltimoIntento(user.uid, courseId);
        if (ultimo?.aprobado && ultimo.nota != null) setNotaExamenAprobado(ultimo.nota);
      } catch {
        // ignorar
      }
    };
    loadNota();
  }, [courseId, user?.uid, examenAprobado, hasExamen, notaExamenAprobado, loadingExamenStatus]);

  useEffect(() => {
    if (progressPercentage === 100 && courseData && !hasUserReview) {
      const timer = setTimeout(() => {
        navigate(`/course/${courseId}/review`, { state: { course: courseData } });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progressPercentage, courseData, courseId, navigate, hasUserReview]);
  
  if (isLoadingCourse) {
    return <Loader fullScreen size="lg" showText={true} />;
  }

  if (!courseData) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Formacion no encontrado
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          No pudimos encontrar la formación que buscas.
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
          <div className="mt-1">
            {showFullDescription ? (
              <div className="space-y-2">
                <p 
                  className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words"
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeHTML(courseData.descripcion || '') 
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm text-primary hover:text-primary/80 p-0 h-auto"
                  onClick={() => setShowFullDescription(false)}
                >
                  Ver menos
                </Button>
              </div>
            ) : (
              <div>
                <p 
                  className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words"
                  dangerouslySetInnerHTML={{ 
                    __html: courseData.descripcion && courseData.descripcion.length > 200
                      ? sanitizeHTML(courseData.descripcion.substring(0, 200) + '...')
                      : sanitizeHTML(courseData.descripcion || '')
                  }}
                />
                {courseData.descripcion && courseData.descripcion.length > 200 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm text-primary hover:text-primary/80 p-0 h-auto mt-1"
                    onClick={() => setShowFullDescription(true)}
                  >
                    Ver más
                  </Button>
                )}
              </div>
            )}
          </div>
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

      {/* PANEL DE PROGRESO GENERAL */}
      {isLoadingProgress && !isLoadingModules && modules.length > 0 ? (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="text-center sm:text-right flex-shrink-0">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-8 w-8 mx-auto" />
              </div>
            </div>
            <Skeleton className="mt-4 h-3 w-full" />
          </CardHeader>
        </Card>
      ) : (
        totalContents > 0 && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl break-words text-gray-900 dark:text-gray-100">
                  Progreso de la formación
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
              className={`mt-4 h-2 sm:h-3 ${getProgressColorClass(progressPercentage)}`}
            />
          </CardHeader>
        </Card>
        )
      )}

      {/* LOADING EXAMEN STATUS */}
      {progressPercentage === 100 && loadingExamenStatus && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-4 sm:p-6 text-center">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400 animate-spin" />
            <h3 className="font-semibold mb-2 text-sm sm:text-base text-gray-600">
              Verificando estado de evaluación...
            </h3>
          </CardContent>
        </Card>
      )}

      {/* EVALUACIÓN */}
      {progressPercentage === 100 && !loadingExamenStatus && hasExamen && !examenAprobado && (
        <Card className={`border-2 ${intento === 1 ? 'border-primary' : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'}`}>
          <CardContent className="p-4 sm:p-6 text-center">
            <Trophy className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${intento === 1 ? 'text-primary' : 'text-orange-600 dark:text-orange-400'}`} />
            <h3 className="font-semibold mb-2 text-sm sm:text-base">
              Evaluación Final
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4">
              {intento === 1 
                ? "Has completado todos los módulos. Ahora debes aprobar la evaluación final (nota mínima 70%) para obtener tu certificado."
                : `El intento anterior no alcanzó el 70% requerido. No te preocupes, puedes intentarlo nuevamente todas las veces que necesites. Este sería tu intento número ${intento}.`
              }
            </p>
            <Button
              variant="default"
              onClick={() => navigate(`/curso/${courseId}/examen`)}
              className={`w-full sm:w-auto text-sm sm:text-base ${intento > 1 ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
            >
              {intento === 1 ? "Realizar Evaluación" : `Reintentar Examen (Intento ${intento})`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* CERTIFICADO */}
      {progressPercentage === 100 && !loadingExamenStatus && (!hasExamen || examenAprobado) && (
        <Card className="border-2 border-solid border-green-500 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardContent className="p-4 sm:p-6 text-center">
            <Award className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 text-green-600 dark:text-green-400 animate-pulse" />
            <h3 className="font-bold text-lg sm:text-xl mb-2 text-green-800 dark:text-green-300">
              🎉 Certificado de Finalización Disponible
            </h3>
            {hasExamen && examenAprobado && (
              <p className="text-sm sm:text-base font-semibold text-green-700 dark:text-green-400 mb-2">
                Examen final aprobado — Nota: {notaExamenAprobado != null ? `${notaExamenAprobado.toFixed(1)}%` : '—'}
              </p>
            )}
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 mb-4 font-medium">
              {hasExamen && examenAprobado
                ? "¡Excelente! Has completado el curso y aprobado la evaluación final. Tu certificado está listo."
                : "¡Excelente! Has completado el curso. Tu certificado está listo."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                variant="default"
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-base bg-green-600 hover:bg-green-700 font-semibold"
                onClick={handleDownloadCertificate}
              >
                <Award className="w-4 h-4 mr-2" />
                Descargar Certificado
              </Button>
              {hasExamen && examenAprobado && (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-sm sm:text-base border-green-600 text-green-700 hover:bg-green-50 dark:text-green-400 dark:border-green-500 dark:hover:bg-green-900/20"
                  onClick={handleVerExamenRealizado}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ver examen realizado
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}


      {/* MÓDULOS */}
      <div className="space-y-3 sm:space-y-4">
        {isLoadingModules ? (
          <div className="flex justify-center items-center h-full mt-40">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : isLoadingProgress && modules.length > 0 ? (
          // Skeleton de toda la formación mientras carga el progreso
          modules.map((module) => {
            const moduleContents = module.contenido
              ? module.contenido.filter(c => c.tipo_contenido !== "contenido_extra")
              : [];
            
            return (
              <Card
                key={module.id}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-2 w-full mt-2" />
                    </div>
                    <Skeleton className="h-5 w-5 flex-shrink-0 mt-1" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 mt-2 p-4 sm:p-6 sm:pt-0 space-y-2 sm:space-y-3">
                  {moduleContents.map((_, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <Skeleton className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-4 w-16 flex-shrink-0" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })
        ) : (
          modules.map((module) => {
            // Filtrar contenidos del módulo excluyendo contenido_extra
            const moduleContents = module.contenido
              ? module.contenido.filter(c => c.tipo_contenido !== "contenido_extra")
              : [];
            
            const moduleTotalCount = moduleContents.length;
            
            const moduleCompletedCount = moduleContents
              .map((_, index) => {
                // Encontrar el índice real en el array original
                const originalIndex = module.contenido?.indexOf(moduleContents[index]) ?? -1;
                const contentKey = `${module.id}-${originalIndex}`;
                return completedContents.has(contentKey);
              })
              .filter(Boolean).length;
            
            const moduleProgress = moduleTotalCount > 0
              ? Math.round((moduleCompletedCount / moduleTotalCount) * 100)
              : 0;

            const isModuleCompleted = moduleProgress === 100;

            return (
              <Card
                key={module.id}
                ref={(el) => (moduleRefs.current[module.id] = el)}
                className={`${
                  isModuleCompleted
                    ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                } transition-colors`}
              >
                <Collapsible
                  open={expandedModules.has(module.id)}
                  onOpenChange={() => toggleModule(module.id)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className={`cursor-pointer transition-colors p-4 sm:p-6 ${
                      isModuleCompleted
                        ? "hover:bg-green-100 dark:hover:bg-green-900/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-2">
                              <CardTitle className={`text-base sm:text-lg break-words ${
                                isModuleCompleted ? "text-green-700 dark:text-green-400" : ""
                              }`}>
                                {module.titulo}
                              </CardTitle>
                              {isModuleCompleted && (
                                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                              )}
                            </div>
                            {moduleTotalCount > 0 && (
                              <Badge
                                variant={isModuleCompleted ? "default" : "secondary"}
                                className={`self-start text-xs sm:text-sm ${
                                  isModuleCompleted
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : ""
                                }`}
                              >
                                {moduleCompletedCount}/{moduleTotalCount}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2">
                            {expandedDescriptions.has(module.id) ? (
                              <div className="space-y-2">
                                <p 
                                  className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words whitespace-pre-line leading-relaxed"
                                  dangerouslySetInnerHTML={{ 
                                    __html: sanitizeHTML(module.descripcion || '') 
                                  }}
                                />
                                {module.descripcion && module.descripcion.length > 200 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs sm:text-sm text-primary hover:text-primary/80 p-0 h-auto"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedDescriptions((prev) => {
                                        const newSet = new Set(prev);
                                        newSet.delete(module.id);
                                        return newSet;
                                      });
                                    }}
                                  >
                                    Ver menos
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div>
                                <p 
                                  className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words whitespace-pre-line leading-relaxed"
                                  dangerouslySetInnerHTML={{ 
                                    __html: module.descripcion && module.descripcion.length > 200
                                      ? sanitizeHTML(module.descripcion.substring(0, 200) + '...')
                                      : sanitizeHTML(module.descripcion || '')
                                  }}
                                />
                                {module.descripcion && module.descripcion.length > 200 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs sm:text-sm text-primary hover:text-primary/80 p-0 h-auto mt-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedDescriptions((prev) => {
                                        const newSet = new Set(prev);
                                        newSet.add(module.id);
                                        return newSet;
                                      });
                                    }}
                                  >
                                    Ver más
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          <Progress
                            value={moduleProgress}
                            className={`h-2 mt-2 ${getProgressColorClass(moduleProgress)}`}
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

      <VerExamenRealizadoModal
        open={showVerExamenModal}
        onOpenChange={setShowVerExamenModal}
        cursoId={courseId || ""}
        examen={examenParaModal}
        examenRealizado={examenRealizadoParaModal}
        loading={loadingVerExamen}
      />
    </div>
  );
};

export default CourseDetail;