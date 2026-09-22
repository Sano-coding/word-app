-- word-app: Supabase schema + RLS
-- Supabase管理画面の SQL Editor に貼り付けて実行してください。

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  icon_type text not null,
  icon_value text,
  created_at timestamptz not null default now()
);

create table if not exists public.tanchous (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  is_starred boolean not null default false,
  visibility text not null default 'private',
  created_at timestamptz not null default now()
);

create table if not exists public.words (
  id uuid primary key default gen_random_uuid(),
  tanchou_id uuid not null references public.tanchous (id) on delete cascade,
  word text not null,
  meaning text not null,
  note text not null default '',
  mastery_level text not null default 'not_memorized',
  flashcard_status text not null default 'not_shown',
  quiz_status text not null default 'not_shown',
  is_starred boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists tanchous_account_id_idx on public.tanchous (account_id);
create index if not exists words_tanchou_id_idx on public.words (tanchou_id);

alter table public.profiles enable row level security;
alter table public.tanchous enable row level security;
alter table public.words enable row level security;

-- profiles: 本人のみ read/write
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- tanchous: account_id が本人のもののみ read/write
create policy "tanchous_select_own" on public.tanchous
  for select using (auth.uid() = account_id);
create policy "tanchous_insert_own" on public.tanchous
  for insert with check (auth.uid() = account_id);
create policy "tanchous_update_own" on public.tanchous
  for update using (auth.uid() = account_id);
create policy "tanchous_delete_own" on public.tanchous
  for delete using (auth.uid() = account_id);

-- words: 親tanchouのaccount_idが本人のもののみ read/write
create policy "words_select_own" on public.words
  for select using (
    exists (
      select 1 from public.tanchous t
      where t.id = tanchou_id and t.account_id = auth.uid()
    )
  );
create policy "words_insert_own" on public.words
  for insert with check (
    exists (
      select 1 from public.tanchous t
      where t.id = tanchou_id and t.account_id = auth.uid()
    )
  );
create policy "words_update_own" on public.words
  for update using (
    exists (
      select 1 from public.tanchous t
      where t.id = tanchou_id and t.account_id = auth.uid()
    )
  );
create policy "words_delete_own" on public.words
  for delete using (
    exists (
      select 1 from public.tanchous t
      where t.id = tanchou_id and t.account_id = auth.uid()
    )
  );

-- ログイン後（authenticated ロール）にテーブル自体へのアクセス権を付与する
-- （RLSポリシーだけでは不十分で、テーブルレベルのGRANTも別途必要）
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.tanchous to authenticated;
grant select, insert, update, delete on public.words to authenticated;
