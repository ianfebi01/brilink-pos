"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export function SearchInput( {
  placeholder = "Cari...",
  className,
}: {
  placeholder?: string;
  className?: string;
} ) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState( searchParams.get( "q" ) || "" );
  const debouncedValue = useDebounce( value, 500 );

  useEffect( () => {
    const currentQ = searchParams.get( "q" ) || "";
    if ( debouncedValue === currentQ ) return;

    const params = new URLSearchParams( searchParams.toString() );
    if ( debouncedValue ) {
      params.set( "q", debouncedValue );
    } else {
      params.delete( "q" );
    }
    params.set( "page", "1" ); // Reset to first page on search
    router.push( `${pathname}?${params.toString()}` );
  }, [debouncedValue, pathname, router, searchParams] );

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-8 w-full md:w-[300px]"
        value={value}
        onChange={( e ) => setValue( e.target.value )}
      />
    </div>
  );
}
