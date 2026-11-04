-- 応募者テーブル
create table if not exists applicants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  source text,                 -- 応募経路
  status text not null default '応募',
  applied_at date not null default current_date,
  joined_at date,              -- 入社日
  memo text,
  created_at timestamptz not null default now()
);

-- ステータス変更履歴
create table if not exists status_history (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references applicants(id) on delete cascade,
  status text not null,
  changed_at timestamptz not null default now()
);

-- ステータス変更時に履歴を自動記録
create or replace function log_status_change() returns trigger as $$
begin
  if (tg_op = 'INSERT') or (new.status is distinct from old.status) then
    insert into status_history (applicant_id, status) values (new.id, new.status);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_status_change on applicants;
create trigger trg_status_change
  after insert or update on applicants
  for each row execute function log_status_change();

-- RLS（MVP: anon キーで読み書きを許可。本番では認証導入を推奨）
alter table applicants enable row level security;
alter table status_history enable row level security;

drop policy if exists "allow all applicants" on applicants;
create policy "allow all applicants" on applicants
  for all using (true) with check (true);

drop policy if exists "allow all status_history" on status_history;
create policy "allow all status_history" on status_history
  for all using (true) with check (true);
