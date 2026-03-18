import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  Calculator,
  ChevronRight,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/employees", label: "Employees", icon: Users },
  { path: "/salary-processing", label: "Salary Processing", icon: Calculator },
  { path: "/payslip", label: "Payslip", icon: FileText },
  { path: "/reports", label: "Reports", icon: BarChart2 },
];

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/employees": "Employees",
  "/salary-processing": "Salary Processing",
  "/payslip": "Payslip",
  "/reports": "Reports",
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clear, identity } = useInternetIdentity();
  const qc = useQueryClient();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const pageTitle = PAGE_TITLES[currentPath] ?? "SalaryFlow";

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principalStr
    ? `${principalStr.slice(0, 8)}...`
    : "Admin";
  const initials = "AD";

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={`${
        mobile ? "flex" : "hidden lg:flex"
      } flex-col w-60 bg-sidebar border-r border-sidebar-border h-full shrink-0`}
    >
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg text-sidebar-foreground tracking-tight">
          SalaryFlow
        </span>
        {mobile && (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              data-ocid={`nav.${item.label.toLowerCase().replace(/ /g, "_")}.link`}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon
                className={`shrink-0 ${active ? "text-primary" : ""}`}
                style={{ width: "18px", height: "18px" }}
              />
              {item.label}
              {active && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-sidebar-border pt-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              Admin
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {shortPrincipal}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            data-ocid="nav.logout.button"
            className="text-muted-foreground hover:text-destructive transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarContent />

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          />
          <div className="relative z-50 h-full">
            <SidebarContent mobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="relative text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="topbar.bell.button"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground hidden sm:inline">
              Admin
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-ocid="topbar.logout.button"
              className="text-muted-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
