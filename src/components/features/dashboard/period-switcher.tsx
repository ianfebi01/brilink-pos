"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PeriodSwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get( "period" ) || "daily";

  const setPeriod = ( period: string ) => {
    const params = new URLSearchParams( searchParams.toString() );
    params.set( "period", period );
    router.push( `?${params.toString()}` );
  };

  return (
    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
      <Button
        variant={currentPeriod === "daily" ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "text-xs h-7 px-3 rounded-md transition-all",
          currentPeriod === "daily" ? "bg-background shadow-sm font-bold" : "text-muted-foreground"
        )}
        onClick={() => setPeriod( "daily" )}
      >
        Harian
      </Button>
      <Button
        variant={currentPeriod === "monthly" ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "text-xs h-7 px-3 rounded-md transition-all",
          currentPeriod === "monthly" ? "bg-background shadow-sm font-bold" : "text-muted-foreground"
        )}
        onClick={() => setPeriod( "monthly" )}
      >
        Bulanan
      </Button>
    </div>
  );
}
