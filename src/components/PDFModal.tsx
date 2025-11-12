import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

const PDFModal = ({ isOpen, onClose, pdfUrl, title }: PDFModalProps) => {
  const handleOpenExternal = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] px-1 pt-0 pb-1 flex flex-col">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate pr-4">
              {title.length > 60 ? title.substring(0, 60) + "..." : title}
            </DialogTitle>
            <div className="flex items-center gap-2 mr-7">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenExternal}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Abrir</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        
        <div className="h-full">
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={title}
              loading="lazy"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFModal;
