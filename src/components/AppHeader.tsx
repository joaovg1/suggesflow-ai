import { Link, useNavigate } from "@tanstack/react-router";
import { Lightbulb, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AppHeader() {
  const { role, signOut, user } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <Lightbulb className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">IdeaBox</span>
          {role && <Badge variant="secondary" className="ml-2 capitalize">{role === "admin" ? "Administrador" : "Funcionário"}</Badge>}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
            <LogOut className="mr-2 h-4 w-4" />Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
