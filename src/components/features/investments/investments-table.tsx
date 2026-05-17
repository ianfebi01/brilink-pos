"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isToday, isYesterday } from "date-fns";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatIDR( amount: number ) {
  return new Intl.NumberFormat( "id-ID", {
    style                 : "currency",
    currency              : "IDR",
    minimumFractionDigits : 0,
  } ).format( amount );
}

export function InvestmentsTable( { investments }: { investments: any[] } ) {
  if ( !investments.length ) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        No investments found.
      </div>
    );
  }

  const groups = investments.reduce( ( acc: any, inv: any ) => {
    const dateKey = format( new Date( inv.investmentDate ), "yyyy-MM-dd" );
    if ( !acc[dateKey] ) acc[dateKey] = [];
    acc[dateKey].push( inv );
    
    return acc;
  }, {} );

  const sortedDates = Object.keys( groups ).sort( ( a, b ) => b.localeCompare( a ) );

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="text-right">Created By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDates.map( ( date ) => {
            const dateObj = new Date( date );
            const dateLabel = isToday( dateObj ) 
              ? "Today" 
              : isYesterday( dateObj ) 
                ? "Yesterday" 
                : format( dateObj, "EEE, dd MMM" );
            
            const dayInvestments = groups[date];
            const totalAmount = dayInvestments.reduce( ( sum: number, inv: any ) => sum + Number( inv.amount ), 0 );

            return (
              <React.Fragment key={date}>
                <TableRow className="bg-transparent hover:bg-muted/30 border-b">
                  <TableCell className="py-2">
                    <span className="font-semibold text-foreground/80">{dateLabel}</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground/70">
                    {formatIDR( totalAmount )}
                  </TableCell>
                  <TableCell colSpan={2}>
                    <Badge variant="secondary"
                      className="rounded-md font-normal bg-muted-foreground/10"
                    >
                      {dayInvestments.length} Records
                    </Badge>
                  </TableCell>
                </TableRow>
                {dayInvestments.map( ( inv: any, index: number ) => (
                  <TableRow key={inv.id}
                    className={cn( "hover:bg-primary/10 transition-colors", index % 2 === 0 ? "bg-white" : "bg-muted/50" )}
                  >
                    <TableCell className="text-muted-foreground text-xs">
                      {format( new Date( inv.investmentDate ), "HH:mm" )}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-blue-600">
                      {formatIDR( Number( inv.amount ) )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate italic text-muted-foreground">
                      {inv.note || "-"}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {inv.createdBy?.name || "System"}
                    </TableCell>
                  </TableRow>
                ) )}
              </React.Fragment>
            );
          } )}
        </TableBody>
      </Table>
    </div>
  );
}
