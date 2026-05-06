import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, XCircle, MessageSquareReply, Inbox, Clock, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({ component: Admin });

type Sug = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  ai_cost_estimate: string | null;
  admin_response: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function Admin() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Sug[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && user && role && role !== "admin") navigate({ to: "/dashboard" });
  }, [user, role, loading, navigate]);

  const load = async () => {
    const { data } = await supabase.from("suggestions").select("*").order("created_at", { ascending: false });
    const list = (data ?? []) as Sug[];
    setItems(list);
    const userIds = [...new Set(list.map((s) => s.user_id))];
    if (userIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p: any) => (map[p.id] = p.display_name));
      setAuthors(map);
    }
  };
  useEffect(() => { if (role === "admin") load(); }, [role]);

  const update = async (id: string, patch: Partial<Sug>) => {
    const { error } = await supabase.from("suggestions").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Atualizado!");
    load();
  };

  const statusBadge = (s: Sug["status"]) => {
    const map = {
      pending: { label: "Pendente", cls: "bg-muted text-muted-foreground" },
      approved: { label: "Aprovada", cls: "bg-primary/10 text-primary border-primary/20" },
      rejected: { label: "Recusada", cls: "bg-destructive/10 text-destructive" },
    };
    return <Badge className={map[s].cls} variant="outline">{map[s].label}</Badge>;
  };

  if (loading || !user || role !== "admin") return null;

  const stats = {
    total: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    approved: items.filter((i) => i.status === "approved").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold">Painel do Administrador</h1>
        <p className="text-sm text-muted-foreground">Todas as sugestões dos funcionários</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total", value: stats.total },
            { label: "Pendentes", value: stats.pending },
            { label: "Aprovadas", value: stats.approved },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border bg-card p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-3xl font-bold text-primary">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              Nenhuma sugestão recebida ainda.
            </div>
          ) : items.map((s) => (
            <div key={s.id} className="rounded-2xl border bg-card p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    Por {authors[s.user_id] ?? "Funcionário"} · {new Date(s.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                {statusBadge(s.status)}
              </div>

              <p className="mt-3 text-sm whitespace-pre-wrap">{s.description}</p>

              {s.ai_cost_estimate && (
                <div className="mt-4 rounded-xl border bg-accent/40 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Sparkles className="h-4 w-4" /> Estimativa da IA
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{s.ai_cost_estimate}</p>
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquareReply className="h-4 w-4" /> Resposta ao funcionário
                </div>
                <Textarea
                  rows={3}
                  defaultValue={s.admin_response ?? ""}
                  onChange={(e) => setResponses((p) => ({ ...p, [s.id]: e.target.value }))}
                  placeholder="Escreva uma resposta..."
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline"
                    onClick={() => update(s.id, { admin_response: responses[s.id] ?? s.admin_response ?? "" })}>
                    Salvar resposta
                  </Button>
                  <Button size="sm" className="bg-primary"
                    onClick={() => update(s.id, { status: "approved", admin_response: responses[s.id] ?? s.admin_response ?? null })}>
                    <CheckCircle2 className="mr-1 h-4 w-4" /> Aprovar
                  </Button>
                  <Button size="sm" variant="destructive"
                    onClick={() => update(s.id, { status: "rejected", admin_response: responses[s.id] ?? s.admin_response ?? null })}>
                    <XCircle className="mr-1 h-4 w-4" /> Recusar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
