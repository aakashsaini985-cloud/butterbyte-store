
-- 1) Coupons: remove public read; add SECURITY DEFINER lookup
DROP POLICY IF EXISTS "active coupons public read" ON public.coupons;

CREATE OR REPLACE FUNCTION public.validate_coupon(_code text)
RETURNS TABLE (id uuid, code text, type text, value numeric, min_order numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.code, c.type, c.value, c.min_order
  FROM public.coupons c
  WHERE c.active = true
    AND upper(c.code) = upper(_code)
    AND (c.expires_at IS NULL OR c.expires_at > now())
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.validate_coupon(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text) TO anon, authenticated;

-- 2) Orders: enforce non-null user_id
ALTER TABLE public.orders ALTER COLUMN user_id SET NOT NULL;

-- 3) user_roles: explicit per-command admin-only mutation policies, prevent self-escalation
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;

CREATE POLICY "admins insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
