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
import { Edit2, Trash2, MoreVertical } from "lucide-react";
import { InvestmentFormDialog } from "./investment-form-dialog";
import { deleteInvestment } from "@/actions/investments";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function formatIDR( amount: number ) {
  return new Intl.NumberFormat( "id-ID", {
    style                 : "currency",
    currency              : "IDR",
    minimumFractionDigits : 0,
  } ).format( amount );
}

export function InvestmentsTable( { investments }: { investments: any[] } ) {
  const handleDelete = async ( id: string ) => {
    if ( !confirm( "Apakah Anda yakin ingin menghapus catatan investasi ini?" ) ) return;
    
    const res = await deleteInvestment( id );
    if ( res.success ) {
      toast.success( "Catatan investasi berhasil dihapus" );
    } else {
      toast.error( res.error || "Gagal menghapus catatan" );
    }
  };

  if ( !investments.length ) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        Tidak ada data investasi ditemukan.
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-none text-[11px] uppercase tracking-wider">
            <TableHead className="w-[80px]">Waktu</TableHead>
            <TableHead className="text-right">Nominal</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead className="text-right">Oleh</TableHead>
            <TableHead className="text-right w-[100px]">Aksi</TableHead>
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
            
            const dayInvestments = groups[date];
            const totalAmount = dayInvestments.reduce( ( sum: number, inv: any ) => sum + Number( inv.amount ), 0 );

            return (
              <React.Fragment key={date}>
                <TableRow className="bg-muted/10 hover:bg-muted/20 border-b">
                  <TableCell className="py-2">
                    <span className="font-bold text-foreground/90">{dateLabel}</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground/90">
                    {formatIDR( totalAmount )}
                  </TableCell>
                  <TableCell colSpan={3}>
                    <Badge variant="secondary"
                      className="rounded-md font-normal bg-muted-foreground/10"
                    >
                      {dayInvestments.length} Catatan
                    </Badge>
                  </TableCell>
                </TableRow>
                {dayInvestments.map( ( inv: any, index: number ) => (
                  <TableRow key={inv.id}
                    className={cn( "hover:bg-primary/5 transition-colors group", index % 2 === 0 ? "bg-white" : "bg-muted/30" )}
                  >
                    <TableCell className="text-muted-foreground text-[10px] font-medium">
                      {format( new Date( inv.investmentDate ), "HH:mm" )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-600">
                      <div className="flex flex-col items-end">
                        <span>{formatIDR( Number( inv.amount ) )}</span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">
                          INV ID: {inv.id.slice( -6 )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate italic text-muted-foreground text-xs">
                      {inv.note || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-medium">{inv.createdBy?.name || "System"}</span>
                        <span className="text-[9px] text-muted-foreground uppercase">Admin</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <InvestmentFormDialog 
                          initialData={inv}
                          trigger={
                            <Button variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />
                        <Button variant="ghost"
                          size="icon"
                          onClick={() => handleDelete( inv.id )}
                          className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
