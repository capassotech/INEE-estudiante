import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BookOpen, Calendar, FileText } from "lucide-react";
import { Course, Ebook, Evento } from "@/types/types";
import { PaginationComponente } from "@/components/PaginationComponent";
import { EventsList } from "@/components/EventsList";
import EventCard from "@/components/EventCard";
import EbookCard from "./EbookCard";
import CourseCard from "./CourseCard";
import { getValidatedInEeUrl } from "@/utils/urlValidator";


interface ProductsProps {
    courses: Course[];
    isLoadingCourses: boolean;
    currentPageCourses: number;
    totalPagesCourses: number;
    totalCountCourses: number;
    searchQueryCourses: string;
    setSearchQueryCourses: (query: string) => void;
    pageSizeCourses: number;
    handleSetPageSizeCourses: (size: number) => void;
    goToPageCourses: (page: number) => void;

    ebooks: Ebook[];
    isLoadingEbooks: boolean;
    currentPageEbooks: number;
    totalPagesEbooks: number;
    totalCountEbooks: number;
    searchQueryEbooks: string;
    setSearchQueryEbooks: (query: string) => void;
    pageSizeEbooks: number;
    handleSetPageSizeEbooks: (size: number) => void;
    goToPageEbooks: (page: number) => void;

    eventos: Evento[];
    isLoadingEventos: boolean;
    currentPageEventos: number;
    totalPagesEventos: number;
    totalCountEventos: number;
    searchQueryEventos: string;
    setSearchQueryEventos: (query: string) => void;
    pageSizeEventos: number;
    handleSetPageSizeEventos: (size: number) => void;
    goToPageEventos: (page: number) => void;

    activeTab: string;
    setActiveTab: (tab: string) => void;
    coursesProgress?: Map<string, number>;
}

export default function Products({
    courses,
    isLoadingCourses,
    currentPageCourses,
    totalPagesCourses,
    totalCountCourses,
    searchQueryCourses,
    setSearchQueryCourses,
    pageSizeCourses,
    handleSetPageSizeCourses,
    goToPageCourses,
    ebooks,
    isLoadingEbooks,
    currentPageEbooks,
    totalPagesEbooks,
    totalCountEbooks,
    searchQueryEbooks,
    setSearchQueryEbooks,
    pageSizeEbooks,
    handleSetPageSizeEbooks,
    goToPageEbooks,
    eventos,
    isLoadingEventos,
    currentPageEventos,
    totalPagesEventos,
    totalCountEventos,
    searchQueryEventos,
    setSearchQueryEventos,
    pageSizeEventos,
    handleSetPageSizeEventos,
    goToPageEventos,
    activeTab,
    setActiveTab,
    coursesProgress = new Map()
}: ProductsProps) {
    const handleFormacionesClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        try {
            const validatedUrl = await getValidatedInEeUrl('/formaciones');
            window.open(validatedUrl, '_blank');
        } catch (error) {
            console.error('Error al validar URL de formaciones:', error);
            // Fallback según el entorno
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const fallbackUrl = apiUrl.includes('qa') 
                ? 'https://tienda-qa.ineeoficial.com/formaciones'
                : 'https://inee-beta.web.app/formaciones';
            window.open(fallbackUrl, '_blank');
        }
    };

    const handleEbooksClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        try {
            const validatedUrl = await getValidatedInEeUrl('/ebooks');
            window.open(validatedUrl, '_blank');
        } catch (error) {
            console.error('Error al validar URL de ebooks:', error);
            // Fallback según el entorno
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const fallbackUrl = apiUrl.includes('qa') 
                ? 'https://tienda-qa.ineeoficial.com/ebooks'
                : 'https://inee-beta.web.app/ebooks';
            window.open(fallbackUrl, '_blank');
        }
    };
    return (
        <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="formaciones" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden sm:inline">Formaciones</span>
                        <span className="sm:hidden">Formaciones</span>
                    </TabsTrigger>
                    <TabsTrigger value="ebooks" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Ebooks</span>
                    </TabsTrigger>
                    <TabsTrigger value="eventos" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Eventos</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="formaciones" className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 ml-1">
                                Mis formaciones
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1 max-w-xs">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        type="search"
                                        placeholder="Buscar formaciones..."
                                        value={searchQueryCourses}
                                        onChange={(e) => setSearchQueryCourses(e.target.value)}
                                        className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    />
                                </div>
                                {courses.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Mostrar:
                                        </span>
                                        <Select
                                            value={pageSizeCourses.toString()}
                                            onValueChange={(value) => handleSetPageSizeCourses(parseInt(value))}
                                        >
                                            <SelectTrigger className="w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3">3</SelectItem>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="20">20</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {isLoadingCourses ? (
                                // Skeleton para formaciones
                                Array.from({ length: pageSizeCourses }).map((_, index) => (
                                    <Card
                                        key={index}
                                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    >
                                        <CardContent className="p-0 flex flex-col sm:flex-row">
                                            <Skeleton className="w-full sm:w-48 md:w-64 lg:w-80 aspect-video flex-shrink-0" />
                                            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
                                                <div className="mb-2 sm:mb-3">
                                                    <Skeleton className="h-5 w-3/4 mb-2" />
                                                    <Skeleton className="h-4 w-full mb-1" />
                                                    <Skeleton className="h-4 w-2/3" />
                                                </div>
                                                <div>
                                                    <div className="mb-2">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <Skeleton className="h-3 w-16" />
                                                            <Skeleton className="h-3 w-12" />
                                                        </div>
                                                        <Skeleton className="h-2 w-full" />
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Skeleton className="h-5 w-20 rounded-full" />
                                                            <Skeleton className="h-4 w-24" />
                                                        </div>
                                                        <Skeleton className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : courses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                                        Aún no tienes cursos activos. Cuando adquieras una formación, aparecerá aquí.
                                    </p>
                                </div>
                            ) : courses.map((course) => {
                                const progress = coursesProgress.get(course.id);
                                return (
                                    <CourseCard 
                                        key={course.id} 
                                        course={course} 
                                        progress={progress !== undefined ? progress : undefined}
                                    />
                                );
                            })}
                        </div>

                        {courses.length > 0 && totalPagesCourses > 1 && (
                            <PaginationComponente
                                currentPage={currentPageCourses}
                                pageSize={pageSizeCourses}
                                totalCount={totalCountCourses}
                                goToPage={goToPageCourses}
                                totalPages={totalPagesCourses}
                            />
                        )}
                    </div>

                    <a
                        href="https://ineeoficial.com/formaciones"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                        onClick={handleFormacionesClick}
                    >
                        <Card className="bg-primary hover:bg-primary/90 border-2 border-primary text-white dark:bg-primary dark:hover:bg-primary/90 dark:border-primary transition-colors duration-300">
                            <CardHeader className="text-center py-6 sm:py-8">
                                <h3 className="text-lg sm:text-xl font-bold">
                                    Adquirir más formaciones
                                </h3>
                                <p className="text-white/80 mt-2 text-sm sm:text-base">
                                    Explora nuestra plataforma de formaciones completas
                                </p>
                            </CardHeader>
                        </Card>
                    </a>
                </TabsContent>

                <TabsContent value="ebooks" className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 ml-1">
                                Mis Ebooks
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1 max-w-xs">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        type="search"
                                        placeholder="Buscar ebooks..."
                                        value={searchQueryEbooks}
                                        onChange={(e) => setSearchQueryEbooks(e.target.value)}
                                        className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    />
                                </div>
                                {ebooks.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Mostrar:
                                        </span>
                                        <Select
                                            value={pageSizeEbooks.toString()}
                                            onValueChange={(value) => handleSetPageSizeEbooks(parseInt(value))}
                                        >
                                            <SelectTrigger className="w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3">3</SelectItem>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="20">20</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {isLoadingEbooks ? (
                                // Skeleton para ebooks
                                Array.from({ length: pageSizeEbooks }).map((_, index) => (
                                    <Card
                                        key={index}
                                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    >
                                        <CardContent className="p-0 flex flex-col sm:flex-row">
                                            <Skeleton className="w-full sm:w-20 md:w-24 lg:w-28 aspect-[3/4] flex-shrink-0" />
                                            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
                                                <div className="mb-2 sm:mb-3">
                                                    <Skeleton className="h-5 w-3/4 mb-2" />
                                                    <Skeleton className="h-4 w-full mb-1" />
                                                    <Skeleton className="h-4 w-2/3 mb-1" />
                                                    <Skeleton className="h-3 w-32" />
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Skeleton className="h-5 w-16 rounded-full" />
                                                        <Skeleton className="h-5 w-20 rounded-full" />
                                                        <Skeleton className="h-5 w-18 rounded-full" />
                                                    </div>
                                                    <Skeleton className="h-8 w-24" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : ebooks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                                        Aún no tienes ebooks. Cuando adquieras un ebook, aparecerá aquí.
                                    </p>
                                </div>
                            ) : ebooks.map((ebook) => <EbookCard key={ebook.id} ebook={ebook} />)}
                        </div>

                        {ebooks.length > 0 && totalPagesEbooks > 1 && (
                            <PaginationComponente
                                currentPage={currentPageEbooks}
                                pageSize={pageSizeEbooks}
                                totalCount={totalCountEbooks}
                                goToPage={goToPageEbooks}
                                totalPages={totalPagesEbooks}
                            />
                        )}
                    </div>

                    <a
                        href="https://ineeoficial.com/ebooks"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                        onClick={handleEbooksClick}
                    >
                        <Card className="bg-primary hover:bg-primary/90 border-2 border-primary text-white dark:bg-primary dark:hover:bg-primary/90 dark:border-primary transition-colors duration-300">
                            <CardHeader className="text-center py-6 sm:py-8">
                                <h3 className="text-lg sm:text-xl font-bold">
                                    Explorar Ebooks
                                </h3>
                                <p className="text-white/80 mt-2 text-sm sm:text-base">
                                    Descubre nuestra colección de ebooks disponibles
                                </p>
                            </CardHeader>
                        </Card>
                    </a>
                </TabsContent>

                <TabsContent value="eventos" className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 ml-1">
                                Mis Eventos
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1 max-w-xs">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        type="search"
                                        placeholder="Buscar eventos..."
                                        value={searchQueryEventos}
                                        onChange={(e) => setSearchQueryEventos(e.target.value)}
                                        className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    />
                                </div>
                                {eventos.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Mostrar:
                                        </span>
                                        <Select
                                            value={pageSizeEventos.toString()}
                                            onValueChange={(value) => handleSetPageSizeEventos(parseInt(value))}
                                        >
                                            <SelectTrigger className="w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3">3</SelectItem>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="20">20</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {isLoadingEventos ? (
                                // Skeleton para eventos
                                Array.from({ length: pageSizeEventos }).map((_, index) => (
                                    <Card
                                        key={index}
                                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    >
                                        <CardContent className="p-0 flex flex-col sm:flex-row">
                                            <Skeleton className="w-full sm:w-48 md:w-64 lg:w-80 aspect-video flex-shrink-0" />
                                            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
                                                <div className="mb-2">
                                                    <Skeleton className="h-5 w-3/4 mb-2" />
                                                    <Skeleton className="h-4 w-full mb-1" />
                                                    <Skeleton className="h-4 w-2/3 mb-2" />
                                                    <div className="flex flex-wrap gap-2">
                                                        <Skeleton className="h-3 w-32" />
                                                        <Skeleton className="h-3 w-24" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                    <Skeleton className="h-5 w-24 rounded-full" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : eventos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                                        Aún no tienes eventos registrados. Cuando te inscribas a un evento, aparecerá aquí.
                                    </p>
                                </div>
                            ) : eventos.map((evento) => <EventCard key={evento.id} evento={evento} />)}
                        </div>

                        {eventos.length > 0 && totalPagesEventos > 1 && (
                            <PaginationComponente
                                currentPage={currentPageEventos}
                                pageSize={pageSizeEventos}
                                totalCount={totalCountEventos}
                                goToPage={goToPageEventos}
                                totalPages={totalPagesEventos}
                            />
                        )}

                        <EventsList />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}



