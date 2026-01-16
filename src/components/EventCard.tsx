import { Evento } from "@/types/types";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithPlaceholder } from "@/components/ImageWithPlaceholder";
import { getValidatedInEeUrl } from "@/utils/urlValidator";

export default function EventCard({
    evento,
    showPrice,
    clickeable
}: {
    evento: Evento,
    showPrice?: boolean | undefined,
    clickeable?: boolean | undefined
}) {
    const convertFirestoreDate = (fecha: { _seconds: number, _nanoseconds: number } | Date | string): Date => {
        if (fecha && typeof fecha === 'object' && '_seconds' in fecha) {
            return new Date(fecha._seconds * 1000);
        }
        if (fecha instanceof Date) {
            return fecha;
        }
        if (typeof fecha === 'string') {
            return new Date(fecha);
        }
        return new Date();
    };

    const formatEventDate = (fecha: { _seconds: number, _nanoseconds: number } | Date | string): string => {
        const date = convertFirestoreDate(fecha);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleCardClick = async () => {
        if (!clickeable) return;
        
        try {
            const validatedUrl = await getValidatedInEeUrl(`/evento/${evento.id}`);
            window.open(validatedUrl, '_blank');
        } catch (error) {
            console.error('Error al validar URL del evento:', error);
            // En caso de error, intentar nuevamente con la función (que maneja el fallback)
            // Si falla nuevamente, usar una URL por defecto según el entorno
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const fallbackUrl = apiUrl.includes('qa') 
                ? `https://tienda-qa.ineeoficial.com/evento/${evento.id}`
                : `https://inee-beta.web.app/evento/${evento.id}`;
            window.open(fallbackUrl, '_blank');
        }
    };

    return (
        <Card
            key={evento.id}
            className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden ${clickeable ? "cursor-pointer" : ""}`}
            onClick={handleCardClick}
        >
            <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/3 h-40 sm:h-32 md:h-40 relative overflow-hidden flex-shrink-0">
                    <ImageWithPlaceholder
                        src={evento.imagen}
                        alt={evento.titulo}
                        className="rounded-none transition-transform hover:scale-105"
                        aspectRatio="auto"
                        style={{ width: '100%', height: '100%' }}
                        placeholderIcon="image"
                        placeholderText=""
                    />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                    <div className="mb-2">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 break-words">
                            {evento.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 break-words">
                            {evento.descripcion}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>📅 {formatEventDate(evento.fecha)}</span>
                            {evento.hora && <span>🕒 {evento.hora}</span>}
                        </div>
                    </div>
                    {showPrice && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-sm mb-2">
                            <p className="text-zinc-600">Precio: <span className="font-bold text-zinc-800">${evento.precio}</span></p>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full whitespace-nowrap">
                                {evento.modalidad}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}