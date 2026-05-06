import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, PlusCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type Suggestion = {
  id: string;
  title: string;
  description: string;
  ai_cost_estimate: string | null;
  admin_response: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const titleSchema = z.string().trim().min(3, "Título muito curto").max(120);
const descSchema = z.string().trim().min(10, "Descrição muito curta").max(2000);

function Dashboard() {
  const { user, loading, role } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Suggestion[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("suggestions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setItems((data ?? []) as Suggestion[]);
  };
  useEffect(() => { load(); }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { titleSchema.parse(title); descSchema.parse(desc); }
    catch (err) { if (err instanceof z.ZodError) return toast.error(err.issues[0].message); }
    if (!user) return;
    setBusy(true);

    let estimate: string | null = null;
    try {
      const { data, error } = await supabase.functions.invoke("estimate-cost", {
        body: { title, description: desc },
      });
      if (error) throw error;
      estimate = data?.estimate ?? null;
    } catch (err) {
      console.error(err);
      toast.warning("IA indisponível — sugestão será enviada sem estimativa.");
    }

    const { error } = await supabase.from("suggestions").insert({
      user_id: user.id, title, description: desc, ai_cost_estimate: estimate,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Sugestão enviada!");
    setTitle(""); setDesc(""); load();
  };

  const statusBadge = (s: Suggestion["status"]) => {
    const map = {
      pending: { label: "Pendente", cls: "bg-muted text-muted-foreground" },
      approved: { label: "Aprovada", cls: "bg-primary/10 text-primary border-primary/20" },
      rejected: { label: "Recusada", cls: "bg-destructive/10 text-destructive" },
    };
    return <Badge className={map[s].cls} variant="outline">{map[s].label}</Badge>;
  };

  if (loading || !user) return null;

  const stats = {
    total: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    approved: items.filter((i) => i.status === "approved").length,
    rejected: items.filter((i) => i.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)", opacity: 0.1 }} />
        <div className="container mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold">Olá, {user.email?.split("@")[0]} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Compartilhe ideias para tornar a empresa ainda melhor.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[
              { label: "Total", value: stats.total, cls: "text-foreground" },
              { label: "Pendentes", value: stats.pending, cls: "text-muted-foreground" },
              { label: "Aprovadas", value: stats.approved, cls: "text-primary" },
              { label: "Recusadas", value: stats.rejected, cls: "text-destructive" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border bg-card/80 backdrop-blur p-4">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className={`mt-1 text-2xl font-bold ${c.cls}`}>{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <section>
            <div className="rounded-2xl border bg-card p-6 sticky top-24" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
                  <PlusCircle className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Nova sugestão</h2>
                  <p className="text-xs text-muted-foreground">Sua ideia será analisada pela IA.</p>
                </div>
              </div>
              <form onSubmit={submit} className="mt-5 space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Melhorar processo de onboarding" />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea rows={6} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Explique sua ideia em detalhes..." />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {busy ? "Analisando com IA..." : "Enviar sugestão"}
                </Button>
                <p className="text-xs text-muted-foreground">A IA gerará automaticamente uma estimativa de custos para o administrador.</p>
              </form>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Minhas sugestões
            </h2>
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center text-sm text-muted-foreground">
                Nenhuma sugestão ainda. Envie sua primeira ideia!
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((s) => (
                  <div key={s.id} className="rounded-2xl border bg-card p-5 transition hover:shadow-md" style={{ boxShadow: "var(--shadow-soft)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold">{s.title}</h3>
                      {statusBadge(s.status)}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{s.description}</p>
                    {s.admin_response && (
                      <div className="mt-4 rounded-lg border-l-4 border-primary bg-accent/40 p-3">
                        <p className="text-xs font-medium text-primary">Resposta do administrador</p>
                        <p className="mt-1 text-sm text-foreground">{s.admin_response}</p>
                      </div>
                    )}
                    {role === "admin" && s.ai_cost_estimate && (
                      <details className="mt-3 text-xs text-muted-foreground">
                        <summary className="cursor-pointer">Estimativa IA</summary>
                        <p className="mt-1 whitespace-pre-wrap">{s.ai_cost_estimate}</p>
                      </details>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
