"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OverviewChartProps {
  data: {
    date: string;
    income: number;
    volume: number;
  }[];
}

export function OverviewChart( { data }: OverviewChartProps ) {
  return (
    <ResponsiveContainer width="100%"
      height={350}
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3"
          vertical={false}
          className="stroke-muted" 
        />
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={( value ) => {
            const date = new Date( value );
            
            return date.toLocaleDateString( "id-ID", { weekday : "short" } );
          }}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={( value ) => `Rp ${value / 1000}k`}
        />
        <Tooltip 
          cursor={{ fill : "rgba(0,0,0,0.05)" }}
          content={( { active, payload } ) => {
            if ( active && payload && payload.length ) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Laba
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {new Intl.NumberFormat( "id-ID", {
                          style    : "currency",
                          currency : "IDR",
                        } ).format( payload[0].value as number )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          }}
        />
        <Bar
          dataKey="income"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
