"use client";

import { usePagination, DOTS } from "@/hooks/usePagination";

interface SmartPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function SmartPagination({
    currentPage,
    totalPages,
    onPageChange,
}: SmartPaginationProps) {
    const paginationRange = usePagination({
        currentPage,
        totalPages,
        siblingCount: 1,
    });

    // If there are less than 2 items in pagination range we shall not render the component
    if (currentPage === 0 || paginationRange.length < 2) {
        return null;
    }

    return (
        <>
            {paginationRange.map((pageNumber, index) => {
                // If the pageItem is a DOT, render the DOTS unicode character
                if (pageNumber === DOTS) {
                    return (
                        <div
                            key={`dots-${index}`}
                            className="w-10 h-10 flex items-center justify-center text-gray-400 font-thai-medium"
                        >
                            ...
                        </div>
                    );
                }

                // Render our Page Pills
                const isSelected = pageNumber === currentPage;
                return (
                    <button
                        key={pageNumber}
                        onClick={() => {
                            if (!isSelected) {
                                onPageChange(Number(pageNumber));
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                        }}
                        disabled={isSelected}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-thai-medium transition-all duration-200 ${isSelected
                            ? "bg-[#00C7A5] text-white shadow-[#00C7A5]/30 shadow-md transform scale-105 cursor-default"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
                            }`}
                    >
                        {pageNumber}
                    </button>
                );
            })}
        </>
    );
}
