import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Video as VideoIcon } from "lucide-react";
import { useState } from "react";

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
 * Convierte una URL de video a formato embed
 * Soporta varios formatos:
 * YouTube:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID?si=...
 * - https://youtu.be/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * Vimeo:
 * - https://vimeo.com/VIDEO_ID
 * - https://player.vimeo.com/video/VIDEO_ID
 */
const convertToEmbedUrl = (url: string): { embedUrl: string; platform: 'youtube' | 'vimeo' | 'other' } => {
  if (!url) return { embedUrl: url, platform: 'other' };
  
  try {
    const urlObj = new URL(url);
    
    // YouTube
    if (urlObj.hostname.includes('youtube.com')) {
      // Si ya es embed
      if (url.includes('youtube.com/embed/')) {
        return { embedUrl: url, platform: 'youtube' };
      }
      
      // Caso: /live/VIDEO_ID
      const liveMatch = urlObj.pathname.match(/\/live\/([^/?]+)/);
      if (liveMatch) {
        return { 
          embedUrl: `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=0&rel=0`, 
          platform: 'youtube' 
        };
      }
      
      // Caso: /watch?v=VIDEO_ID
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return { 
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`, 
          platform: 'youtube' 
        };
      }
    }
    
    // YouTube corto: youtu.be
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.substring(1); // Remover el "/" inicial
      if (videoId) {
        return { 
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`, 
          platform: 'youtube' 
        };
      }
    }
    
    // Vimeo
    if (urlObj.hostname.includes('vimeo.com')) {
      // Si ya es player.vimeo
      if (url.includes('player.vimeo.com/video/')) {
        return { embedUrl: url, platform: 'vimeo' };
      }
      
      // Caso: vimeo.com/VIDEO_ID
      const vimeoMatch = urlObj.pathname.match(/\/(\d+)/);
      if (vimeoMatch) {
        return { 
          embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`, 
          platform: 'vimeo' 
        };
      }
    }
    
    // Si no se pudo convertir, retornar la URL original
    return { embedUrl: url, platform: 'other' };
  } catch (error) {
    // Si hay error al parsear la URL, retornar la original
    console.warn('Error al convertir URL de video:', error);
    return { embedUrl: url, platform: 'other' };
  }
};

const VideoModal = ({ isOpen, onClose, content }: VideoModalProps) => {
  const [videoError, setVideoError] = useState(false);
  
  if (!content) return null;
  
  const { embedUrl, platform } = convertToEmbedUrl(content.url);

  const handleOpenExternal = () => {
    if (!content.url) {
      console.error("❌ No hay URL para abrir");
      return;
    }
    window.open(content.url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold pr-8">
              {content.title}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenExternal}
              className="flex items-center gap-2 mr-7"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Abrir en {
                platform === 'youtube' ? 'YouTube' : 
                platform === 'vimeo' ? 'Vimeo' : 
                'nueva pestaña'
              }</span>
            </Button>
          </div>
          <DialogDescription className="sr-only">
            Reproductor de video del curso
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            {!videoError ? (
              <iframe
                src={embedUrl}
                title={content.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                onError={() => {
                  console.error("❌ Error al cargar video");
                  setVideoError(true);
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center p-8">
                  <VideoIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-white mb-2">
                    No se pudo cargar el video
                  </p>
                  <p className="text-sm text-gray-300 mb-4">
                    Puedes intentar abrirlo directamente en {
                      platform === 'youtube' ? 'YouTube' : 
                      platform === 'vimeo' ? 'Vimeo' : 
                      'el sitio original'
                    }
                  </p>
                  <Button onClick={handleOpenExternal} variant="default">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir video
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="space-y-3">
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
