-- Coupons: allow authenticated users to read only active, non-expired coupons
CREATE POLICY "active coupons readable by authenticated"
ON public.coupons
FOR SELECT
TO authenticated
USING (active = true AND (expires_at IS NULL OR expires_at > now()));

-- Reviews: admin moderation + user self-management
CREATE POLICY "admins manage reviews"
ON public.reviews
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "users update own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users delete own reviews"
ON public.reviews
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);