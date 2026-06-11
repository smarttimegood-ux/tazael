create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can view their own roles"
on public.user_roles for select to authenticated
using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.claim_first_admin(_user_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare has_any boolean;
begin
  select exists(select 1 from public.user_roles where role = 'admin') into has_any;
  if has_any then return false; end if;
  insert into public.user_roles (user_id, role) values (_user_id, 'admin') on conflict do nothing;
  return true;
end;
$$;
