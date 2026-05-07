-- Verificar usuários em auth.users
SELECT COUNT(*) as total_users FROM auth.users;

-- Verificar perfis em public.profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Ver usuários sem perfil
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Ver perfis sem usuário (se existir)
SELECT p.id, p.display_name, p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;