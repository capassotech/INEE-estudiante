import React, { useState } from "react";
import { Book, Image as ImageIcon } from "lucide-react";

interface ImageWithPlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: "video" | "square" | "a4" | "auto";
  placeholderIcon?: "book" | "image";
  placeholderText?: string;
  style?: React.CSSProperties;
}

export const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  src,
  alt,
  className = "",
  aspectRatio = "video",
  placeholderIcon = "book",
  placeholderText = "Formación",
  style,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "video":
        return "aspect-video"; // 16:9
      case "square":
        return "aspect-square"; // 1:1
      case "a4":
        return ""; // Usaremos aspect-ratio CSS personalizado para A4 (1:1.414)
      default:
        return "";
    }
  };

  const aspectClass = getAspectClass();
  
  // Estilo inline para A4 si es necesario
  const a4Style = aspectRatio === "a4" 
    ? { aspectRatio: "1 / 1.414", ...style } 
    : style;

  const IconComponent = placeholderIcon === "book" ? Book : ImageIcon;

  return (
    <div className={`relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 rounded-lg overflow-hidden ${aspectClass} ${className}`} style={a4Style}>
      {/* Skeleton loader mientras carga */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
                <IconComponent className="w-10 h-10 text-gray-600" />
              </div>
              <div className="h-2 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Imagen */}
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        decoding="async"
        onLoad={() => setImageLoaded(true)}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          setImageError(true);
          setImageLoaded(true);
          if (!target.src.endsWith("/placeholder.svg")) {
            target.src = "/placeholder.svg";
          }
        }}
      />

      {/* Placeholder si hay error */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-3 shadow-lg">
            <IconComponent className="w-10 h-10 text-gray-600" />
          </div>
          {placeholderText && (
            <div className="text-sm font-medium text-gray-700">{placeholderText}</div>
          )}
        </div>
      )}
    </div>
  );
};

