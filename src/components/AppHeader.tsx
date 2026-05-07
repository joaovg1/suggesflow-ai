import { Link, useNavigate } from "@tanstack/react-router";
import { Lightbulb, LogOut, LayoutDashboard, ShieldCheck, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppHeader() {
  const { role, isAdmin, setActiveRole, signOut, user } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="border-b bg-background/70 backdrop-blur-xl sticky top-0 z-20">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg shadow-lg" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-elegant)" }}>
            <Lightbulb className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">IdeaBox</span>
          {role && (
            <Badge variant="secondary" className="ml-2 capitalize gap-1">
              {role === "admin" ? <ShieldCheck className="h-3 w-3" /> : <LayoutDashboard className="h-3 w-3" />}
              {role === "admin" ? "Administrador" : "Funcionário"}
            </Badge>
          )}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
          {isAdmin && role === "employee" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setActiveRole("admin"); navigate({ to: "/admin" }); }}
            >
              <RefreshCw className="mr-1 h-4 w-4" />Mudar para Admin
            </Button>
          )}
          {isAdmin && role === "admin" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setActiveRole("employee"); navigate({ to: "/dashboard" }); }}
            >
              <RefreshCw className="mr-1 h-4 w-4" />Ver como Funcionário
            </Button>
          )}
          {role === "admin" && (
            <Link to="/admin"><Button variant="ghost" size="sm"><ShieldCheck className="mr-1 h-4 w-4" />Admin</Button></Link>
          )}
          {user && (
            <Link to="/dashboard"><Button variant="ghost" size="sm"><LayoutDashboard className="mr-1 h-4 w-4" />Dashboard</Button></Link>
          )}
          <ThemeToggle />
          {user && (
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
              <LogOut className="mr-1 h-4 w-4" />Sair
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
