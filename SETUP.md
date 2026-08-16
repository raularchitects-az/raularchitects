# Raul Architects CMS — quraşdırma

Public sayt Supabase olmadan da mövcud statik kontentlə işləyir. Admin panel (`/admin`) üçün aşağıdakılar vacibdir.

## 1. Supabase layihəsi

1. [supabase.com](https://supabase.com) üzərində yeni layihə açın.
2. **SQL Editor** → `supabase/schema.sql` faylının bütün məzmununu yapışdırıb **Run** edin.
3. Bu skript cədvəlləri, RLS siyasətlərini, `media` storage bucket-ini və 4 xidmətin draft qeydini yaradır.

## 2. İlk admin hesabı

1. Supabase → **Authentication → Users → Add user**
   - Email və şifrə verin (məs. studio emailiniz).
   - **Auto Confirm User** aktiv olsun.
2. **SQL Editor**-də istifadəçinin UUID-sini `auth.users` cədvəlindən kopyalayın, sonra:

```sql
insert into public.profiles (id, role, full_name)
values ('USER_UUID_BURAYA', 'admin', 'Raul Naghiyev')
on conflict (id) do update set role = 'admin';
```

3. `https://your-domain.com/admin/login` səhifəsindən eyni email/şifrə ilə daxil olun.

Editor hesabı eyni yolla yaradılır; `role` dəyərini `'editor'` qoyun. Editor kontent yarada/redaktə edə bilər, istifadəçi rollarını dəyişə bilməz.

## 3. Environment variables

Heç bir secret-i git-ə və ya frontend koduna yazmayın.

### Lokal `.env.local`

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

- `NEXT_PUBLIC_SUPABASE_URL` — Project Settings → API → **Project URL** yalnız: `https://YOUR_PROJECT.supabase.co`  
  Sonda `/auth/v1`, `/rest/v1`, dashboard linki (`supabase.com/dashboard/...`) və ya sayt ünvanı (`raularchitects.com`) olmasın. Bu səhv `Invalid path specified in request URL` xətası verir.  

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API → **anon public** və ya **publishable** (`eyJ...` JWT və ya `sb_publishable_...`)  
- `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API → **service_role** və ya **secret** (`eyJ...` JWT və ya `sb_secret_...`). **server-only**, heç vaxt `NEXT_PUBLIC_` prefiksi olmasın

`anon` açarı yalnız login cookie sessiyası üçündür. Kontent yazmaq/oxumaq server-side gedir; service role brauzerə çıxmır.

### Vercel

Project → Settings → Environment Variables. Production / Preview / Development üçün eyni adlar:

| Ad | Qeyd |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://raularchitects.com` (canonical və OG üçün) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yalnız `https://xxxx.supabase.co` (path yox) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public **və ya** `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role **və ya** `sb_secret_...`, **server only** |

Deploy-dan sonra `/admin/login` yoxlayın.

## 4. Media

Schema `media` adlı public bucket yaradır. Yüklənən şəkil/video orada saxlanır. İcazə verilən formatlar: JPG, PNG, WebP, AVIF, MP4, WebM. Şəkil limiti 12MB, video 80MB.

`next.config.ts` Supabase storage hostunu `images.remotePatterns` siyahısına əlavə edir.

## 5. Public sayt davranışı

- CMS-də **Published + Aktiv** olmayan layihə, portfolio, blog və xidmət public-də görünmür.
- Həmin kontent növündə heç bir published qeyd yoxdursa (və ya env yoxdursa), sayt mövcud statik kataloqa düşür — canlı sayt boş qalmır.
- **Bir dəfə** published qeyd olanda həmin bölmənin mənbəyi CMS olur. Ona görə əvvəl Dashboard-dan **Mövcud saytı import et** düyməsi ilə statik kontenti draft kimi gətirin, redaktə edin, sonra publish edin.
- Slug dəyişəndə köhnə URL `redirects` cədvəlinə 301 kimi yazılır.
- Silmə əvvəl **Archived** edir; arxivdən ikinci silmə həmişəlik silir.
- Hər yaddaşda revision saxlanır; admin formanın altından son versiyaya qayıtmaq olar.
- Bloq preview: `/admin/preview/blog/[id]` (draft da görünür; public-də yalnız published).

## 6. Lokal test

```bash
npm install
# .env.local doldurun
npm run dev
```

- Public: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

`npm run build` env olmadan da keçməlidir (public fallback).
