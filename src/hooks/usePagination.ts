export const DOTS = '...';

interface UsePaginationProps {
    currentPage: number;
    totalPages: number;
    siblingCount?: number;
}

export const usePagination = ({
    currentPage,
    totalPages,
    siblingCount = 1,
}: UsePaginationProps) => {
    // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingCount + 5;

    /*
      If the number of pages is less than the page numbers we want to show in our
      paginationComponent, we return the range [1..totalPages]
    */
    if (totalPages <= totalPageNumbers) {
        return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    /*
      We do not want to show dots if there is only one position left 
      after/before the left/right page count as that would be displayed as our dots.
    */
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    /*
      Case 2: No left dots to show, but rights dots to be shown
    */
    if (!shouldShowLeftDots && shouldShowRightDots) {
        let leftItemCount = 3 + 2 * siblingCount;
        let leftRange = range(1, leftItemCount);

        return [...leftRange, DOTS, totalPages];
    }

    /*
      Case 3: No right dots to show, but left dots to be shown
    */
    if (shouldShowLeftDots && !shouldShowRightDots) {
        let rightItemCount = 3 + 2 * siblingCount;
        let rightRange = range(totalPages - rightItemCount + 1, totalPages);

        return [firstPageIndex, DOTS, ...rightRange];
    }

    /*
      Case 4: Both left and right dots to be shown
    */
    if (shouldShowLeftDots && shouldShowRightDots) {
        let middleRange = range(leftSiblingIndex, rightSiblingIndex);
        return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return [];
};

const range = (start: number, end: number) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
};
