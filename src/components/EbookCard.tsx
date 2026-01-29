import { useState } from "react";
import { Ebook } from "@/types/types";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithPlaceholder } from "@/components/ImageWithPlaceholder";
import { Button } from "@/components/ui/button";
import { ChevronDown, ExternalLink } from "lucide-react";

export default function EbookCard({ ebook }: { ebook: Ebook }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card
            key={ebook.id}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
            <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="w-full sm:w-20 md:w-24 lg:w-28 relative overflow-hidden flex-shrink-0">
                    <ImageWithPlaceholder
                        src={ebook.imagen || "/placeholder.svg"}
                        alt={ebook.title}
                        className="rounded-none transition-transform hover:scale-105 w-full h-full"
                        aspectRatio="a4"
                        placeholderIcon="book"
                        placeholderText="E-book"
                    />
                </div>
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
                    <div className="mb-2 sm:mb-3">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words leading-tight mb-1">
                            {ebook.title}
                        </h3>
                        <p className={`text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-words leading-snug mb-1 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                            {ebook.description}
                        </p>
                        {ebook.description && ebook.description.length > 100 && (
                            <div className="flex items-center gap-1 mb-3">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-xs text-blue-600 hover:underline self-start"
                                >
                                    {isExpanded ? 'Ver menos' : 'Ver más'}
                                </button>
                                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Por: {ebook.author}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            {ebook.temas.slice(0, 3).map((tema, index) => (
                                <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {tema}
                                </span>
                            ))}
                            {ebook.temas.length > 3 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5">
                                    +{ebook.temas.length - 3}
                                </span>
                            )}
                        </div>
                        <Button
                            size="sm"
                            onClick={() => window.open(ebook.archivoUrl, 'download')}
                            className="self-start sm:self-center text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                        >
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            Descargar
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}