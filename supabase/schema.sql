-- ============================================================
-- Agence de l'Ombre — Schéma Supabase
-- Coller ce script dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- PROFILES (extension de auth.users)
-- ────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  role        text not null default 'client' check (role in ('admin', 'client')),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Créer un profil automatiquement à chaque inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- CLIENTS
-- ────────────────────────────────────────────────────────────
create table public.clients (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid references auth.users(id) on delete set null,  -- compte portail client
  company_name         text not null,
  contact_name         text not null,
  email                text not null,
  phone                text,
  website              text,
  notes                text,
  ga4_property_id      text,
  search_console_url   text,
  created_at           timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- PROJECTS
-- ────────────────────────────────────────────────────────────
create table public.projects (
  id          uuid primary key default uuid_generate_v4(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  name        text not null,
  description text,
  status      text not null default 'active'
              check (status in ('lead', 'active', 'paused', 'completed', 'cancelled')),
  progress    integer not null default 0 check (progress between 0 and 100),
  start_date  date,
  end_date    date,
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- MILESTONES
-- ────────────────────────────────────────────────────────────
create table public.milestones (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  title        text not null,
  description  text,
  status       text not null default 'pending'
               check (status in ('pending', 'in_progress', 'completed')),
  due_date     date,
  completed_at timestamptz,
  "order"      integer not null default 1,
  created_at   timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- TASKS
-- ────────────────────────────────────────────────────────────
create table public.tasks (
  id           uuid primary key default uuid_generate_v4(),
  client_id    uuid references public.clients(id) on delete set null,
  project_id   uuid references public.projects(id) on delete set null,
  assignee_id  uuid references auth.users(id) on delete set null,
  title        text not null,
  description  text,
  status       text not null default 'todo'
               check (status in ('todo', 'in_progress', 'done')),
  priority     text not null default 'medium'
               check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date     date,
  created_at   timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- DELIVERABLES
-- ────────────────────────────────────────────────────────────
create table public.deliverables (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  name        text not null,
  description text,
  file_url    text,
  file_size   bigint,
  file_type   text,
  uploaded_by uuid not null references auth.users(id),
  uploaded_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- MESSAGES
-- ────────────────────────────────────────────────────────────
create table public.messages (
  id          uuid primary key default uuid_generate_v4(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  project_id  uuid references public.projects(id) on delete set null,
  sender_id   uuid not null references auth.users(id),
  content     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- STORAGE
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('deliverables', 'deliverables', true)
  on conflict do nothing;

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

-- Helper : vrai si l'utilisateur est admin
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper : client_id lié à l'utilisateur courant
create or replace function public.my_client_id()
returns uuid language sql security definer stable as $$
  select id from public.clients where user_id = auth.uid() limit 1;
$$;

-- PROFILES
alter table public.profiles enable row level security;
create policy "Admins see all profiles" on public.profiles for select using (is_admin());
create policy "Users see own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- CLIENTS
alter table public.clients enable row level security;
create policy "Admins manage clients" on public.clients for all using (is_admin());
create policy "Client sees own record" on public.clients for select using (user_id = auth.uid());

-- PROJECTS
alter table public.projects enable row level security;
create policy "Admins manage projects" on public.projects for all using (is_admin());
create policy "Client sees own projects" on public.projects for select using (client_id = my_client_id());

-- MILESTONES
alter table public.milestones enable row level security;
create policy "Admins manage milestones" on public.milestones for all using (is_admin());
create policy "Client sees own milestones" on public.milestones for select
  using (project_id in (select id from public.projects where client_id = my_client_id()));

-- TASKS
alter table public.tasks enable row level security;
create policy "Admins manage tasks" on public.tasks for all using (is_admin());
create policy "Client sees own tasks" on public.tasks for select using (client_id = my_client_id());

-- DELIVERABLES
alter table public.deliverables enable row level security;
create policy "Admins manage deliverables" on public.deliverables for all using (is_admin());
create policy "Client sees own deliverables" on public.deliverables for select
  using (project_id in (select id from public.projects where client_id = my_client_id()));

-- MESSAGES
alter table public.messages enable row level security;
create policy "Admins manage messages" on public.messages for all using (is_admin());
create policy "Client sees own messages" on public.messages for select using (client_id = my_client_id());
create policy "Client inserts own messages" on public.messages for insert with check (
  client_id = my_client_id() and sender_id = auth.uid()
);
create policy "Client updates own messages" on public.messages for update using (client_id = my_client_id());

-- Storage policies
create policy "Admins upload deliverables" on storage.objects for insert
  with check (bucket_id = 'deliverables' and is_admin());
create policy "Authenticated read deliverables" on storage.objects for select
  using (bucket_id = 'deliverables' and auth.role() = 'authenticated');

-- ────────────────────────────────────────────────────────────
-- REALTIME (pour la messagerie)
-- ────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.messages;

-- ────────────────────────────────────────────────────────────
-- PREMIER COMPTE ADMIN
-- Après avoir créé votre compte sur Supabase Auth, mettre à jour le rôle :
-- update public.profiles set role = 'admin', full_name = 'Johanna Goncalves' where email = 'hello@agencedelombre.fr';
-- ────────────────────────────────────────────────────────────
