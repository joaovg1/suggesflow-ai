import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({ component: AuthPage });

const emailSchema = z.string().trim().email("E-mail inválido").max(255);
const passSchema = z.string().min(6, "Mínimo 6 caracteres").max(72);
const nameSchema = z.string().trim().min(2, "Nome muito curto").max(80);

function AuthPage() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginRole, setLoginRole] = useState<"admin" | "employee">("employee");

  // Register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  useEffect(() => {
    if (!loading && user && role) {
      navigate({ to: role === "admin" ? "/admin" : "/dashboard" });
    }
  }, [user, role, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(loginEmail);
      passSchema.parse(loginPass);
    } catch (err) {
      if (err instanceof z.ZodError) return toast.error(err.issues[0].message);
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPass });
    if (error) { setBusy(false); return toast.error(error.message); }

    const { data: roleRow } = await supabase
      .from("user_roles").select("role").eq("user_id", data.user.id).maybeSingle();
    const actualRole = roleRow?.role ?? "employee";

    if (loginRole === "admin" && actualRole !== "admin") {
      await supabase.auth.signOut();
      setBusy(false);
      return toast.error("Você não tem permissão de administrador.");
    }
    toast.success(actualRole === "admin" ? "Bem-vindo, administrador!" : "Login realizado!");
    setBusy(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      nameSchema.parse(name);
      emailSchema.parse(email);
      passSchema.parse(pass);
    } catch (err) {
      if (err instanceof z.ZodError) return toast.error(err.issues[0].message);
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: name },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! O primeiro usuário se torna administrador.");
  };

  return (
    <div className="min-h-screen bg-background grid place-items-center px-4 py-10" style={{ backgroundImage: "radial-gradient(circle at 20% 0%, oklch(0.93 0.05 245 / 0.6), transparent 50%)" }}>
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <Lightbulb className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">IdeaBox</span>
        </Link>

        <div className="rounded-2xl border bg-card p-6 shadow-xl" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Registrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label>E-mail</Label>
                  <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                </div>
                <div>
                  <Label>Senha</Label>
                  <Input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} required />
                </div>
                <div>
                  <Label className="mb-2 block">Entrar como</Label>
                  <RadioGroup value={loginRole} onValueChange={(v) => setLoginRole(v as any)} className="grid grid-cols-2 gap-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-accent">
                      <RadioGroupItem value="employee" /> <span className="text-sm">Funcionário</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-accent">
                      <RadioGroupItem value="admin" /> <span className="text-sm">Administrador</span>
                    </label>
                  </RadioGroup>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "Entrando..." : "Entrar"}</Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label>E-mail</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label>Senha</Label>
                  <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} required />
                </div>
                <p className="text-xs text-muted-foreground">
                  O primeiro usuário registrado se torna administrador automaticamente. Os demais entram como funcionários.
                </p>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "Criando..." : "Criar conta"}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
