import { createFileRoute, Link } from "@tanstack/react-router";
import { Lightbulb, Sparkles, ShieldCheck, MessageSquare, ArrowRight, Zap, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/auth"><Button>Entrar</Button></Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)", opacity: 0.12 }} />
        <div aria-hidden className="absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl opacity-30 -z-10" style={{ background: "var(--gradient-primary)" }} />
        <div aria-hidden className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-20 -z-10" style={{ background: "var(--gradient-primary)" }} />
        <div className="container mx-auto px-6 py-24 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Análise de custos com IA
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Transforme ideias em <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>resultados</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Funcionários enviam sugestões, a IA estima o custo de implementação e administradores decidem o que aprovar — tudo em uma plataforma moderna.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/auth"><Button size="lg" className="shadow-lg">Começar agora <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-6 px-6 pb-16 md:grid-cols-3">
        {[
          { icon: MessageSquare, title: "Envio fácil", desc: "Funcionários enviam sugestões em segundos." },
          { icon: Sparkles, title: "IA estima custos", desc: "Resumo automático com faixa de investimento e prazo." },
          { icon: ShieldCheck, title: "Aprovação segura", desc: "Apenas administradores aprovam e respondem." },
        ].map((f) => (
          <div key={f.title} className="group rounded-2xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-xl" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-accent text-primary group-hover:scale-110 transition"><f.icon className="h-5 w-5" /></div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="container mx-auto px-6 pb-24">
        <div className="rounded-3xl border bg-card p-10 text-center" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
          <h2 className="text-3xl font-bold text-primary-foreground">Como funciona</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3 text-left">
            {[
              { icon: Users, n: "1", t: "Funcionários sugerem", d: "Cada colaborador acessa seu painel e envia ideias para melhorar a empresa." },
              { icon: Zap, n: "2", t: "IA analisa", d: "Em segundos a IA gera um resumo com custo estimado e prazo de implementação." },
              { icon: BarChart3, n: "3", t: "Admin decide", d: "O administrador aprova, recusa ou responde — e o funcionário vê a resposta." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-background/95 p-6 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-bold">{s.n}</div>
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} IdeaBox — Sugestões inteligentes para sua empresa.
        </div>
      </footer>
    </div>
  );
}
