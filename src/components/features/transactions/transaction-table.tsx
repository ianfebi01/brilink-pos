"use client";

import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isToday, isYesterday } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatIDR( amount: number ) {
  return new Intl.NumberFormat( "id-ID", {
    style                 : "currency",
    currency              : "IDR",
    minimumFractionDigits : 0,
  } ).format( amount );
}

export function TransactionTable( { transactions }: { transactions: any[] } ) {
  if ( !transactions.length ) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        No transactions found.
      </div>
    );
  }

  const groups = transactions.reduce( ( acc: any, tx: any ) => {
    const dateKey = format( new Date( tx.createdAt ), "yyyy-MM-dd" );
    if ( !acc[dateKey] ) acc[dateKey] = [];
    acc[dateKey].push( tx );
    
    return acc;
  }, {} );

  const sortedDates = Object.keys( groups ).sort( ( a, b ) => b.localeCompare( a ) );

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="w-[180px]">Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Customer Fee</TableHead>
            <TableHead className="text-right">Agent Profit</TableHead>
            <TableHead className="text-right">Total Paid</TableHead>
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
            
            const dayTransactions = groups[date];
            const totalAmount = dayTransactions.reduce( ( sum: number, tx: any ) => sum + Number( tx.transactionAmount ), 0 );

            return (
              <React.Fragment key={date}>
                <TableRow className="bg-trnsparent hover:bg-muted/30 border-b">
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground/80">{dateLabel}</span>
                    </div>
                  </TableCell>
                  <TableCell colSpan={1}>
                    <Badge variant="secondary"
                      className="rounded-md font-normal bg-muted-foreground/10"
                    >
                      {dayTransactions.length} Transactions
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground/70"
                    colSpan={4}
                  >
                    {formatIDR( totalAmount )}
                  </TableCell>
                </TableRow>
                {dayTransactions.map( ( tx: any, index: number ) => (
                  <TableRow key={tx.id}
                    className={cn( "hover:bg-primary/10 transition-colors", index % 2 === 0 ? "bg-white" : "bg-muted/5" )}
                  >
                    <TableCell className="text-muted-foreground text-xs">
                      {format( new Date( tx.createdAt ), "HH:mm" )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary/40" />
                        <span className="font-medium">{tx.category?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground/90">
                      {formatIDR( Number( tx.transactionAmount ) )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatIDR( Number( tx.customerFee ) )}
                    </TableCell>
                    <TableCell className="text-right text-green-600 font-medium">
                      +{formatIDR( Number( tx.agentProfit ) )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatIDR( Number( tx.totalPaid ) )}
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
