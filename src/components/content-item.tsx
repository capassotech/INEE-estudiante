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
  console.log(`🎨 ContentItem rendering:`, {
    titulo: content.titulo,
    index: contentIndex,
    completed: content.completed
  });
  
  const getIcon = () => {
    switch (content.tipo_contenido) {
      case "VIDEO":
        return <Play className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "PDF":
        return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "DOCX":
        return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "QUIZ":
        return <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "IMAGE":
        return <FileImage className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (content.tipo_contenido) {
      case "VIDEO":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "PDF":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "DOCX":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "QUIZ":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "IMAGE":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleActionClick = () => {
    if (content.tipo_contenido.toUpperCase() === "VIDEO") {
      onContentClick(content);
    } else if (content.tipo_contenido.toUpperCase() === "PDF") {
      onContentClick(content);
    } else {
      // Para DOCX, XLSX, PPTX, etc., abrir en nueva pestaña
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
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
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

        <div className="flex-shrink-0">
          {content.tipo_contenido === "VIDEO" && content.url_miniatura ? (
            <div
              className="relative cursor-pointer"
              onClick={handleActionClick}
            >
              <ImageWithPlaceholder
                src={content.url_miniatura || "/placeholder.svg"}
                alt={content.titulo}
                className="w-12 h-9 sm:w-16 sm:h-12 rounded"
                aspectRatio="auto"
                style={{ width: '3rem', height: '2.25rem' }}
                placeholderIcon="image"
                placeholderText=""
              />
              <div className="absolute inset-0 bg-black/30 rounded flex items-center justify-center z-10">
                <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>
          ) : (
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${getTypeColor()}`}
            >
              {getIcon()}
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
          {content.tipo_contenido === "VIDEO" ? (
            <>
              <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span>Ver</span>
            </>
          ) : (
            <>
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span>Abrir</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ContentItem;
