
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";


export const PaginationComponente = ({ 
    currentPage, 
    pageSize, 
    totalCount, 
    goToPage,
    totalPages
} : { 
    currentPage: number, 
    pageSize: number, 
    totalCount: number, 
    goToPage: (page: number) => void,
    totalPages: number
}) => {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} de {totalCount} formaciones
            </div>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) goToPage(currentPage - 1);
                            }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <PaginationItem key={pageNum}>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        goToPage(pageNum);
                                    }}
                                    isActive={currentPage === pageNum}
                                    className="cursor-pointer"
                                >
                                    {pageNum}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                            <span className="flex h-9 w-9 items-center justify-center text-gray-400">...</span>
                        </PaginationItem>
                    )}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) goToPage(currentPage + 1);
                            }}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}