## Problema

Ao logar como admin, o app consulta `user_roles` e recebe **403: "permission denied for function has_role"**. A política RLS de `user_roles` usa `has_role(auth.uid(), 'admin')`, mas o role `authenticated` do Postgres não tem `EXECUTE` nessa função — qualquer SELECT na tabela falha, e o app assume "employee".

Você (`joao.goncalvesrv@gmail.com`) **já está como admin** no banco. É só destravar a permissão.

## Correção (migration SQL)

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
```

Isso permite que a política RLS execute a função sem expor dados (a função é `SECURITY DEFINER` e só retorna boolean).

## Como usar depois

1. Vá em `/auth` → aba **Entrar**
2. Email: `joao.goncalvesrv@gmail.com` + senha
3. Em "Entrar como" selecione **Administrador**
4. Você será redirecionado para `/admin` automaticamente
