import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: string;
    title: string;
    description?: string;
    url: string;
    duration?: string;
    thumbnail?: string;
    topics?: string[];
  } | null;
}

/**
 * Convierte una URL de YouTube a formato embed
 * Soporta varios formatos:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID?si=...
 * - https://youtu.be/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
const convertToYouTubeEmbed = (url: string): string => {
  if (!url) return url;
  
  // Si ya es una URL de embed, retornarla tal cual
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    
    // Para URLs tipo: youtube.com/watch?v=VIDEO_ID o youtube.com/live/VIDEO_ID
    if (urlObj.hostname.includes('youtube.com')) {
      // Caso: /live/VIDEO_ID
      const liveMatch = urlObj.pathname.match(/\/live\/([^/?]+)/);
      if (liveMatch) {
        return `https://www.youtube.com/embed/${liveMatch[1]}`;
      }
      
      // Caso: /watch?v=VIDEO_ID
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Para URLs tipo: youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.substring(1); // Remover el "/" inicial
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Si no se pudo convertir, retornar la URL original
    return url;
  } catch (error) {
    // Si hay error al parsear la URL, retornar la original
    console.warn('Error al convertir URL de YouTube:', error);
    return url;
  }
};

const VideoModal = ({ isOpen, onClose, content }: VideoModalProps) => {
  if (!content) return null;
  
  const embedUrl = convertToYouTubeEmbed(content.url);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold pr-8">
              {content.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              title={content.title}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>

          {/* Video Info */}
          <div className="space-y-3">
            {content.duration && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <Clock className="w-4 h-4" />
                <span>Duración: {content.duration}</span>
              </div>
            )}

            {content.description && (
              <div>
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {content.description}
                </p>
              </div>
            )}

            {content.topics && content.topics.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Temas tratados</h3>
                <div className="flex flex-wrap gap-2">
                  {content.topics.map((topic, index) => (
                    <Badge key={index} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
