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
                  "w-[260px] justify-start text-left font-normal h-9 text-xs bg-muted/30",
                  !date && "text-muted-foreground"
                )}
              >
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
      {( fromParam || toParam ) && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 w-9 p-0"
          onClick={clearFilter}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
