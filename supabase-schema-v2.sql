-- ╔══════════════════════════════════════════════════════════════╗
-- ║  Friends App — Supabase Schema V2 (Clean Rewrite)         ║
-- ║  ALL user references are TEXT (accepts UUIDs and names)    ║
-- ║  RLS is simple and non-recursive                          ║
-- ║  Run this on a CLEAN database (all tables dropped)        ║
-- ╚══════════════════════════════════════════════════════════════╝

create extension if not exists "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  emoji text default '😊',
  status text,
  language text default 'de',
  dark_mode boolean default true,
  share_location boolean default false,
  notifications_enabled boolean default true,
  plan text default 'free',
  plan_expires_at timestamptz,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Anyone can read profiles" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- ─── Groups ───────────────────────────────────────────────────
create table groups (
  id text primary key,
  name text not null,
  emoji text default '👥',
  invite_code text unique,
  settings jsonb default '{}',
  created_by text,
  created_at timestamptz default now()
);

alter table groups enable row level security;
create policy "Members can read groups" on groups for select
  using (id in (select group_id from group_members where user_id = auth.uid()::text) or created_by = auth.uid()::text);
create policy "Auth users can create groups" on groups for insert with check (auth.uid() is not null);
create policy "Creators can update groups" on groups for update
  using (created_by = auth.uid()::text);
create policy "Creators can delete groups" on groups for delete
  using (created_by = auth.uid()::text);

-- ─── Group Members (NO RLS — queried by other policies) ──────
create table group_members (
  id text default uuid_generate_v4()::text primary key,
  group_id text references groups(id) on delete cascade not null,
  user_id text not null,
  role text default 'member',
  fun_role text,
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);
-- NO RLS on group_members to avoid recursion issues

-- ─── Helper: check membership ─────────────────────────────────
create or replace function is_member(gid text) returns boolean as $$
  select exists(select 1 from group_members where group_id = gid and user_id = auth.uid()::text);
$$ language sql security invoker stable;

-- ─── Todos ────────────────────────────────────────────────────
create table todos (
  id text primary key,
  group_id text references groups(id) on delete cascade not null,
  text text not null,
  description text,
  assignee_ids text[] default '{}',
  tags text[] default '{}',
  priority text default 'medium',
  due_date text,
  done boolean default false,
  linked_items jsonb default '[]',
  created_by text,
  created_at timestamptz default now()
);

alter table todos enable row level security;
create policy "Members can read todos" on todos for select using (is_member(group_id));
create policy "Members can insert todos" on todos for insert with check (is_member(group_id));
create policy "Members can update todos" on todos for update using (is_member(group_id));
create policy "Members can delete todos" on todos for delete using (is_member(group_id));

-- ─── Todo Comments ────────────────────────────────────────────
create table todo_comments (
  id text primary key,
  todo_id text references todos(id) on delete cascade not null,
  group_id text not null,
  author_id text not null,
  text text not null,
  created_at timestamptz default now()
);

alter table todo_comments enable row level security;
create policy "Members can read comments" on todo_comments for select using (is_member(group_id));
create policy "Members can insert comments" on todo_comments for insert with check (is_member(group_id));
create policy "Authors can delete comments" on todo_comments for delete using (author_id = auth.uid()::text);

-- ─── Expenses ─────────────────────────────────────────────────
create table expenses (
  id text primary key,
  group_id text references groups(id) on delete cascade not null,
  title text not null,
  amount decimal(10,2) not null,
  paid_by text not null,
  split_between text[] not null,
  custom_amounts jsonb,
  category text default 'other',
  recurring text default 'none',
  linked_items jsonb default '[]',
  date text,
  created_at timestamptz default now()
);

alter table expenses enable row level security;
create policy "Members can read expenses" on expenses for select using (is_member(group_id));
create policy "Members can insert expenses" on expenses for insert with check (is_member(group_id));
create policy "Members can update expenses" on expenses for update using (is_member(group_id));
create policy "Members can delete expenses" on expenses for delete using (is_member(group_id));

-- ─── Payments ─────────────────────────────────────────────────
create table payments (
  id text primary key,
  group_id text references groups(id) on delete cascade not null,
  from_user text not null,
  to_user text not null,
  amount decimal(10,2) not null,
  date text,
  created_at timestamptz default now()
);

alter table payments enable row level security;
create policy "Members can read payments" on payments for select using (is_member(group_id));
create policy "Members can insert payments" on payments for insert with check (is_member(group_id));
create policy "Members can delete payments" on payments for delete using (is_member(group_id));

-- ─── Suggestions ──────────────────────────────────────────────
create table suggestions (
  id text primary key,
  group_id text references groups(id) on delete cascade not null,
  text text not null,
  author_id text not null,
  votes text[] default '{}',
  done boolean default false,
  mode text default 'voting',
  linked_items jsonb default '[]',
  created_at timestamptz default now()
);

alter table suggestions enable row level security;
create policy "Members can read suggestions" on suggestions for select using (is_member(group_id));
create policy "Members can insert suggestions" on suggestions for insert with check (is_member(group_id));
create policy "Members can update suggestions" on suggestions for update using (is_member(group_id));
create policy "Members can delete suggestions" on suggestions for delete using (is_member(group_id));

-- ─── Messages ─────────────────────────────────────────────────
create table messages (
  id text primary key,
  group_id text references groups(id) on delete cascade not null,
  author_id text not null,
  text text not null,
  embed jsonb,
  reactions jsonb default '[]',
  created_at timestamptz default now()
);

alter table messages enable row level security;
create policy "Members can read messages" on messages for select using (is_member(group_id));
create policy "Members can insert messages" on messages for insert with check (is_member(group_id));
create policy "Members can update messages" on messages for update using (is_member(group_id));

-- ─── Events ───────────────────────────────────────────────────
create table events (
  id text primary key,
  group_id text references groups(id) on delete cascade not null,
  title text not null,
  emoji text default '📅',
  date text not null,
  time text not null,
  location text,
  description text,
  attendees text[] default '{}',
  recurrence text default 'none',
  linked_items jsonb default '[]',
  created_by text,
  created_at timestamptz default now()
);

alter table events enable row level security;
create policy "Members can read events" on events for select using (is_member(group_id));
create policy "Members can insert events" on events for insert with check (is_member(group_id));
create policy "Members can update events" on events for update using (is_member(group_id));
create policy "Members can delete events" on events for delete using (is_member(group_id));

-- ─── Places ───────────────────────────────────────────────────
create table places (
  id text primary key,
  group_id text references groups(id) on delete cascade not null,
  name text not null,
  emoji text default '📍',
  category text not null,
  address text,
  added_by text,
  visited_at text,
  created_at timestamptz default now()
);

alter table places enable row level security;
create policy "Members can read places" on places for select using (is_member(group_id));
create policy "Members can insert places" on places for insert with check (is_member(group_id));
create policy "Members can delete places" on places for delete using (is_member(group_id));

-- ─── Place Ratings ────────────────────────────────────────────
create table place_ratings (
  id text primary key,
  place_id text references places(id) on delete cascade not null,
  group_id text not null,
  user_id text not null,
  score decimal(2,1) not null,
  comment text,
  created_at timestamptz default now()
);

alter table place_ratings enable row level security;
create policy "Members can read ratings" on place_ratings for select using (is_member(group_id));
create policy "Members can insert ratings" on place_ratings for insert with check (is_member(group_id));
create policy "Users can update own ratings" on place_ratings for update using (user_id = auth.uid()::text);

-- ─── Map Pins ─────────────────────────────────────────────────
create table map_pins (
  id text primary key,
  group_id text references groups(id) on delete cascade not null,
  lat decimal(10,6) not null,
  lng decimal(10,6) not null,
  label text not null,
  emoji text default '📍',
  type text default 'wishlist',
  added_by text,
  date text,
  created_at timestamptz default now()
);

alter table map_pins enable row level security;
create policy "Members can read pins" on map_pins for select using (is_member(group_id));
create policy "Members can insert pins" on map_pins for insert with check (is_member(group_id));
create policy "Members can delete pins" on map_pins for delete using (is_member(group_id));

-- ─── Live Locations ───────────────────────────────────────────
create table live_locations (
  id text default uuid_generate_v4()::text primary key,
  group_id text references groups(id) on delete cascade not null,
  user_id text not null,
  lat decimal(10,6) not null,
  lng decimal(10,6) not null,
  label text,
  sharing boolean default true,
  updated_at timestamptz default now(),
  unique(group_id, user_id)
);

alter table live_locations enable row level security;
create policy "Members can read locations" on live_locations for select using (is_member(group_id));
create policy "Members can upsert locations" on live_locations for insert with check (is_member(group_id));
create policy "Users can update own location" on live_locations for update using (user_id = auth.uid()::text);

-- ─── Feed Items ───────────────────────────────────────────────
create table feed_items (
  id text primary key,
  group_id text references groups(id) on delete cascade not null,
  type text not null,
  text text not null,
  created_at timestamptz default now()
);

alter table feed_items enable row level security;
create policy "Members can read feed" on feed_items for select using (is_member(group_id));
create policy "Members can insert feed" on feed_items for insert with check (is_member(group_id));

-- ─── Notifications ────────────────────────────────────────────
create table notifications (
  id text primary key,
  user_id text not null,
  type text not null,
  title text not null,
  body text not null,
  group_id text references groups(id) on delete cascade,
  read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;
create policy "Users can read own notifications" on notifications for select using (user_id = auth.uid()::text);
create policy "Anyone can insert notifications" on notifications for insert with check (true);
create policy "Users can update own notifications" on notifications for update using (user_id = auth.uid()::text);

-- ─── Feedback ─────────────────────────────────────────────────
create table feedback (
  id text default uuid_generate_v4()::text primary key,
  user_id text,
  title text not null,
  body text not null,
  created_at timestamptz default now()
);

alter table feedback enable row level security;
create policy "Anyone can insert feedback" on feedback for insert with check (auth.uid() is not null);

-- ─── User Group Preferences ──────────────────────────────────
create table user_group_prefs (
  id text default uuid_generate_v4()::text primary key,
  user_id text not null,
  group_id text references groups(id) on delete cascade not null,
  nav_tabs text[] default '{feed,todos,expenses,chat}',
  start_tab text default '',
  hidden boolean default false,
  unique(user_id, group_id)
);

alter table user_group_prefs enable row level security;
create policy "Users can read own prefs" on user_group_prefs for select using (user_id = auth.uid()::text);
create policy "Users can insert own prefs" on user_group_prefs for insert with check (user_id = auth.uid()::text);
create policy "Users can update own prefs" on user_group_prefs for update using (user_id = auth.uid()::text);

-- ─── Realtime ─────────────────────────────────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table todos;
alter publication supabase_realtime add table todo_comments;
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table payments;
alter publication supabase_realtime add table suggestions;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table places;
alter publication supabase_realtime add table place_ratings;
alter publication supabase_realtime add table map_pins;
alter publication supabase_realtime add table live_locations;
alter publication supabase_realtime add table feed_items;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table group_members;

-- ─── Auto-create profile on signup ────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'User')
  );
  return new;
exception when others then
  raise warning 'Could not create profile: %', sqlerrm;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
