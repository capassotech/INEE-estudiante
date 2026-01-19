import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  showText?: boolean;
}

export function Loader({ 
  className, 
  size = "md", 
  fullScreen = false,
  showText = true 
}: LoaderProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const particleDistance = {
    sm: "48px",
    md: "72px",
    lg: "96px",
  };

  const containerClasses = fullScreen
    ? "min-h-screen flex items-center justify-center bg-background"
    : "flex items-center justify-center";

  return (
    <div className={cn(containerClasses, className)}>
      <div className="relative flex flex-col items-center justify-center">
        {/* Anillo exterior giratorio */}
        <div 
          className="absolute flex items-center justify-center"
          style={{
            width: size === "sm" ? "160px" : size === "md" ? "240px" : "320px",
            height: size === "sm" ? "160px" : size === "md" ? "240px" : "320px",
          }}
        >
          <div 
            className={cn(
              "absolute rounded-full border-4 border-transparent",
              "border-t-primary/30 border-r-primary/20",
              "animate-spin-slow",
              size === "sm" ? "w-20 h-20" : size === "md" ? "w-32 h-32" : "w-40 h-40"
            )}
            style={{ animationDuration: "2s" }}
          />
        </div>

        {/* Anillo medio con efecto de pulso */}
        <div 
          className="absolute flex items-center justify-center"
          style={{
            width: size === "sm" ? "160px" : size === "md" ? "240px" : "320px",
            height: size === "sm" ? "160px" : size === "md" ? "240px" : "320px",
          }}
        >
          <div 
            className={cn(
              "absolute rounded-full border-2 border-primary/40",
              "animate-pulse",
              size === "sm" ? "w-[72px] h-[72px]" : size === "md" ? "w-[112px] h-[112px]" : "w-[144px] h-[144px]"
            )}
            style={{ animationDuration: "1.5s" }}
          />
        </div>

        {/* Logo principal con rotación suave y efecto de rebote */}
        <div className="relative">
          {/* Círculo de fondo con efecto de pulso */}
          <div 
            className={cn(
              "absolute inset-0 rounded-full bg-primary/10",
              "animate-ping"
            )}
            style={{ animationDuration: "2s" }}
          />
          
          {/* Contenedor del logo con rotación */}
          <div className={cn(
            "relative rounded-full bg-background/80 backdrop-blur-sm",
            "p-3 shadow-2xl border-2 border-primary/20",
            "animate-spin-slow",
            sizeClasses[size]
          )}>
            <div className="w-full h-full flex items-center justify-center">
              <img
                src="/favicon.ico"
                alt="INEE Logo"
                className="w-full h-full object-contain drop-shadow-lg"
                style={{ 
                  animation: "none",
                  transform: "scale(0.9)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Partículas decorativas orbitando alrededor del logo */}
        <div 
          className="absolute pointer-events-none flex items-center justify-center"
          style={{
            width: size === "sm" ? "160px" : size === "md" ? "240px" : "320px",
            height: size === "sm" ? "160px" : size === "md" ? "240px" : "320px",
          }}
        >
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) * (Math.PI / 180);
            const distance = size === "sm" ? 48 : size === "md" ? 72 : 96;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            return (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary/60 shadow-lg"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  animation: `pulse 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                  boxShadow: "0 0 8px hsl(var(--primary))",
                }}
              />
            );
          })}
        </div>

        {/* Texto de carga con animación */}
        {showText && (
          <div 
            className="flex flex-col items-center gap-3"
            style={{
              marginTop: size === "sm" ? "120px" : size === "md" ? "160px" : "200px",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground/80">
                Cargando
              </span>
              <div className="flex gap-1.5">
                <span 
                  className="w-2 h-2 rounded-full bg-primary animate-bounce" 
                  style={{ animationDelay: "0s", animationDuration: "1.4s" }} 
                />
                <span 
                  className="w-2 h-2 rounded-full bg-primary animate-bounce" 
                  style={{ animationDelay: "0.2s", animationDuration: "1.4s" }} 
                />
                <span 
                  className="w-2 h-2 rounded-full bg-primary animate-bounce" 
                  style={{ animationDelay: "0.4s", animationDuration: "1.4s" }} 
                />
              </div>
            </div>
            {/* Barra de progreso animada */}
            <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"
                style={{
                  width: "60%",
                  animation: "shimmer 2s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% {
            transform: translateX(-100%);
            opacity: 0.5;
          }
          50% {
            transform: translateX(100%);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
