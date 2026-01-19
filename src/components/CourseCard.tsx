import { Course } from "@/types/types";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithPlaceholder } from "@/components/ImageWithPlaceholder";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CourseCardProps {
    course: Course;
    progress?: number;
}

export default function CourseCard({ course, progress }: CourseCardProps) {
    const navigate = useNavigate();

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

    const isCompleted = typeof progress === 'number' && progress === 100;

    return (
        <Card
            key={course.id}
            className={`${
                isCompleted
                    ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            } hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer`}
            onClick={() => navigate(`/curso/${course.id}`)}
        >
            <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="w-full sm:w-48 md:w-64 lg:w-80 relative overflow-hidden flex-shrink-0 aspect-video">
                    <ImageWithPlaceholder
                        src={course.imagen || "/placeholder.svg"}
                        alt={course.titulo}
                        className="rounded-none transition-transform hover:scale-105 w-full h-full"
                        aspectRatio="video"
                        placeholderIcon="book"
                        placeholderText=""
                    />
                </div>
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
                    <div className="mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-bold text-sm sm:text-base break-words leading-tight ${
                                isCompleted 
                                    ? "text-green-700 dark:text-green-400" 
                                    : "text-gray-900 dark:text-gray-100"
                            }`}>
                                {course.titulo}
                            </h3>
                            {isCompleted && (
                                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 break-words leading-snug">
                            {course.descripcion}
                        </p>
                    </div>
                    <div>
                        {typeof progress === 'number' && (
                            <div className="mb-2">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        Progreso
                                    </span>
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {Math.round(progress)}%
                                    </span>
                                </div>
                                <Progress
                                    value={Math.round(progress)}
                                    className={`h-1.5 sm:h-2 ${getProgressColorClass(Math.round(progress))}`}
                                />
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {course.nivel}
                                </span>
                                <span className="text-xs whitespace-nowrap text-gray-600 dark:text-gray-400">
                                    {course.id_modulos?.length || 0} módulos
                                </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 self-end sm:self-center" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}