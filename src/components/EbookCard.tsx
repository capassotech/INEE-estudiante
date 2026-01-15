import { Ebook } from "@/types/types";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithPlaceholder } from "@/components/ImageWithPlaceholder";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function EbookCard({ ebook }: { ebook: Ebook }) {
    return (
        <Card
            key={ebook.id}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
            <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/3 h-40 sm:h-32 md:h-40 relative overflow-hidden flex-shrink-0">
                    <ImageWithPlaceholder
                        src={ebook.imagen || "/placeholder.svg"}
                        alt={ebook.title}
                        className="rounded-none transition-transform hover:scale-105"
                        aspectRatio="auto"
                        style={{ width: '100%', height: '100%' }}
                        placeholderIcon="book"
                        placeholderText=""
                    />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                    <div className="mb-3 sm:mb-4">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 break-words">
                            {ebook.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 break-words">
                            {ebook.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Por: {ebook.author}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            {ebook.temas.map((tema, index) => (
                                <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full whitespace-nowrap">
                                    {tema}
                                </span>
                            ))}
                        </div>
                        <Button
                            size="sm"
                            onClick={() => window.open(ebook.archivoUrl, 'download')}
                            className="self-start sm:self-center"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Descargar Ebook
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}