-- Cover foreign keys used for account cleanup, audit filtering, and listing
-- notification cleanup so delete/update operations do not require table scans.
create index if not exists moderation_events_actor_id_idx
  on public.moderation_events (actor_id);
create index if not exists moderation_events_owner_id_idx
  on public.moderation_events (owner_id);
create index if not exists notifications_listing_id_idx
  on public.notifications (listing_id);
