import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, Outlet, useRouter } from "@tanstack/react-router";
import {
  Bell,
  Coins,
  Film,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  ShieldCheck,
  Tag,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";
import { useAppStore } from "../store/appStore";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Create", path: "/create", icon: PlusCircle },
  { label: "Library", path: "/library", icon: Film },
  { label: "Pricing", path: "/pricing", icon: Tag },
];

function SidebarContent({
  mobile = false,
  onClose,
}: { mobile?: boolean; onClose?: () => void }) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const principal = identity?.getPrincipal().toString() || "";
  const { ensureProfile, getProfile } = useAppStore();
  const profile = principal ? getProfile(principal) : null;
  const credits = profile?.credits ?? 0;
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  useEffect(() => {
    if (principal) ensureProfile(principal);
  }, [principal, ensureProfile]);

  const truncate = (p: string) =>
    p.length > 16 ? `${p.slice(0, 8)}...${p.slice(-4)}` : p;

  return (
    <div
      className={`flex flex-col h-full ${mobile ? "w-72" : "w-64"} bg-sidebar border-r border-sidebar-border`}
    >
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.50 0.23 278), oklch(0.55 0.22 302))",
          }}
        >
          S
        </div>
        <div>
          <div className="font-display font-bold text-foreground text-sm">
            Sora 2
          </div>
          <div className="text-xs text-muted-foreground">CINE AI Studio</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              data-ocid={`nav.${item.label.toLowerCase()}.link`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "nav-active"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/admin"
            onClick={onClose}
            data-ocid="nav.admin.link"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentPath === "/admin"
                ? "nav-active"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <ShieldCheck size={18} />
            Admin
          </Link>
        )}
      </nav>
      <div className="px-3 pb-4">
        <div className="bg-accent rounded-xl p-4 border border-border mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Coins size={13} />
              Credits
            </div>
            <span className="text-sm font-bold text-gold">
              {credits.toLocaleString()}
            </span>
          </div>
          <Progress
            value={Math.min((credits / 300) * 100, 100)}
            className="h-1.5 mb-3"
          />
          <Link to="/pricing" onClick={onClose}>
            <Button
              size="sm"
              className="w-full btn-generate text-white text-xs font-semibold h-8"
              data-ocid="sidebar.upgrade.button"
            >
              <Zap size={12} className="mr-1" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>
        {identity ? (
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {principal.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">
                {truncate(principal)}
              </div>
              <div className="text-xs text-muted-foreground">Free Plan</div>
            </div>
            <button
              type="button"
              onClick={() => clear()}
              className="text-muted-foreground hover:text-foreground"
              data-ocid="sidebar.logout.button"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full"
            size="sm"
            data-ocid="sidebar.login.button"
          >
            {isLoggingIn ? "Connecting..." : "Connect"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Layout() {
  const { identity, isInitializing } = useInternetIdentity();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const principal = identity?.getPrincipal().toString() || "";

  useEffect(() => {
    if (!isInitializing && !identity) {
      router.navigate({ to: "/" });
    }
  }, [isInitializing, identity, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden md:flex flex-shrink-0">
        <SidebarContent />
      </aside>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close sidebar"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="relative z-10"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <SidebarContent mobile onClose={() => setSidebarOpen(false)} />
            </motion.div>
            <button
              type="button"
              className="absolute top-4 right-4 text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-border flex-shrink-0 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-muted-foreground"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-display font-semibold text-foreground text-sm capitalize">
              {currentPath.replace("/", "") || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Search size={16} />
            </button>
            <button
              type="button"
              className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {principal.slice(0, 2).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
