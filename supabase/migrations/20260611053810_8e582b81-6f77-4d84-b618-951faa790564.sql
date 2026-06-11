revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.claim_first_admin(uuid) from public, anon, authenticated;
grant execute on function public.has_role(uuid, public.app_role) to service_role;
grant execute on function public.claim_first_admin(uuid) to service_role;