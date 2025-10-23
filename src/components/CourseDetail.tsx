import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ContentItemComponent from "@/components/content-item";
import { Course, Module } from "@/types/types";
import courseService from "@/services/courseService";

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

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
      <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 rounded-lg overflow-hidden">
        <img
          src={
            // eslint-disable-next-line no-constant-binary-expression
            courseData.imagen ||
            "/placeholder.svg?height=256&width=512&query=course image" ||
            "/placeholder.svg"
          }
          alt={courseData.titulo}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4">
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
      <div className="space-y-3 sm:space-y-4">
        {isLoadingModules ? (
          <div className="flex justify-center items-center h-full mt-40">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : modules.map((module) => {
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
                              {module.contenido.length} elementos
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words">
                          {module.descripcion}
                        </p>
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
                          <ContentItemComponent
                            key={content.titulo + " " + content.descripcion}
                            content={content}
                            onToggleComplete={() => {}}
                            onContentClick={() => {console.log(content)}}
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
        })}
      </div>
    </div>
  );
};

export default CourseDetail;
