import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

const PDFModal = ({ isOpen, onClose, pdfUrl, title }: PDFModalProps) => {
  // Detectar si es URL de Firebase Storage para usar Google Docs Viewer por defecto
  const isFirebaseStorage = pdfUrl.includes('firebasestorage.googleapis.com') || pdfUrl.includes('firebase');
  const [viewMode, setViewMode] = useState<'iframe' | 'google'>(isFirebaseStorage ? 'google' : 'iframe');
  const [iframeError, setIframeError] = useState(false);
  
  const handleOpenExternal = () => {
    if (!pdfUrl) {
      console.error("❌ No hay URL para abrir");
      return;
    }
    console.log("🔗 Abriendo PDF en nueva pestaña:", pdfUrl);
    window.open(pdfUrl, '_blank');
  };

  const handleDownload = () => {
    if (!pdfUrl) {
      console.error("❌ No hay URL para descargar");
      return;
    }
    console.log("⬇️ Descargando PDF:", pdfUrl);
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title || 'documento.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convertir URL para Google Docs Viewer
  const getGoogleDocsViewerUrl = (url: string) => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  const displayUrl = viewMode === 'google' ? getGoogleDocsViewerUrl(pdfUrl) : pdfUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] px-1 pt-0 pb-1 flex flex-col">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate pr-4">
              {title.length > 60 ? title.substring(0, 60) + "..." : title}
            </DialogTitle>
            <div className="flex items-center gap-2 mr-7">
              {iframeError && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'iframe' ? 'google' : 'iframe')}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {viewMode === 'iframe' ? 'Visor Google' : 'Visor Directo'}
                  </span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
                disabled={!pdfUrl}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Descargar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenExternal}
                className="flex items-center gap-2"
                disabled={!pdfUrl}
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Abrir</span>
              </Button>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Visualizador de documento PDF
          </DialogDescription>
        </DialogHeader>

        
        <div className="h-full">
          {!pdfUrl ? (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  No se encontró la URL del documento
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Este contenido no tiene un archivo asociado. Por favor, contacta al administrador.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <iframe
                src={displayUrl}
                className="w-full h-full border-0"
                title={title}
                loading="lazy"
                onError={() => {
                  console.error("❌ Error al cargar PDF en iframe");
                  setIframeError(true);
                  if (viewMode === 'iframe') {
                    setViewMode('google');
                  }
                }}
              />
              {iframeError && viewMode === 'google' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-90">
                  <div className="text-center p-8 max-w-md">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      No se pudo cargar la vista previa
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Puedes descargar el documento o abrirlo en una nueva pestaña.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleDownload} variant="default">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                      <Button onClick={handleOpenExternal} variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir en nueva pestaña
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFModal;
