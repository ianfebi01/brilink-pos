import { usePathname, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  total: number;
  page: number;
  limit: number;
}

export function PaginationControls( {
  total,
  page,
  limit,
}: PaginationControlsProps ) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil( total / limit );

  const createPageUrl = ( pageNumber: number | string ) => {
    const params = new URLSearchParams( searchParams.toString() );
    params.set( "page", pageNumber.toString() );
    
    return `${pathname}?${params.toString()}`;
  };

  if ( total === 0 ) return null;

  // Logic to show a few pages around the current page
  const pages = [];
  const maxVisiblePages = 3;
  let startPage = Math.max( 1, page - Math.floor( maxVisiblePages / 2 ) );
  const endPage = Math.min( totalPages, startPage + maxVisiblePages - 1 );

  if ( endPage - startPage + 1 < maxVisiblePages ) {
    startPage = Math.max( 1, endPage - maxVisiblePages + 1 );
  }

  for ( let i = startPage; i <= endPage; i++ ) {
    pages.push( i );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 border-t bg-muted/5">
      <div className="text-xs text-muted-foreground order-2 sm:order-1">
        Menampilkan <span className="font-medium text-foreground">{( page - 1 ) * limit + 1}</span> - <span className="font-medium text-foreground">{Math.min( page * limit, total )}</span> dari <span className="font-medium text-foreground">{total}</span> transaksi
      </div>
      <Pagination className="justify-end w-auto order-1 sm:order-2 mx-0">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href={page > 1 ? createPageUrl( page - 1 ) : "#"} 
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink href={createPageUrl( 1 )}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && <PaginationEllipsis />}
            </>
          )}

          {pages.map( ( p ) => (
            <PaginationItem key={p}>
              <PaginationLink 
                href={createPageUrl( p )}
                isActive={p === page}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ) )}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationLink href={createPageUrl( totalPages )}>{totalPages}</PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext 
              href={page < totalPages ? createPageUrl( page + 1 ) : "#"} 
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
