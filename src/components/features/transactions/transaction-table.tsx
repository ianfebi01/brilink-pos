"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Customer Fee</TableHead>
            <TableHead className="text-right">Agent Profit</TableHead>
            <TableHead className="text-right">Total Paid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map( ( tx ) => (
            <TableRow key={tx.id}>
              <TableCell>{format( new Date( tx.createdAt ), "dd MMM yyyy HH:mm" )}</TableCell>
              <TableCell>{tx.category?.name}</TableCell>
              <TableCell className="text-right font-medium">{formatIDR( Number( tx.transactionAmount ) )}</TableCell>
              <TableCell className="text-right">{formatIDR( Number( tx.customerFee ) )}</TableCell>
              <TableCell className="text-right text-green-600 font-medium">{formatIDR( Number( tx.agentProfit ) )}</TableCell>
              <TableCell className="text-right font-bold">{formatIDR( Number( tx.totalPaid ) )}</TableCell>
            </TableRow>
          ) )}
        </TableBody>
      </Table>
    </div>
  );
}
