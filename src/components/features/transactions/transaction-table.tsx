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
import { useSession } from "next-auth/react";
import { ROLES } from "@/lib/rbac";

function formatIDR( amount: number ) {
  return new Intl.NumberFormat( "id-ID", {
    style                 : "currency",
    currency              : "IDR",
    minimumFractionDigits : 0,
  } ).format( amount );
}

export function TransactionTable( { transactions }: { transactions: any[] } ) {
  const { data : session } = useSession();
  const isSuperAdmin = ( session?.user as any )?.role === ROLES.SUPERADMIN;

  if ( !transactions.length ) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        Tidak ada transaksi ditemukan.
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
            <TableHead className="w-[180px]">Tanggal</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Nominal</TableHead>
            <TableHead className="text-right">Fee Pelanggan</TableHead>
            {isSuperAdmin && <TableHead className="text-right">Laba Agen</TableHead>}
            <TableHead className="text-right">Total Bayar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDates.map( ( date ) => {
            const dateObj = new Date( date );
            const dateLabel = isToday( dateObj ) 
              ? "Hari Ini" 
              : isYesterday( dateObj ) 
                ? "Kemarin" 
                : format( dateObj, "EEE, dd MMM" );
            
            const dayTransactions = groups[date];
            const totalAmount = dayTransactions.reduce( ( sum: number, tx: any ) => sum + Number( tx.transactionAmount ), 0 );

            return (
              <React.Fragment key={date}>
                <TableRow className="bg-transparent hover:bg-muted/30 border-b">
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
                    colSpan={isSuperAdmin ? 4 : 3}
                  >
                    {formatIDR( totalAmount )}
                  </TableCell>
                </TableRow>
                {dayTransactions.map( ( tx: any, index: number ) => (
                  <TableRow key={tx.id}
                    className={cn( "hover:bg-primary/5 transition-colors", index % 2 === 0 ? "bg-white" : "bg-muted/30" )}
                  >
                    <TableCell className="text-muted-foreground text-[10px] font-medium">
                      {format( new Date( tx.createdAt ), "HH:mm" )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{tx.category?.name}</span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">
                          TX ID: {tx.id.slice( -6 )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground/90">
                      {formatIDR( Number( tx.transactionAmount ) )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {formatIDR( Number( tx.customerFee ) )}
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell className="text-right">
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          +{formatIDR( Number( tx.agentProfit ) )}
                        </span>
                      </TableCell>
                    )}
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
