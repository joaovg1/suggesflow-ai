import { createFileRoute, Link } from "@tanstack/react-router";
import { Lightbulb, Sparkles, ShieldCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "IdeaBox — Sugestões inteligentes para sua empresa" },
      { name: "description", content: "Receba, analise com IA e responda sugestões dos seus funcionários em um só lugar." },
    ],
  }),
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
              <Lightbulb className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">IdeaBox</span>
          </Link>
          <Link to="/auth"><Button>Entrar</Button></Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)", opacity: 0.08 }} />
        <div className="container mx-auto px-6 py-24 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Análise de custos com IA
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Transforme ideias em <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>resultados</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Funcionários enviam sugestões, a IA estima o custo de implementação e administradores decidem o que aprovar — tudo em uma plataforma moderna.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/auth"><Button size="lg" className="shadow-lg">Começar agora</Button></Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-6 px-6 pb-24 md:grid-cols-3">
        {[
          { icon: MessageSquare, title: "Envio fácil", desc: "Funcionários enviam sugestões em segundos." },
          { icon: Sparkles, title: "IA estima custos", desc: "Resumo automático com faixa de investimento e prazo." },
          { icon: ShieldCheck, title: "Aprovação segura", desc: "Apenas administradores aprovam e respondem." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border bg-card p-6 transition hover:shadow-lg" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-accent text-primary"><f.icon className="h-5 w-5" /></div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
