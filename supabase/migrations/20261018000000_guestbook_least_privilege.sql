-- Defense in depth for the public guestbook.
-- RLS decides which rows can be accessed; these grants limit which columns and
-- operations reach RLS through the Data API in the first place.

revoke all on table public.guestbook_entries from anon, authenticated;

-- A guestbook is intentionally public, but an auth user ID is not needed by visitors.
grant select (id, name, username, avatar_url, provider, role, message, created_at)
on table public.guestbook_entries
to anon, authenticated;

-- Anonymous visitors can only submit the fields accepted by the anonymous RLS policy.
grant insert (name, provider, role, message)
on table public.guestbook_entries
to anon;

-- GitHub-authenticated visitors may include their verified profile fields.
grant insert (user_id, name, username, avatar_url, provider, role, message)
on table public.guestbook_entries
to authenticated;
