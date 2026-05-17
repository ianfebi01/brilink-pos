import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDashboardStats } from '@/actions/transactions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReceiptText, TrendingUp, Activity, PiggyBank } from 'lucide-react'

import { OverviewChart } from '@/components/features/dashboard/overview-chart'
import { RecentActivity } from '@/components/features/dashboard/recent-activity'

import { PeriodSwitcher } from '@/components/features/dashboard/period-switcher'
import { cn } from '@/lib/utils'

function formatIDR( amount: number ) {
  return new Intl.NumberFormat( 'id-ID', {
    style                 : 'currency',
    currency              : 'IDR',
    minimumFractionDigits : 0,
  } ).format( amount )
}

export default async function DashboardPage( { 
  searchParams 
}: { 
  searchParams: { period?: string } 
} ) {
  const session = await getServerSession( authOptions )
  const period = ( ( await searchParams ).period || "daily" ) as "daily" | "monthly";

  if ( !session ) {
    redirect( '/login' )
  }

  const { data } = await getDashboardStats( period )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Beranda</h2>
          <p className="text-muted-foreground">
            Selamat datang kembali, {session.user?.name}. Berikut adalah ringkasan Anda {period === "daily" ? "hari ini" : "bulan ini"}.
          </p>
        </div>
        <PeriodSwitcher />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-muted/40 border-none ring-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transaksi {period === "daily" ? "Hari Ini" : "Bulan Ini"}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.transactionsCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/40 border-none ring-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Laba {period === "daily" ? "Hari Ini" : "Bulan Ini"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatIDR( data?.totalIncome || 0 )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/40 border-none ring-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Volume Transaksi {period === "daily" ? "Hari Ini" : "Bulan Ini"}
            </CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatIDR( data?.totalTransactionAmount || 0 )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/40 border-none ring-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Investasi {period === "daily" ? "Hari Ini" : "Bulan Ini"}
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatIDR( data?.totalInvestments || 0 )}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Sisa:</span>
              <span className={cn(
                "text-xs font-bold",
                ( data?.remainingInvestment || 0 ) < 0 ? "text-red-600" : "text-blue-600"
              )}
              >
                {formatIDR( data?.remainingInvestment || 0 )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-muted/40 border-none ring-0 shadow-none">
          <CardHeader>
            <CardTitle>Ringkasan Laba</CardTitle>
            <CardDescription>
              Menampilkan total laba bersih Anda selama 7 hari terakhir.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={data?.chartData || []} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 bg-muted/40 border-none ring-0 shadow-none">
          <CardHeader>
            <CardTitle>Aktivitas Terkini</CardTitle>
            <CardDescription>
              5 transaksi terbaru yang berhasil dicatat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity transactions={data?.recentTransactions || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
