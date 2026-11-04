-- Printable QR codes, e.g. one per table or one for the counter.
-- A code opens SITE_URL (frontend/.env), filtered to `category` when set. The website
-- draws the image; only the label and the target live here.

create table qr_codes (
    id         varchar(40)  primary key,
    name       varchar(60)  not null,
    category   varchar(20)  check (category in ('COFFEE', 'LATTE', 'ESPRESSO', 'COLD_DRINKS', 'NON_COFFEE')),
    active     boolean      not null default true,
    sort_order integer      not null default 0,
    created_at timestamptz  not null default now(),
    updated_at timestamptz  not null default now()
);
create index qr_codes_sort_idx on qr_codes (sort_order);

insert into qr_codes (id, name, category, sort_order) values ('q-menu', 'ម៉ឺនុយទាំងមូល', null, 1);
