import { forwardRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Award, Eye, EyeOff, Globe2, GraduationCap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Pantallas de acceso (login, registro y recuperar contraseña).
 * Mismo diseño que en el admin y el campus: panel de marca bordó a la izquierda
 * y formulario limpio a la derecha. La forma de "semilla" replica el ojo semilla de la marca.
 */

const SEED = "[border-radius:50%_0_50%_0]";

const HIGHLIGHTS: { icon: LucideIcon; label: string }[] = [
  { icon: GraduationCap, label: "Metodología DAACRE®" },
  { icon: Award, label: "Certificación internacional" },
  { icon: Globe2, label: "100% online" },
];

export type AuthBrandCopy = {
  /** Etiqueta dorada sobre el titular */
  badge: string;
  /** Texto chico del pie */
  footnote: string;
};

function BrandPanel({ copy }: { copy: AuthBrandCopy }) {
  return (
    <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,#40171f_0%,#5e2530_45%,#8b3740_100%)] p-10 xl:p-14 text-white">
      <div className="pointer-events-none absolute -top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-[#d8a848]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full bg-[#c4566a]/25 blur-3xl" />
      <div className={cn("pointer-events-none absolute -left-16 top-1/3 h-40 w-40 border border-white/10", SEED)} />
      <div className={cn("pointer-events-none absolute right-10 bottom-24 h-16 w-16 bg-[#d8a848]/80", SEED)} />

      <Link to="/" className="relative self-start">
        <img src="/logo-blanco.png" alt="INEE" className="h-14 w-auto" />
      </Link>

      <div className="relative grid grid-cols-[1fr_auto] items-center gap-8 xl:gap-12">
        <div className="space-y-6 max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d8a848]/40 bg-[#d8a848]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ecc977]">
            {copy.badge}
          </span>
          <div className="space-y-5">
            <span className="block h-1 w-14 rounded-full bg-[#d8a848]" />
            <h2 className="font-[Poppins,sans-serif] text-[2rem] xl:text-[2.6rem] font-medium uppercase leading-[1.15] tracking-[0.06em] text-white">
            <span className="block">Instituto de Negocios</span>
            <span className="block">Emprendedor Empresarial</span>
            </h2>
          </div>
        </div>

        <div className="relative">
          <div className={cn("absolute inset-0 translate-x-4 translate-y-4 border-2 border-[#d8a848]/60", SEED)} />
          <div className={cn("relative h-64 w-64 xl:h-80 xl:w-80 overflow-hidden shadow-2xl shadow-black/40", SEED)}>
            <img
              src="/auth-hero.jpg"
              alt="Profesional trabajando en consultoría"
              className="h-full w-full object-cover object-[55%_35%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#40171f]/40 to-transparent" />
          </div>
        </div>
      </div>

      <ul className="relative flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/80">
        {HIGHLIGHTS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-[#ecc977]" />
            {label}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function AuthShell({
  copy,
  icon: Icon,
  title,
  description,
  children,
  footer,
}: {
  copy: AuthBrandCopy;
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-[100dvh] bg-white lg:grid-cols-[1.15fr_1fr]">
      <BrandPanel copy={copy} />

      <main className="relative flex flex-col">
        {/* Franja de marca en mobile */}
        <div className="relative overflow-hidden bg-[linear-gradient(160deg,#40171f,#8b3740)] px-5 sm:px-8 pt-[max(1.25rem,env(safe-area-inset-top))] pb-12 lg:hidden">
          <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[#d8a848]/25 blur-3xl" />
          <div className={cn("pointer-events-none absolute right-5 top-[max(1.5rem,env(safe-area-inset-top))] h-7 w-7 bg-[#d8a848]/80", SEED)} />
          <Link to="/" className="relative inline-block">
            <img src="/logo-blanco.png" alt="INEE" className="h-9 w-auto" />
          </Link>
          <h2 className="relative mt-5 font-[Poppins,sans-serif] text-[15px] sm:text-lg font-medium uppercase leading-snug tracking-[0.08em] text-white">
            <span className="block">Instituto de Negocios</span>
            <span className="block">Emprendedor Empresarial</span>
          </h2>
        </div>

        <div className="relative z-10 -mt-6 flex flex-1 items-start justify-center rounded-t-3xl bg-white px-5 sm:px-8 pt-7 pb-8 lg:mt-0 lg:items-center lg:rounded-none lg:py-12">
          <div className="w-full max-w-sm animate-fade-in">
            <Link to="/" className="mb-7 hidden lg:inline-block">
              <img src="/logo.png" alt="INEE" className="h-9 w-auto" />
            </Link>
            {Icon && (
              <span className={cn("mb-4 sm:mb-5 grid h-11 w-11 sm:h-12 sm:w-12 place-items-center bg-[#8b3740]/10 text-[#8b3740]", SEED)}>
                <Icon className="h-5 w-5" />
              </span>
            )}
            <h1 className="text-[22px] sm:text-[1.75rem] font-semibold tracking-tight text-gray-900">{title}</h1>
            {description && <p className="mt-1.5 text-[15px] sm:text-sm text-gray-500 leading-relaxed">{description}</p>}

            <div className="mt-6 sm:mt-7">{children}</div>

            {footer && <div className="mt-6 border-t border-gray-100 pt-5 text-center text-sm text-gray-500">{footer}</div>}
          </div>
        </div>

        <p className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-xs text-gray-400">
          © {new Date().getFullYear()} INEE® · {copy.footnote}
        </p>
      </main>
    </div>
  );
}

/** Campo de acceso: etiqueta, ícono a la izquierda, acción opcional a la derecha y error */
export const AuthField = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    icon: LucideIcon;
    error?: string;
    trailing?: ReactNode;
    labelAside?: ReactNode;
  }
>(function AuthField({ label, icon: Icon, error, trailing, labelAside, id, className, ...props }, ref) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[13px] sm:text-xs font-medium text-gray-700">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="group relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#8b3740]" />
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-12 sm:h-11 w-full rounded-xl border bg-gray-50/60 pl-10 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all",
            "focus:bg-white focus:border-[#8b3740]/60 focus:ring-4 focus:ring-[#8b3740]/10 disabled:opacity-60",
            trailing ? "pr-12 sm:pr-11" : "pr-3.5",
            error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200",
            className
          )}
          aria-invalid={Boolean(error) || undefined}
          {...props}
        />
        {trailing && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && <p className="whitespace-pre-line text-xs text-red-600">{error}</p>}
    </div>
  );
});

/** Botón para mostrar/ocultar la contraseña dentro de un AuthField */
export function PasswordToggle({ visible, onToggle, disabled }: { visible: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      className="grid h-10 w-10 sm:h-8 sm:w-8 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

/** Botón principal (bordó, redondeado, como los CTA de la tienda) */
export function AuthSubmit({
  loading,
  loadingText,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; loadingText?: string }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        "group relative inline-flex h-12 sm:h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#8b3740] px-6 text-sm font-semibold uppercase tracking-wider text-white",
        "shadow-lg shadow-[#8b3740]/25 transition-all hover:bg-[#7a2f37] hover:shadow-xl hover:shadow-[#8b3740]/30 active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#8b3740]/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Botón secundario con borde (Google, reenviar, etc.) */
export function AuthOutlineButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex h-12 sm:h-11 w-full items-center justify-center gap-2.5 rounded-full border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition-colors",
        "hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    />
  );
}

export function GoogleIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/** Separador "o" entre Google y el formulario de email */
export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-400">
      <span className="h-px flex-1 bg-gray-200" />
      {label}
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

/** Enlace de texto bordó */
export const authLinkClass = "font-medium text-[#8b3740] hover:underline";
