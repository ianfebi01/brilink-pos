import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, Settings, PiggyBank, List, LogOut, Menu } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { ROLES, ROUTE_PERMISSIONS } from "@/lib/rbac";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { name : "Dashboard", href : "/", icon : LayoutDashboard },
  { name : "Transaksi", href : "/transactions", icon : ReceiptText },
  { name : "Aturan Fee", href : "/fee-rules", icon : Settings },
  { name : "Kategori", href : "/categories", icon : List },
  { name : "Investasi", href : "/investments", icon : PiggyBank },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data : session } = useSession();
  const userRole = ( session?.user as any )?.role || ROLES.ADMIN;
  const [open, setOpen] = useState( false );

  const filteredItems = navItems.filter( item => {
    const allowedRoutes = ROUTE_PERMISSIONS[userRole as keyof typeof ROUTE_PERMISSIONS] || [];
    
    return allowedRoutes.some( route => {
      if ( route === "/" ) return item.href === "/";
      
      return item.href.startsWith( route );
    } );
  } );

  const NavContent = () => (
    <>
      <div className="flex h-14 items-center border-b border-white/20 px-4 shrink-0">
        <h1 className="text-lg font-bold text-sidebar-foreground">BRILink Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {filteredItems.map( ( item ) => {
          const isActive = pathname === item.href || pathname.startsWith( `${item.href}/` ) && item.href !== "/";
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen( false )}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/70"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        } )}
      </nav>
      <div className="border-t border-white/20 p-4 shrink-0">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => signOut( { callbackUrl : "/login" } )}
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex h-14 shrink-0 items-center border-b border-white/20 px-4 justify-between bg-sidebar text-sidebar-foreground">
        <h1 className="text-lg font-bold text-sidebar-foreground">BRILink Admin</h1>
        <Sheet open={open}
          onOpenChange={setOpen}
        >
          <SheetTrigger render={
            <Button variant="ghost"
              size="icon"
              className="text-sidebar-foreground/80"
            >
              <Menu className="h-5 w-5" />
            </Button>
          } />
          <SheetContent side="left"
            className="w-full sm:w-80 p-0 flex flex-col bg-sidebar text-sidebar-foreground border-r-0"
          >
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground shrink-0 overflow-hidden">
        <NavContent />
      </div>
    </>
  );
}
