# admin-users production setup

Project ref:

```bash
qfudjuixizgdblolysbh
```

## 1. Install Supabase CLI if needed

```powershell
npm install -g supabase
supabase --version
```

## 2. Login and link

```powershell
supabase login
supabase link --project-ref qfudjuixizgdblolysbh
```

## 3. Configure function secrets

Create a local file that is not committed:

```powershell
Copy-Item supabase/functions/.env.example supabase/functions/.env
```

Edit `supabase/functions/.env`:

```env
SUPABASE_URL=https://qfudjuixizgdblolysbh.supabase.co
SUPABASE_ANON_KEY=your-project-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-project-service-role-key
```

Then upload secrets:

```powershell
supabase secrets set --env-file supabase/functions/.env
```

## 4. Apply database migration

```powershell
supabase db push
```

If your current app user is not `desarrollador`, promote it by email:

```powershell
supabase db execute --linked --sql "insert into public.perfiles (id, nombre, rol) select id, coalesce(raw_user_meta_data->>'nombre', email), 'desarrollador' from auth.users where lower(email) = lower('TU_CORREO_AQUI') on conflict (id) do update set rol = 'desarrollador';"
```

## 5. Deploy function

```powershell
supabase functions deploy admin-users
```

## 6. Smoke test

Log into the app with a user whose `perfiles.rol` is `desarrollador`, then open `/usuarios`.
