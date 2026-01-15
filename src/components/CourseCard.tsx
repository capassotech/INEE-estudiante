import { Course } from "@/types/types";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithPlaceholder } from "@/components/ImageWithPlaceholder";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function CourseCard({ course }: { course: Course }) {
    const navigate = useNavigate();

    return (
        <Card
            key={course.id}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
            onClick={() => navigate(`/curso/${course.id}`)}
        >
            <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/3 h-40 sm:h-32 md:h-40 relative overflow-hidden flex-shrink-0">
                    <ImageWithPlaceholder
                        src={course.imagen || "/placeholder.svg"}
                        alt={course.titulo}
                        className="rounded-none transition-transform hover:scale-105"
                        aspectRatio="auto"
                        style={{ width: '100%', height: '100%' }}
                        placeholderIcon="book"
                        placeholderText=""
                    />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                    <div className="mb-3 sm:mb-4">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 break-words">
                            {course.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 break-words">
                            {course.descripcion}
                        </p>
                    </div>
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full whitespace-nowrap">
                                    {course.nivel}
                                </span>
                                <span className="text-xs whitespace-nowrap">
                                    {course.id_modulos?.length || 0} módulos
                                </span>
                            </div>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 self-end sm:self-center" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}