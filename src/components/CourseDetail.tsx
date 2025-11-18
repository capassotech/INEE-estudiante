import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Course, Module, ContentItem as ContentItemType } from "@/types/types";
import courseService from "@/services/courseService";
import { ImageWithPlaceholder } from "@/components/ImageWithPlaceholder";

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [completedContents, setCompletedContents] = useState<string[]>([]);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(null);
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
    if (courseData) {
      const fetchModules = async () => {
        const modules = await courseService.getAllModules(courseData.id_modulos);
        setModules(modules || []);
        setIsLoadingModules(false);
      };
      fetchModules();
    }
  }, [courseData]);

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

  const toggleContentComplete = (contentId: string) => {
    setCompletedContents((prev) =>
      prev.includes(contentId)
        ? prev.filter((id) => id !== contentId)
        : [...prev, contentId]
    );
  };

  const handleContentClick = (content: ContentItemType) => {
    if (content.tipo_contenido.toUpperCase() === "PDF") {
      setSelectedContent(content);
      setPdfModalOpen(true);
    } else {
      console.log(content);
    }
  };

  const closePdfModal = () => {
    setPdfModalOpen(false);
    setSelectedContent(null);
  };

  const totalContents = modules.reduce(
    (acc, m) => acc + (m.contenido?.length || 0),
    0
  );
  const completedCount = completedContents.length;
  const progressPercentage =
    totalContents > 0 ? Math.round((completedCount / totalContents) * 100) : 0;
  useEffect(() => {
    if (progressPercentage === 100 && courseData) {
      const timer = setTimeout(() => {
        navigate(`/course/${courseId}/review`, { state: { course: courseData } });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progressPercentage, courseData, courseId, navigate]);
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
              disabled={progressPercentage < 100}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {progressPercentage === 100
                ? "Descargar Certificado"
                : "Certificado Bloqueado"}
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
              ? module.contenido.filter((c) =>
                completedContents.includes(c.id || c.titulo)
              ).length
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
                        module.contenido.map((content) => (
                          <ContentItem
                            key={content.id || content.titulo}
                            content={{
                              ...content,
                              completed: completedContents.includes(
                                content.id || content.titulo
                              ),
                            }}
                            onToggleComplete={() =>
                              toggleContentComplete(content.id || content.titulo)
                            }
                            onContentClick={handleContentClick}
                          />
                        ))
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

      {selectedContent && (
        <PDFModal
          isOpen={pdfModalOpen}
          onClose={closePdfModal}
          pdfUrl={selectedContent.url_contenido}
          title={selectedContent.titulo}
        />
      )}
    </div>
  );
};

export default CourseDetail;
