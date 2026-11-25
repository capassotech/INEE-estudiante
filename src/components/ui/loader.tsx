import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  /** Se mantiene por compatibilidad; el loader tiene un único tamaño */
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  showText?: boolean;
  message?: string;
  delayedMessage?: string;
  /** ms hasta mostrar el mensaje secundario */
  delay?: number;
}

/**
 * Mismo loader que el panel de administración.
 * Velo difuminado + tarjeta con el logo, halo con los colores de la marca y barra indeterminada.
 * El fade-in arranca con un pequeño delay para que las cargas rápidas no parpadeen (estilos en index.css).
 */
export function Loader({
  className,
  fullScreen = false,
  showText = true,
  message = "Cargando",
  delayedMessage = "Está tardando más de lo habitual, aguardá un momento.",
  delay = 5000,
}: LoaderProps) {
  const [showDelayed, setShowDelayed] = useState(false);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const messageTimer = setTimeout(() => setShowDelayed(true), delay);
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev === "..." ? "" : prev + "."));
    }, 500);
    return () => {
      clearTimeout(messageTimer);
      clearInterval(dotsInterval);
    };
  }, [delay]);

  // Sin tarjeta: el contenido va directo sobre el fondo. En pantalla completa el fondo se oscurece,
  // así que se usan el logo y los textos en blanco.
  const onDark = fullScreen;

  const content = (
    <div className="loader-card relative flex w-[300px] max-w-[calc(100vw-2rem)] flex-col items-center gap-6">
      <div className="loader-halo absolute -inset-10 rounded-full" aria-hidden="true" />

      <div className="loader-logo relative">
        {onDark ? (
          <img src="/logo-blanco.png" alt="INEE" className="h-14 w-auto select-none" draggable={false} />
        ) : (
          <>
            {/* Logo según el tema (el campus tiene modo oscuro; en la tienda siempre es el claro) */}
            <img src="/logo.png" alt="INEE" className="h-14 w-auto select-none dark:hidden" draggable={false} />
            <img src="/logo-blanco.png" alt="INEE" className="hidden h-14 w-auto select-none dark:block" draggable={false} />
          </>
        )}
        <div
          className="loader-logo-shine absolute inset-0"
          aria-hidden="true"
          style={onDark ? { WebkitMaskImage: "url(/logo-blanco.png)", maskImage: "url(/logo-blanco.png)" } : undefined}
        />
      </div>

      <div className="relative flex w-full flex-col items-center gap-4">
        <div className={cn("h-1 w-full overflow-hidden rounded-full", onDark ? "bg-white/15" : "bg-primary/10")}>
          <div className="loader-bar h-full w-2/5 rounded-full" />
        </div>

        {showText && (
          <div className="flex flex-col items-center gap-1.5 text-center">
            <p className={cn("text-base font-semibold", onDark ? "text-white" : "text-gray-900")}>
              {message}
              {/* Ancho fijo para que el texto no se mueva mientras cambian los puntos */}
              <span className="inline-block w-4 text-left">{dots}</span>
            </p>
            {showDelayed && (
              <p className={cn("loader-delayed text-xs leading-relaxed", onDark ? "text-white/70" : "text-gray-500")}>
                {delayedMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (!fullScreen) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)} role="status" aria-live="polite">
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "loader-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {content}
    </div>
  );
}
