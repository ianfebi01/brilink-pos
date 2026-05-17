import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, Settings, PiggyBank, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name : "Dashboard", href : "/", icon : LayoutDashboard },
  { name : "Transaksi", href : "/transactions", icon : ReceiptText },
  { name : "Aturan Fee", href : "/fee-rules", icon : Settings },
  { name : "Investasi", href : "/investments", icon : PiggyBank },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-bold text-sidebar-foreground">BRILink Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map( ( item ) => {
          const isActive = pathname === item.href || pathname.startsWith( `${item.href}/` ) && item.href !== "/";
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/70"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        } )}
      </nav>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => signOut( { callbackUrl : "/login" } )}
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </div>
    </div>
  );
}
