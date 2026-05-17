import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDashboardStats } from '@/actions/transactions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReceiptText, TrendingUp, Activity, PiggyBank } from 'lucide-react'

import { OverviewChart } from '@/components/features/dashboard/overview-chart'
import { RecentActivity } from '@/components/features/dashboard/recent-activity'

function formatIDR( amount: number ) {
  return new Intl.NumberFormat( 'id-ID', {
    style                 : 'currency',
    currency              : 'IDR',
    minimumFractionDigits : 0,
  } ).format( amount )
}

export default async function DashboardPage() {
  const session = await getServerSession( authOptions )

  if ( !session ) {
    redirect( '/login' )
  }

  const { data } = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Beranda</h2>
        <p className="text-muted-foreground">
          Selamat datang kembali, {session.user?.name}. Berikut adalah ringkasan Anda hari ini.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transaksi Hari Ini
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.transactionsCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Laba Hari Ini
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatIDR( data?.totalIncome || 0 )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Volume Transaksi
            </CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatIDR( data?.totalTransactionAmount || 0 )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Investasi
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatIDR( data?.totalInvestments || 0 )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
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
        <Card className="lg:col-span-3">
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
