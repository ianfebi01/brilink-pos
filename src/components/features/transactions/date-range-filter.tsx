"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { id } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function DateRangeFilter( {
  className,
}: React.HTMLAttributes<HTMLDivElement> ) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromParam = searchParams.get( "from" );
  const toParam = searchParams.get( "to" );

  const [date, setDate] = React.useState<DateRange | undefined>( {
    from : fromParam ? parseISO( fromParam ) : undefined,
    to   : toParam ? parseISO( toParam ) : undefined,
  } );

  const applyFilter = ( range: DateRange | undefined ) => {
    const params = new URLSearchParams( searchParams.toString() );
    if ( range?.from ) {
      params.set( "from", format( range.from, "yyyy-MM-dd" ) );
    } else {
      params.delete( "from" );
    }
    
    if ( range?.to ) {
      params.set( "to", format( range.to, "yyyy-MM-dd" ) );
    } else {
      params.delete( "to" );
    }
    
    params.set( "page", "1" );
    router.push( `${pathname}?${params.toString()}` );
  };

  const clearFilter = () => {
    setDate( undefined );
    const params = new URLSearchParams( searchParams.toString() );
    params.delete( "from" );
    params.delete( "to" );
    params.set( "page", "1" );
    router.push( `${pathname}?${params.toString()}` );
  };

  return (
    <div className={cn( "flex items-center gap-2", className )}>
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger
            render={
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[260px] justify-start text-left font-normal h-9 text-xs bg-muted/30 transition-all duration-300 ease-in-out relative pr-9",
                  !date && "text-muted-foreground"
                )}
              >
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format( date.from, "dd MMM yyyy", { locale : id } )} -{" "}
                        {format( date.to, "dd MMM yyyy", { locale : id } )}
                      </>
                    ) : (
                      format( date.from, "dd MMM yyyy", { locale : id } )
                    )
                  ) : (
                    <span>Pilih rentang tanggal</span>
                  )}
                </div>
                <div className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-300 origin-center shrink-0",
                  ( fromParam || toParam ) 
                    ? "opacity-100 scale-100" 
                    : "opacity-0 scale-50 pointer-events-none"
                )}
                >
                  <div
                    role="button"
                    className="p-1 hover:bg-muted rounded-md cursor-pointer"
                    onClick={( e ) => {
                      e.preventDefault();
                      clearFilter();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </div>
                </div>
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0"
            align="end"
          >
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={( range ) => {
                setDate( range );
                if ( range?.from && range?.to ) {
                  applyFilter( range );
                }
              }}
              numberOfMonths={1}
              locale={id}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
