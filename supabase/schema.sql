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
  sort_order integer not null default 0,
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
  sort_order integer not null default 0,
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

-- 2026-09-22: 単語帳のドラッグ並び替え用に sort_order を追加
-- （既存プロジェクトに対する追加マイグレーション。上のcreate table実行時に
-- 　sort_orderが既に含まれている場合、このブロックは実質何もしない）
alter table public.tanchous add column if not exists sort_order integer;

update public.tanchous t
set sort_order = sub.rn
from (
  select id, row_number() over (partition by account_id order by created_at) - 1 as rn
  from public.tanchous
) sub
where t.id = sub.id and t.sort_order is null;

alter table public.tanchous alter column sort_order set not null;
alter table public.tanchous alter column sort_order set default 0;

-- 2026-10-03: 単語の「登録順」が、一括登録（CSVインポート/初期シード）時に
-- created_atが全行同一になり不安定だったため、専用のsort_orderで管理する
alter table public.words add column if not exists sort_order integer;

update public.words w
set sort_order = sub.rn
from (
  select id, row_number() over (partition by tanchou_id order by created_at, id) - 1 as rn
  from public.words
) sub
where w.id = sub.id and w.sort_order is null;

alter table public.words alter column sort_order set not null;
alter table public.words alter column sort_order set default 0;

-- 2026-10-08: ダッシュボード機能用。定着度ごとの単語数を日次でスナップショットし、
-- 推移の折れ線グラフに使う。words の insert/update/delete 時にトリガーで自動記録する
-- （flashcard/quiz でのmastery_level変更、単語の追加・削除・CSVインポート等すべてを網羅）。

create table if not exists public.mastery_snapshots (
  account_id uuid not null references public.profiles (id) on delete cascade,
  snapshot_date date not null,
  not_memorized_count integer not null default 0,
  partially_memorized_count integer not null default 0,
  memorized_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (account_id, snapshot_date)
);

alter table public.mastery_snapshots enable row level security;

create policy "mastery_snapshots_select_own" on public.mastery_snapshots
  for select using (auth.uid() = account_id);

grant usage on schema public to authenticated;
grant select on public.mastery_snapshots to authenticated;

-- security definer: words/tanchousのRLSに関係なく、トリガーから常にスナップショットを書けるようにする
create or replace function public.record_mastery_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tanchou_id uuid;
  v_account_id uuid;
  v_not_memorized integer;
  v_partially_memorized integer;
  v_memorized integer;
begin
  v_tanchou_id := coalesce(new.tanchou_id, old.tanchou_id);

  select account_id into v_account_id from public.tanchous where id = v_tanchou_id;
  if v_account_id is null then
    -- 単語帳ごと削除（cascade）された場合など、親行が既に無い場合はスキップ
    return coalesce(new, old);
  end if;

  select
    count(*) filter (where w.mastery_level = 'not_memorized'),
    count(*) filter (where w.mastery_level = 'partially_memorized'),
    count(*) filter (where w.mastery_level = 'memorized')
  into v_not_memorized, v_partially_memorized, v_memorized
  from public.words w
  join public.tanchous t on t.id = w.tanchou_id
  where t.account_id = v_account_id;

  insert into public.mastery_snapshots (
    account_id, snapshot_date, not_memorized_count, partially_memorized_count, memorized_count, updated_at
  )
  values (
    v_account_id,
    (now() at time zone 'Asia/Tokyo')::date,
    v_not_memorized,
    v_partially_memorized,
    v_memorized,
    now()
  )
  on conflict (account_id, snapshot_date)
  do update set
    not_memorized_count = excluded.not_memorized_count,
    partially_memorized_count = excluded.partially_memorized_count,
    memorized_count = excluded.memorized_count,
    updated_at = now();

  return coalesce(new, old);
end;
$$;

drop trigger if exists words_mastery_snapshot_trigger on public.words;
create trigger words_mastery_snapshot_trigger
after insert or update or delete on public.words
for each row execute function public.record_mastery_snapshot();

-- 既存データ向けバックフィル: 今日時点のスナップショットを1件作成しておく
-- （これが無いと、新規トリガー発火まで折れ線グラフに点が1つも無い状態になる）
insert into public.mastery_snapshots (
  account_id, snapshot_date, not_memorized_count, partially_memorized_count, memorized_count, updated_at
)
select
  t.account_id,
  (now() at time zone 'Asia/Tokyo')::date,
  count(*) filter (where w.mastery_level = 'not_memorized'),
  count(*) filter (where w.mastery_level = 'partially_memorized'),
  count(*) filter (where w.mastery_level = 'memorized'),
  now()
from public.tanchous t
join public.words w on w.tanchou_id = t.id
group by t.account_id
on conflict (account_id, snapshot_date)
do update set
  not_memorized_count = excluded.not_memorized_count,
  partially_memorized_count = excluded.partially_memorized_count,
  memorized_count = excluded.memorized_count,
  updated_at = now();
