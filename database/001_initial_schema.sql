-- Budget Tracker PostgreSQL schema
-- Apply from the repository root with:
-- psql -U postgres -d budget_tracker -f database/001_initial_schema.sql

create extension if not exists pgcrypto;

create table if not exists app_users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    password_hash text not null,
    display_name text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint app_users_email_lowercase check (email = lower(email)),
    constraint app_users_email_not_blank check (length(trim(email)) > 3)
);

create table if not exists accounts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references app_users(id) on delete cascade,
    name text not null,
    opening_balance numeric(14, 2) not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint accounts_name_not_blank check (length(trim(name)) > 0),
    constraint accounts_opening_balance_nonnegative check (opening_balance >= 0),
    constraint accounts_user_name_unique unique (user_id, name),
    constraint accounts_id_user_unique unique (id, user_id)
);

create table if not exists categories (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references app_users(id) on delete cascade,
    type text not null,
    name text not null,
    created_at timestamptz not null default now(),
    constraint categories_type_valid check (type in ('Income', 'Expense')),
    constraint categories_name_not_blank check (length(trim(name)) > 0),
    constraint categories_user_type_name_unique unique (user_id, type, name),
    constraint categories_id_user_unique unique (id, user_id)
);

create table if not exists transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references app_users(id) on delete cascade,
    type text not null,
    account_id uuid,
    from_account_id uuid,
    to_account_id uuid,
    category_id uuid,
    amount numeric(14, 2) not null,
    fee_amount numeric(14, 2) not null default 0,
    description text,
    transaction_date date not null,
    transaction_time time,
    linked_transfer_id uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint transactions_type_valid check (type in ('Income', 'Expense', 'Transfer')),
    constraint transactions_amount_positive check (amount > 0),
    constraint transactions_fee_nonnegative check (fee_amount >= 0),
    constraint transactions_income_expense_account check (
        type = 'Transfer'
        or account_id is not null
    ),
    constraint transactions_transfer_accounts check (
        type <> 'Transfer'
        or (
            from_account_id is not null
            and to_account_id is not null
            and from_account_id <> to_account_id
        )
    ),
    constraint transactions_transfer_fee_zero check (
        type = 'Transfer' or fee_amount = 0
    ),
    constraint transactions_id_user_unique unique (id, user_id),
    constraint transactions_account_owner foreign key (account_id, user_id) references accounts(id, user_id) on delete restrict,
    constraint transactions_from_account_owner foreign key (from_account_id, user_id) references accounts(id, user_id) on delete restrict,
    constraint transactions_to_account_owner foreign key (to_account_id, user_id) references accounts(id, user_id) on delete restrict,
    constraint transactions_category_owner foreign key (category_id, user_id) references categories(id, user_id) on delete restrict,
    constraint transactions_linked_transfer_owner foreign key (linked_transfer_id, user_id) references transactions(id, user_id) on delete cascade
);

create table if not exists budgets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references app_users(id) on delete cascade,
    category_id uuid not null,
    budget_month date not null,
    limit_amount numeric(14, 2) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint budgets_month_first_day check (budget_month = date_trunc('month', budget_month)::date),
    constraint budgets_limit_positive check (limit_amount > 0),
    constraint budgets_user_category_month_unique unique (user_id, category_id, budget_month),
    constraint budgets_category_owner foreign key (category_id, user_id) references categories(id, user_id) on delete restrict
);

create table if not exists goals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references app_users(id) on delete cascade,
    name text not null,
    target_amount numeric(14, 2) not null,
    current_amount numeric(14, 2) not null default 0,
    target_date date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint goals_name_not_blank check (length(trim(name)) > 0),
    constraint goals_target_positive check (target_amount > 0),
    constraint goals_current_nonnegative check (current_amount >= 0),
    constraint goals_current_not_over_target check (current_amount <= target_amount),
    constraint goals_user_name_unique unique (user_id, name)
);

create index if not exists accounts_user_id_idx on accounts(user_id);
create index if not exists categories_user_id_idx on categories(user_id);
create index if not exists transactions_user_date_idx on transactions(user_id, transaction_date desc);
create index if not exists transactions_user_account_idx on transactions(user_id, account_id);
create index if not exists transactions_transfer_source_idx on transactions(user_id, from_account_id);
create index if not exists transactions_transfer_destination_idx on transactions(user_id, to_account_id);
create index if not exists budgets_user_month_idx on budgets(user_id, budget_month);
create index if not exists goals_user_id_idx on goals(user_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists app_users_set_updated_at on app_users;
create trigger app_users_set_updated_at
before update on app_users
for each row execute function set_updated_at();

drop trigger if exists accounts_set_updated_at on accounts;
create trigger accounts_set_updated_at
before update on accounts
for each row execute function set_updated_at();

drop trigger if exists transactions_set_updated_at on transactions;
create trigger transactions_set_updated_at
before update on transactions
for each row execute function set_updated_at();

drop trigger if exists budgets_set_updated_at on budgets;
create trigger budgets_set_updated_at
before update on budgets
for each row execute function set_updated_at();

drop trigger if exists goals_set_updated_at on goals;
create trigger goals_set_updated_at
before update on goals
for each row execute function set_updated_at();
