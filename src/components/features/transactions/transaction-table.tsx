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
import { SearchInput } from "@/components/ui/search-input";
import { PaginationControls } from "@/components/ui/pagination-controls";

function formatIDR( amount: number ) {
  return new Intl.NumberFormat( "id-ID", {
    style                 : "currency",
    currency              : "IDR",
    minimumFractionDigits : 0,
  } ).format( amount );
}

import { DateRangeFilter } from "./date-range-filter";
import { Edit2, Trash2 } from "lucide-react";
import { deleteTransaction } from "@/actions/transactions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TransactionFormDialog } from "./transaction-form-dialog";

export function TransactionTable( { 
  transactions, 
  total,
  page,
  limit,
  categories = [],
  feeRules = []
}: { 
  transactions: any[];
  total: number;
  page: number;
  limit: number;
  categories?: any[];
  feeRules?: any[];
} ) {
  const { data : session } = useSession();
  const isSuperAdmin = ( session?.user as any )?.role === ROLES.SUPERADMIN;

  const handleDelete = async ( id: string ) => {
    if ( !confirm( "Apakah Anda yakin ingin menghapus transaksi ini?" ) ) return;
    
    const res = await deleteTransaction( id );
    if ( res.success ) {
      toast.success( "Transaksi berhasil dihapus" );
    } else {
      toast.error( res.error || "Gagal menghapus transaksi" );
    }
  };

  const groups = transactions.reduce( ( acc: any, tx: any ) => {
    const dateKey = format( new Date( tx.createdAt ), "yyyy-MM-dd" );
    if ( !acc[dateKey] ) acc[dateKey] = [];
    acc[dateKey].push( tx );
    
    return acc;
  }, {} );

  const sortedDates = Object.keys( groups ).sort( ( a, b ) => b.localeCompare( a ) );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <SearchInput placeholder="Cari nama pelanggan atau catatan..." 
          className="w-full md:max-w-sm"
        />
        {isSuperAdmin && <DateRangeFilter />}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[180px]">Tanggal</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead className="text-right">Fee Pelanggan</TableHead>
              {isSuperAdmin && <TableHead className="text-right">Laba Agen</TableHead>}
              <TableHead className="text-right">Total Bayar</TableHead>
              {isSuperAdmin && <TableHead className="text-right w-[100px]">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 7 : 5}
                  className="h-24 text-center text-muted-foreground"
                >
                    Tidak ada transaksi ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              sortedDates.map( ( date ) => {
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
                    <TableRow className="bg-muted/10 hover:bg-muted/20 border-b">
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground/80">{dateLabel}</span>
                        </div>
                      </TableCell>
                      <TableCell colSpan={1}>
                        <Badge variant="secondary"
                          className="rounded-md font-normal bg-background/50"
                        >
                          {dayTransactions.length} Transaksi
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground/70"
                        colSpan={isSuperAdmin ? 5 : 3}
                      >
                        {formatIDR( totalAmount )}
                      </TableCell>
                    </TableRow>
                    {dayTransactions.map( ( tx: any, index: number ) => (
                      <TableRow key={tx.id}
                        className={cn( "hover:bg-primary/5 transition-colors group", index % 2 === 0 ? "bg-white" : "bg-muted/5" )}
                      >
                        <TableCell className="text-muted-foreground text-[10px] font-medium">
                          {format( new Date( tx.createdAt ), "HH:mm" )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{tx.category?.name}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">
                                  ID: {tx.id.slice( -6 )}
                              </span>
                              {tx.customerName && (
                                <span className="text-[9px] text-primary/70 font-bold uppercase truncate max-w-[100px]">
                                    • {tx.customerName}
                                </span>
                              )}
                              {tx.note && (
                                <span className="text-[9px] text-muted-foreground uppercase truncate max-w-[100px]">
                                    • {tx.note}
                                </span>
                              )}
                            </div>
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
                        {isSuperAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <TransactionFormDialog 
                                initialData={tx}
                                categories={categories}
                                feeRules={feeRules}
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
                                onClick={() => handleDelete( tx.id )}
                                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ) )}
                  </React.Fragment>
                );
              } )
            )}
          </TableBody>
        </Table>
      </div>
      <PaginationControls total={total}
        page={page}
        limit={limit}
      />
    </div>
  );
}
