CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));

  -- All new signups receive the 'customer' role. Admins must be promoted
  -- explicitly via a trusted server path (migration / admin UI). The previous
  -- "first user becomes admin" bootstrap was removed to prevent privilege
  -- escalation if user_roles is ever empty at signup time.
  insert into public.user_roles (user_id, role) values (new.id, 'customer');

  return new;
end;
$function$;