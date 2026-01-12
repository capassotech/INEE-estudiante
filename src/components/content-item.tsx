import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  FileText,
  Download,
  CheckCircle,
  Clock,
  HelpCircle,
  FileImage,
  BookOpen,
} from "lucide-react";
import { ContentItem as ContentItemType } from "@/types/types";
import { ImageWithPlaceholder } from "@/components/ImageWithPlaceholder";

interface ContentItemProps {
  content: ContentItemType;
  contentIndex: number;
  onToggleComplete: (contentIndex: number) => void;
  onContentClick: (content: ContentItemType) => void;
}

const ContentItem = ({
  content,
  contentIndex,
  onToggleComplete,
  onContentClick,
}: ContentItemProps) => {

  const getIcon = () => {
    switch (content.tipo_contenido) {
      case "video":
        return <Play className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "pdf":
        return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "contenido_extra":
        return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (content.tipo_contenido) {
      case "video":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pdf":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "contenido_extra":
        return "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  const handleActionClick = () => {
    if (content.tipo_contenido === "video") {
      onContentClick(content);
    } else if (content.tipo_contenido === "pdf") {
      onContentClick(content);
    } else {
      const url = content.url_contenido ||
        (content.urls_contenido && content.urls_contenido.length > 0
          ? content.urls_contenido[0]
          : null);
      if (url) {
        window.open(url, "_blank");
      }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {content.tipo_contenido !== "contenido_extra" && (
            <button
              onClick={() =>
                onToggleComplete(contentIndex)
              }
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0 
                ${content.completed
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-gray-400 text-gray-400 hover:border-green-400"
                }`}
            >
              {content.completed ? (
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              ) : (
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-transparent" />
              )}
            </button>
          )}
          <div className="flex-shrink-0">
            {content.tipo_contenido === "video" ? (
              <div
                className="relative cursor-pointer"
                onClick={handleActionClick}
              >
                {content.url_miniatura ? (
                  <img src={content.url_miniatura || "/placeholder.svg"} alt={content.titulo} className="w-12 h-9 sm:w-16 sm:h-12 rounded" />
                ) : (
                  <ImageWithPlaceholder
                    src={content.url_miniatura || "/placeholder.svg"}
                    alt={content.titulo}
                    className="w-12 h-9 sm:w-16 sm:h-12 rounded"
                    aspectRatio="auto"
                    style={{ width: '3rem', height: '2.25rem' }}
                    placeholderIcon="image"
                    placeholderText=""
                  />
                )}
                <div className="absolute inset-0 bg-black/30 rounded flex items-center justify-center z-10">
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              </div>
            ) : (
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${getTypeColor()}`}
              >

                {content.url_miniatura ? (
                  <img src={content.url_miniatura || "/placeholder.svg"} alt={content.titulo} className="w-12 h-9 sm:w-16 sm:h-12 rounded" />
                ) : (
                  <>
                    {getIcon()}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
              <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">
                {content.titulo}
              </h4>
              <Badge
                variant="outline"
                className={`${getTypeColor()} text-xs self-start sm:self-center flex-shrink-0`}
              >
                {content.tipo_contenido}
              </Badge>
            </div>
            {content.descripcion && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2 break-words">
                {content.descripcion}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end sm:justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={handleActionClick}
            className="text-xs sm:text-sm bg-transparent"
          >
            {content.tipo_contenido === "video" ? (
              <>
                <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span>Ver</span>
              </>
            ) : (
              <>
              {content.tipo_contenido === "contenido_extra" ? (
                <>
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>Descargar</span>
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>Abrir</span>
                </>
              )}
              </>
            )}
          </Button>
        </div>
      </div>

      {content.urls_bibliografia && content.urls_bibliografia.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800/50 rounded-b-lg">
          <div className="p-3 sm:p-4">
            <div className="flex items-start gap-2.5 mb-3">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h5 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Bibliografía Complementaria
                </h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Material adicional para profundizar en el tema
                </p>
              </div>
            </div>
            
            {/* Si es un array, mostrar cada archivo */}
            {Array.isArray(content.urls_bibliografia) ? (
              <div className="space-y-2">
                {content.urls_bibliografia.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">
                        Bibliografía {index + 1}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(url, "_blank")}
                      className="flex-shrink-0 h-7 px-2 sm:px-3 text-xs text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                      <span className="hidden sm:inline">Descargar</span>
                      <span className="sm:hidden">PDF</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              // Si es un string, mostrar un solo botón
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(content.urls_bibliografia as string, "_blank")}
                  className="flex-shrink-0 h-8 px-3 text-xs sm:text-sm text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 transition-colors hover:border-none"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                  <span className="hidden sm:inline">Descargar</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentItem;
