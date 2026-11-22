-- ============================================================
-- 採用管理システム スキーマ（全フロー対応版）
-- 既存テーブルを作り直す場合は下2行を有効化（データ消えます）
-- drop table if exists status_history;
-- drop table if exists applicants;
-- ============================================================

create table if not exists applicants (
  id uuid primary key default gen_random_uuid(),
  -- 基本
  name_kanji text not null,
  name_kana text,
  gender text,
  age text,
  phone text,
  source text,              -- 媒体
  job text,                 -- 業種/職
  location text,            -- 面接場所/エリア
  staff text,               -- 対応者/最終担当
  -- 応募・架電
  st_raw text,              -- 架電ステータス(留守/落ち/確定 等)
  phone_date text,          -- 電話日
  setup_date text,          -- 設置日
  -- 面接
  interview_done text,      -- 実施/未実施
  meet_type text,           -- 対面/zoom
  ob_person text,
  ob_result text,
  close_person text,        -- クロ面者
  close_result text,        -- クロ面結果
  pass_contact text,        -- 合格連絡
  -- 合格後
  orientation text,         -- オリテ
  pretraining text,         -- 入社前研修
  leader_intro text,        -- リーダー紹介
  ceo_meeting text,         -- 社長面談
  start_available text,     -- 開始可能日
  start text,               -- スタート
  residence text,           -- 住まい
  days_per_week text,       -- 週〇
  assignment text,          -- 配属先
  location_pref text,       -- 勤務地希望
  resign text,              -- 退社
  memo text,                -- 内容/メモ
  -- メタ
  apply_month text,
  apply_id text,
  stage text not null default '応募',   -- 現在の段階
  active boolean not null default true, -- 進行中=true / 脱落=false
  dropout_reason text,
  sources text,             -- 取込元
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_applicants_stage on applicants(stage);
create index if not exists idx_applicants_name on applicants(name_kanji);

create table if not exists status_history (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references applicants(id) on delete cascade,
  stage text not null,
  changed_at timestamptz not null default now()
);

-- updated_at を更新（BEFORE）
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_updated on applicants;
create trigger trg_touch_updated
  before update on applicants
  for each row execute function touch_updated_at();

-- stage 変更履歴を記録（AFTER: applicants 挿入後に実行しFK違反を回避）
create or replace function log_stage_change() returns trigger as $$
begin
  if (tg_op = 'INSERT') or (new.stage is distinct from old.stage) then
    insert into status_history (applicant_id, stage) values (new.id, new.stage);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_stage_change on applicants;
create trigger trg_stage_change
  after insert or update on applicants
  for each row execute function log_stage_change();

alter table applicants enable row level security;
alter table status_history enable row level security;

drop policy if exists "allow all applicants" on applicants;
create policy "allow all applicants" on applicants for all using (true) with check (true);
drop policy if exists "allow all status_history" on status_history;
create policy "allow all status_history" on status_history for all using (true) with check (true);
