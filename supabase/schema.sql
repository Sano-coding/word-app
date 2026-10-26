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

-- 2026-10-11: ダッシュボードの「単語帳の傾向」機能用。単語帳ごとの最終学習日時を記録し、
-- フラッシュカード/4択クイズで出題（flashcard_status・quiz_statusの変更）があるたびに
-- DBトリガーで自動更新する。過去の出題実績に対する正確な日時は無いため、バックフィルはせず
-- NULL（未学習扱い）のままにし、次回の出題から記録を開始する。

alter table public.tanchous add column if not exists last_studied_at timestamptz;

create or replace function public.record_last_studied_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tanchous
  set last_studied_at = now()
  where id = new.tanchou_id;
  return new;
end;
$$;

drop trigger if exists words_last_studied_at_trigger on public.words;
create trigger words_last_studied_at_trigger
after update on public.words
for each row
when (
  new.flashcard_status is distinct from old.flashcard_status
  or new.quiz_status is distinct from old.quiz_status
)
execute function public.record_last_studied_at();

-- 2026-10-11: フレンド機能。申請中(pending)とフレンド(accepted)を1テーブルで管理する
-- （承認時にstatusが変わるだけで、別テーブルへの移動が不要なため）。

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friendships_no_self check (requester_id <> recipient_id),
  constraint friendships_unique_pair unique (requester_id, recipient_id)
);

create index friendships_recipient_id_idx on public.friendships (recipient_id);

alter table public.friendships enable row level security;

-- 自分が関係者（申請した/された）の行だけ見える
create policy "friendships_select_related" on public.friendships
  for select using (auth.uid() = requester_id or auth.uid() = recipient_id);

-- 申請は本人が requester として送るのみ
create policy "friendships_insert_own" on public.friendships
  for insert with check (auth.uid() = requester_id);

-- 承認（status更新）は recipient のみ可能
create policy "friendships_update_recipient" on public.friendships
  for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- 削除（キャンセル/拒否/フレンド解除）は関係者どちらからも可能
create policy "friendships_delete_related" on public.friendships
  for delete using (auth.uid() = requester_id or auth.uid() = recipient_id);

grant select, insert, update, delete on public.friendships to authenticated;

-- フレンド検索用。profilesテーブル自体のSELECTポリシー（本人のみ）は変更せず、
-- 検索に必要な最小限の列（ニックネーム・アイコン）だけをRPC経由で返す。
create or replace function public.search_profiles(query text)
returns table (id uuid, nickname text, icon_type text, icon_value text)
language sql
security definer
set search_path = public
as $$
  select id, nickname, icon_type, icon_value
  from public.profiles
  where nickname ilike '%' || query || '%'
    and id <> auth.uid()
  order by nickname
  limit 20
$$;

grant execute on function public.search_profiles(text) to authenticated;

-- 自分が関係者となっている friendships 一覧を、相手のプロフィール情報付きで返す。
-- 相手のprofilesはRLS上読めないため、security definerのRPCで解決する。
-- （フレンド一覧／受信した申請／送信した申請は、このRPCの結果をstatus・directionで
-- 振り分けて表示する。検索結果が既に申請済み/フレンドかどうかの判定にも使う）
create or replace function public.list_my_friendships()
returns table (
  friendship_id uuid,
  status text,
  direction text,
  created_at timestamptz,
  responded_at timestamptz,
  other_id uuid,
  other_nickname text,
  other_icon_type text,
  other_icon_value text
)
language sql
security definer
set search_path = public
as $$
  select
    f.id,
    f.status,
    case when f.requester_id = auth.uid() then 'outgoing' else 'incoming' end,
    f.created_at,
    f.responded_at,
    case when f.requester_id = auth.uid() then f.recipient_id else f.requester_id end,
    p.nickname,
    p.icon_type,
    p.icon_value
  from public.friendships f
  join public.profiles p
    on p.id = case when f.requester_id = auth.uid() then f.recipient_id else f.requester_id end
  where f.requester_id = auth.uid() or f.recipient_id = auth.uid()
  order by f.created_at desc
$$;

grant execute on function public.list_my_friendships() to authenticated;

-- 2026-10-11: プロフィールの「ひとこと」ステータスメッセージ。任意項目。
-- フレンド一覧にのみ表示する（検索結果・申請一覧には表示しない）。
alter table public.profiles add column if not exists status_message text;

-- list_my_friendships の戻り値に other_status_message を追加。
-- RETURNS TABLE の列構成はCREATE OR REPLACEでは変更できないため、drop してから再作成する。
drop function if exists public.list_my_friendships();

create function public.list_my_friendships()
returns table (
  friendship_id uuid,
  status text,
  direction text,
  created_at timestamptz,
  responded_at timestamptz,
  other_id uuid,
  other_nickname text,
  other_icon_type text,
  other_icon_value text,
  other_status_message text
)
language sql
security definer
set search_path = public
as $$
  select
    f.id,
    f.status,
    case when f.requester_id = auth.uid() then 'outgoing' else 'incoming' end,
    f.created_at,
    f.responded_at,
    case when f.requester_id = auth.uid() then f.recipient_id else f.requester_id end,
    p.nickname,
    p.icon_type,
    p.icon_value,
    p.status_message
  from public.friendships f
  join public.profiles p
    on p.id = case when f.requester_id = auth.uid() then f.recipient_id else f.requester_id end
  where f.requester_id = auth.uid() or f.recipient_id = auth.uid()
  order by f.created_at desc
$$;

grant execute on function public.list_my_friendships() to authenticated;

-- 2026-10-12: プロフィール設定で選べるテーマカラー（プリセット6色）。
-- 配色の実体（CSS変数）はフロント側のtokens.cssで管理し、ここでは選択値だけ保持する。
alter table public.profiles add column if not exists theme_color text not null default 'default';

alter table public.profiles drop constraint if exists profiles_theme_color_check;
alter table public.profiles add constraint profiles_theme_color_check
  check (theme_color in ('default', 'blue', 'green', 'warm', 'pink', 'plain'));

-- 2026-10-26: フレンドのダッシュボード閲覧機能。
-- 本人がアカウント設定でON/OFFでき、初期値はON（フレンドに公開）。
alter table public.profiles add column if not exists dashboard_public boolean not null default true;

-- フレンド（accepted）のダッシュボード表示に必要なデータを返す。
-- tanchous/words/mastery_snapshots のRLS（本人のみ）は変更せず、security definerで
-- フレンド関係と公開設定を確認したうえで、集計に必要な最小限の列だけを返す
-- （単語の本文・意味・補足は返さない）。相手が非公開なら is_public=false のみ返す。
create or replace function public.get_friend_dashboard(friend_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  friend_is_public boolean;
begin
  if not exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = auth.uid() and f.recipient_id = friend_id)
        or (f.recipient_id = auth.uid() and f.requester_id = friend_id)
      )
  ) then
    raise exception 'not friends' using errcode = '42501';
  end if;

  select p.dashboard_public into friend_is_public from public.profiles p where p.id = friend_id;
  if not coalesce(friend_is_public, false) then
    return jsonb_build_object('is_public', false);
  end if;

  return jsonb_build_object(
    'is_public', true,
    'tanchous', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'name', t.name,
          'last_studied_at', t.last_studied_at,
          'words', coalesce((
            select jsonb_agg(jsonb_build_object(
              'mastery_level', w.mastery_level,
              'flashcard_status', w.flashcard_status,
              'quiz_status', w.quiz_status
            ))
            from public.words w
            where w.tanchou_id = t.id
          ), '[]'::jsonb)
        )
        order by t.sort_order
      )
      from public.tanchous t
      where t.account_id = friend_id
    ), '[]'::jsonb),
    'snapshots', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'snapshot_date', s.snapshot_date,
          'not_memorized_count', s.not_memorized_count,
          'partially_memorized_count', s.partially_memorized_count,
          'memorized_count', s.memorized_count
        )
        order by s.snapshot_date
      )
      from public.mastery_snapshots s
      where s.account_id = friend_id
    ), '[]'::jsonb)
  );
end;
$$;

revoke execute on function public.get_friend_dashboard(uuid) from public, anon;
grant execute on function public.get_friend_dashboard(uuid) to authenticated;
