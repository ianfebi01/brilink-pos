"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RecentActivityProps {
  transactions: any[];
}

export function RecentActivity( { transactions }: RecentActivityProps ) {
  return (
    <div className="space-y-8">
      {transactions.map( ( tx ) => (
        <div key={tx.id}
          className="flex items-center"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {tx.category?.name?.slice( 0, 2 ).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{tx.category?.name}</p>
            <p className="text-xs text-muted-foreground">
              {tx.customerName || "Tanpa Nama"} • {new Date( tx.createdAt ).toLocaleTimeString( "id-ID", { hour : "2-digit", minute : "2-digit" } )}
            </p>
          </div>
          <div className="ml-auto font-medium text-sm">
            +{new Intl.NumberFormat( "id-ID", {
              style                 : "currency",
              currency              : "IDR",
              maximumFractionDigits : 0,
            } ).format( Number( tx.agentProfit ) )}
          </div>
        </div>
      ) )}
      {transactions.length === 0 && (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Belum ada aktivitas transaksi.
        </div>
      )}
    </div>
  );
}
