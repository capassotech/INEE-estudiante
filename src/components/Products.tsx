import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader } from "@/components/ui/card";
import { Loader2, Search, BookOpen, Calendar, FileText } from "lucide-react";
import { Course, Ebook, Evento } from "@/types/types";
import { PaginationComponente } from "@/components/PaginationComponent";
import { EventsList } from "@/components/EventsList";
import EventCard from "@/components/EventCard";
import EbookCard from "./EbookCard";
import CourseCard from "./CourseCard";


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
    setActiveTab
}: ProductsProps) {
    return (
        <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="formaciones" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden sm:inline">Formaciones</span>
                        <span className="sm:hidden">Cursos</span>
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
                                <div className="flex justify-center items-center h-32">
                                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                </div>
                            ) : courses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                                        Aún no tienes cursos activos. Cuando adquieras una formación, aparecerá aquí.
                                    </p>
                                </div>
                            ) : courses.map((course) => <CourseCard key={course.id} course={course} />)}
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
                        href="https://inee-beta.web.app/formaciones"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
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
                                <div className="flex justify-center items-center h-32">
                                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                </div>
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
                        href="https://inee-beta.web.app/ebooks"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
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
                                <div className="flex justify-center items-center h-32">
                                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                </div>
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



