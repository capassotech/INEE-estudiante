import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, BookOpen, Clock, Trophy, ChevronRight } from "lucide-react";

const Curso = () => {
  const navigate = useNavigate();
  const stats = [
    { label: "Contenidos completados", value: "3/17", progress: 18 },
    { label: "Tiempo de cursado", value: "10.5h", progress: 18 },
    { label: "Módulos completados", value: "1/6", progress: 16 },
  ];
  const recentActivity = [
    {
      type: "class",
      title: "Anatomía del esqueleto humano",
      module: "Módulo 1",
      duration: "70 min",
    },
    {
      type: "theory",
      title: "Anatomía del esqueleto humano",
      unit: "Módulo 1",
      readTime: "30 min",
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary mb-3 sm:mb-4">
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary break-words">
          Instructorado de fitness grupal
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto break-words">
          Contenido organizado por módulos con videos, PDFs y evaluaciones
        </p>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-background border-border shadow-lg">
            <CardHeader className="pb-2 p-4 sm:p-6 sm:pb-2">
              <CardDescription className="text-xs sm:text-sm">
                {stat.label}
              </CardDescription>
              <CardTitle className="text-xl sm:text-2xl">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <Progress value={stat.progress} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="bg-primary text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          onClick={() => navigate("/curso/fitness-grupal")}
        >
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  Módulos de la formación
                </CardTitle>
                <CardDescription className="text-white/80 text-sm sm:text-base break-words">
                  Accede a todo el contenido organizado
                </CardDescription>
              </div>
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            </div>
          </CardHeader>
        </Card>
        <Card
          className="bg-black text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          onClick={() => navigate("/teoria")}
        >
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  Material Teórico
                </CardTitle>
                <CardDescription className="text-white/80 text-sm sm:text-base break-words">
                  PDFs y documentos complementarios
                </CardDescription>
              </div>
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
          {recentActivity.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.type === "class"
                      ? "bg-primary/10 dark:bg-primary/20 text-primary"
                      : "bg-black/10 dark:bg-white/10 text-black dark:text-white"
                  }`}
                >
                  {item.type === "class" ? (
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">
                    {item.title}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {item.type === "class" ? item.module : item.unit}
                  </p>
                </div>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 self-start sm:self-center whitespace-nowrap">
                {item.type === "class" ? item.duration : item.readTime}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-primary text-white border-0 shadow-lg">
        <CardHeader className="text-center p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">
            ¿Listo para continuar aprendiendo?
          </CardTitle>
          <CardDescription className="text-white/80 text-sm sm:text-base break-words">
            Accede a todo tu contenido educativo en formato modular
          </CardDescription>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
            <Button
              variant="secondary"
              onClick={() => navigate("/curso/fitness-grupal")}
              className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto"
            >
              Ver Módulos
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/teoria")}
              className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
            >
              Material Teórico
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Curso;
