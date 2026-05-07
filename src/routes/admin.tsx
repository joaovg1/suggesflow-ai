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
  const { user, isAdmin, loading, setActiveRole } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Sug[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && user && !isAdmin) navigate({ to: "/dashboard" });
    if (!loading && isAdmin) setActiveRole("admin");
  }, [user, isAdmin, loading, navigate, setActiveRole]);


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
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const update = async (id: string, patch: Partial<Sug>) => {
    const { error } = await supabase.from("suggestions").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Atualizado!");
    load();
  };

  const statusBadge = (s: Sug["status"]) => {
    const map = {
      pending: { label: "Pendente", cls: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
      approved: { label: "Aprovada", cls: "bg-primary/10 text-primary border-primary/20" },
      rejected: { label: "Recusada", cls: "bg-destructive/10 text-destructive border-destructive/20" },
    };
    return <Badge className={map[s].cls} variant="outline">{map[s].label}</Badge>;
  };

  if (loading || !user || role !== "admin") return null;

  const stats = {
    total: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    approved: items.filter((i) => i.status === "approved").length,
    rejected: items.filter((i) => i.status === "rejected").length,
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)", opacity: 0.12 }} />
        <div aria-hidden className="absolute -top-20 right-10 h-64 w-64 rounded-full blur-3xl opacity-20 -z-10" style={{ background: "var(--gradient-primary)" }} />
        <div className="container mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" /> Área restrita
          </div>
          <h1 className="mt-2 text-3xl font-bold">Painel do Administrador</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie todas as sugestões enviadas pelos funcionários.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Total", value: stats.total, icon: Inbox, color: "text-foreground" },
              { label: "Pendentes", value: stats.pending, icon: Clock, color: "text-amber-500" },
              { label: "Aprovadas", value: stats.approved, icon: CheckCircle2, color: "text-primary" },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl border bg-card/80 backdrop-blur p-5 flex items-center gap-4" style={{ boxShadow: "var(--shadow-soft)" }}>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent">
                  <c.icon className={`h-6 w-6 ${c.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary" /> Sugestões recebidas
          </h2>
          <div className="flex gap-1 rounded-lg border p-1 bg-card">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-md transition ${filter === f ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                {f === "all" ? "Todas" : f === "pending" ? "Pendentes" : f === "approved" ? "Aprovadas" : "Recusadas"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              Nenhuma sugestão {filter !== "all" ? "nesta categoria" : "recebida ainda"}.
            </div>
          ) : filtered.map((s) => (
            <div key={s.id} className="rounded-2xl border bg-card p-6 transition hover:shadow-lg" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-accent text-primary font-bold">
                    {(authors[s.user_id] ?? "F").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{s.title}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" /> {authors[s.user_id] ?? "Funcionário"} · {new Date(s.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
                {statusBadge(s.status)}
              </div>

              <p className="mt-4 text-sm whitespace-pre-wrap leading-relaxed">{s.description}</p>

              {s.ai_cost_estimate && (
                <div className="mt-4 rounded-xl border bg-accent/40 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Sparkles className="h-4 w-4" /> Análise da IA
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-wrap leading-relaxed">{s.ai_cost_estimate}</p>
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquareReply className="h-4 w-4 text-primary" /> Resposta ao funcionário
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
