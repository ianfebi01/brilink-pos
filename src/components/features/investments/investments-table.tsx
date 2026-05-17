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

export function InvestmentsTable( { investments }: { investments: any[] } ) {
  if ( !investments.length ) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        No investments found.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Created By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map( ( inv ) => (
            <TableRow key={inv.id}>
              <TableCell>{format( new Date( inv.investmentDate ), "dd MMM yyyy" )}</TableCell>
              <TableCell className="font-medium text-blue-600">{formatIDR( Number( inv.amount ) )}</TableCell>
              <TableCell>{inv.note || "-"}</TableCell>
              <TableCell className="text-muted-foreground">{inv.createdBy?.name || "System"}</TableCell>
            </TableRow>
          ) )}
        </TableBody>
      </Table>
    </div>
  );
}
