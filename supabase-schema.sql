-- ╔══════════════════════════════════════════════════════╗
-- ║  Friends App — Supabase Database Schema             ║
-- ║  Run this in the Supabase SQL Editor                ║
-- ╚══════════════════════════════════════════════════════╝

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── Users / Profiles ─────────────────────────────────
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  emoji text default '😊',
  status text,
  language text default 'de' check (language in ('de', 'en')),
  dark_mode boolean default true,
  notifications_enabled boolean default true,
  created_at timestamptz default now()
);

-- ─── Groups ───────────────────────────────────────────
create table groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  emoji text default '👥',
  invite_code text unique,
  settings jsonb default '{}',
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ─── Group Members ────────────────────────────────────
create table group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('admin', 'member', 'viewer')),
  fun_role text,
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- ─── Todos ────────────────────────────────────────────
create table todos (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  text text not null,
  description text,
  assignee_ids uuid[] default '{}',
  tags text[] default '{}',
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  done boolean default false,
  linked_items jsonb default '[]',
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ─── Todo Comments ────────────────────────────────────
create table todo_comments (
  id uuid default uuid_generate_v4() primary key,
  todo_id uuid references todos(id) on delete cascade not null,
  author_id uuid references profiles(id) not null,
  text text not null,
  created_at timestamptz default now()
);

-- ─── Expenses ─────────────────────────────────────────
create table expenses (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  title text not null,
  amount decimal(10,2) not null,
  paid_by uuid references profiles(id) not null,
  split_between uuid[] not null,
  custom_amounts jsonb,
  category text default 'other',
  recurring text default 'none' check (recurring in ('none', 'weekly', 'monthly')),
  linked_items jsonb default '[]',
  date date default current_date,
  created_at timestamptz default now()
);

-- ─── Payments (settlements) ───────────────────────────
create table payments (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  from_user uuid references profiles(id) not null,
  to_user uuid references profiles(id) not null,
  amount decimal(10,2) not null,
  date date default current_date,
  created_at timestamptz default now()
);

-- ─── Suggestions (voting + bucket list) ───────────────
create table suggestions (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  text text not null,
  author_id uuid references profiles(id) not null,
  votes uuid[] default '{}',
  done boolean default false,
  mode text default 'voting' check (mode in ('voting', 'bucket')),
  linked_items jsonb default '[]',
  created_at timestamptz default now()
);

-- ─── Chat Messages ────────────────────────────────────
create table messages (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  author_id uuid references profiles(id) not null,
  text text not null,
  embed jsonb,
  reactions jsonb default '[]',
  created_at timestamptz default now()
);

-- ─── Events ───────────────────────────────────────────
create table events (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  title text not null,
  emoji text default '📅',
  date date not null,
  time time not null,
  location text,
  description text,
  attendees uuid[] default '{}',
  recurrence text default 'none',
  linked_items jsonb default '[]',
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ─── Places ───────────────────────────────────────────
create table places (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  name text not null,
  emoji text default '📍',
  category text not null,
  address text,
  added_by uuid references profiles(id),
  visited_at date,
  created_at timestamptz default now()
);

-- ─── Place Ratings ────────────────────────────────────
create table place_ratings (
  id uuid default uuid_generate_v4() primary key,
  place_id uuid references places(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  score decimal(2,1) not null check (score >= 0 and score <= 5),
  comment text,
  created_at timestamptz default now()
);

-- ─── Map Pins ─────────────────────────────────────────
create table map_pins (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  lat decimal(10,6) not null,
  lng decimal(10,6) not null,
  label text not null,
  emoji text default '📍',
  type text default 'wishlist' check (type in ('visited', 'wishlist')),
  added_by uuid references profiles(id),
  date text,
  created_at timestamptz default now()
);

-- ─── Live Locations ───────────────────────────────────
create table live_locations (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  lat decimal(10,6) not null,
  lng decimal(10,6) not null,
  label text,
  sharing boolean default true,
  updated_at timestamptz default now(),
  unique(group_id, user_id)
);

-- ─── Feed Items ───────────────────────────────────────
create table feed_items (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  type text not null,
  text text not null,
  created_at timestamptz default now()
);

-- ─── Notifications ────────────────────────────────────
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  body text not null,
  group_id uuid references groups(id) on delete cascade,
  read boolean default false,
  created_at timestamptz default now()
);

-- ─── Feedback ─────────────────────────────────────────
create table feedback (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  title text not null,
  body text not null,
  created_at timestamptz default now()
);

-- ─── User Group Preferences ──────────────────────────
create table user_group_prefs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  group_id uuid references groups(id) on delete cascade not null,
  nav_tabs text[] default '{feed,todos,expenses,chat}',
  start_tab text default '',
  hidden boolean default false,
  unique(user_id, group_id)
);

-- ══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════

alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table todos enable row level security;
alter table todo_comments enable row level security;
alter table expenses enable row level security;
alter table payments enable row level security;
alter table suggestions enable row level security;
alter table messages enable row level security;
alter table events enable row level security;
alter table places enable row level security;
alter table place_ratings enable row level security;
alter table map_pins enable row level security;
alter table live_locations enable row level security;
alter table feed_items enable row level security;
alter table notifications enable row level security;
alter table feedback enable row level security;
alter table user_group_prefs enable row level security;

-- Profiles: users can read all, update own
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Groups: members can read their groups
create policy "Members can view their groups" on groups for select
  using (id in (select group_id from group_members where user_id = auth.uid()));
create policy "Authenticated users can create groups" on groups for insert
  with check (auth.uid() is not null);
create policy "Admins can update groups" on groups for update
  using (id in (select group_id from group_members where user_id = auth.uid() and role = 'admin'));
create policy "Admins can delete groups" on groups for delete
  using (id in (select group_id from group_members where user_id = auth.uid() and role = 'admin'));

-- Group members: members can see co-members
create policy "Members can view group members" on group_members for select
  using (group_id in (select group_id from group_members gm where gm.user_id = auth.uid()));
create policy "Admins can manage members" on group_members for insert
  with check (auth.uid() is not null);
create policy "Admins can update members" on group_members for update
  using (group_id in (select group_id from group_members where user_id = auth.uid() and role = 'admin'));
create policy "Members can leave" on group_members for delete
  using (user_id = auth.uid() or group_id in (select group_id from group_members where user_id = auth.uid() and role = 'admin'));

-- Helper function: check if user is member of a group
create or replace function is_group_member(gid uuid) returns boolean as $$
  select exists(select 1 from group_members where group_id = gid and user_id = auth.uid());
$$ language sql security definer;

-- All group data: only members can read/write
-- Macro for group-scoped tables
do $$
declare
  tbl text;
begin
  for tbl in select unnest(array[
    'todos', 'todo_comments', 'expenses', 'payments', 'suggestions',
    'messages', 'events', 'places', 'place_ratings', 'map_pins',
    'live_locations', 'feed_items'
  ]) loop
    -- For tables with group_id directly
    if tbl not in ('todo_comments', 'place_ratings') then
      execute format('create policy "Members can view %1$s" on %1$s for select using (is_group_member(group_id))', tbl);
      execute format('create policy "Members can insert %1$s" on %1$s for insert with check (is_group_member(group_id))', tbl);
      execute format('create policy "Members can update %1$s" on %1$s for update using (is_group_member(group_id))', tbl);
      execute format('create policy "Members can delete %1$s" on %1$s for delete using (is_group_member(group_id))', tbl);
    end if;
  end loop;
end $$;

-- Todo comments: through todo's group
create policy "Members can view todo comments" on todo_comments for select
  using (todo_id in (select id from todos where is_group_member(group_id)));
create policy "Members can insert todo comments" on todo_comments for insert
  with check (todo_id in (select id from todos where is_group_member(group_id)));
create policy "Members can delete todo comments" on todo_comments for delete
  using (author_id = auth.uid());

-- Place ratings: through place's group
create policy "Members can view place ratings" on place_ratings for select
  using (place_id in (select id from places where is_group_member(group_id)));
create policy "Members can insert place ratings" on place_ratings for insert
  with check (place_id in (select id from places where is_group_member(group_id)));
create policy "Users can update own ratings" on place_ratings for update
  using (user_id = auth.uid());

-- Notifications: users see own
create policy "Users can view own notifications" on notifications for select using (user_id = auth.uid());
create policy "System can insert notifications" on notifications for insert with check (true);
create policy "Users can update own notifications" on notifications for update using (user_id = auth.uid());

-- Feedback: anyone can insert, only admin reads
create policy "Anyone can submit feedback" on feedback for insert with check (auth.uid() is not null);

-- User group prefs: users manage own
create policy "Users can view own prefs" on user_group_prefs for select using (user_id = auth.uid());
create policy "Users can insert own prefs" on user_group_prefs for insert with check (user_id = auth.uid());
create policy "Users can update own prefs" on user_group_prefs for update using (user_id = auth.uid());

-- ══════════════════════════════════════════════════════
-- REALTIME: enable for tables that need live updates
-- ══════════════════════════════════════════════════════

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table todos;
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table suggestions;
alter publication supabase_realtime add table live_locations;
alter publication supabase_realtime add table feed_items;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table group_members;

-- ══════════════════════════════════════════════════════
-- FUNCTION: Auto-create profile on signup
-- ══════════════════════════════════════════════════════

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'User'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ══════════════════════════════════════════════════════
-- FUNCTION: Join group by invite code
-- ══════════════════════════════════════════════════════

create or replace function join_group_by_code(code text)
returns uuid as $$
declare
  gid uuid;
begin
  select id into gid from groups where invite_code = upper(code);
  if gid is null then
    raise exception 'Invalid invite code';
  end if;

  -- Check if already a member
  if exists(select 1 from group_members where group_id = gid and user_id = auth.uid()) then
    return gid;
  end if;

  insert into group_members (group_id, user_id, role) values (gid, auth.uid(), 'member');

  -- Add feed item
  insert into feed_items (group_id, type, text)
  values (gid, 'system', (select name from profiles where id = auth.uid()) || ' ist der Gruppe beigetreten');

  return gid;
end;
$$ language plpgsql security definer;
