-- CoffeeShop schema: users (JWT login), products (menu drinks) and add-ons.

create table users (
    id            uuid         primary key,
    email         varchar(254) not null,
    password_hash varchar(100) not null,
    full_name     varchar(80)  not null,
    role          varchar(20)  not null check (role in ('ADMIN', 'CUSTOMER')),
    created_at    timestamptz  not null default now()
);
-- Emails are compared case-insensitively.
create unique index users_email_lower_uk on users (lower(email));

create table products (
    id          varchar(40)   primary key,
    name        varchar(60)   not null,
    description varchar(240)  not null,
    image       varchar(1000) not null,
    image_alt   varchar(120)  not null,
    tag         varchar(30)   not null,
    badge_label varchar(40),
    badge_tone  varchar(20) check (badge_tone in ('roast', 'cocoa', 'espresso', 'honey', 'blush')),
    active      boolean       not null default true,
    sort_order  integer       not null default 0,
    created_at  timestamptz   not null default now(),
    updated_at  timestamptz   not null default now(),
    -- A badge has both a label and a tone, or neither.
    constraint products_badge_ck check ((badge_label is null) = (badge_tone is null))
);
create index products_active_sort_idx on products (active, sort_order);

create table product_categories (
    product_id varchar(40) not null references products (id) on delete cascade,
    position   integer     not null,
    category   varchar(20) not null check (category in ('COFFEE', 'LATTE', 'ESPRESSO', 'COLD_DRINKS', 'NON_COFFEE')),
    primary key (product_id, position)
);

create table product_sizes (
    product_id varchar(40)  not null references products (id) on delete cascade,
    position   integer      not null,
    label      varchar(20)  not null,
    price      numeric(8, 2) not null check (price > 0),
    volume     varchar(20)  not null,
    primary key (product_id, position)
);

create table add_ons (
    id         varchar(40)   primary key,
    group_key  varchar(20)   not null check (group_key in ('milk', 'espresso', 'syrup')),
    name       varchar(60)   not null,
    price      numeric(6, 2) not null check (price >= 0),
    active     boolean       not null default true,
    sort_order integer       not null default 0,
    created_at timestamptz   not null default now(),
    updated_at timestamptz   not null default now()
);
create index add_ons_group_sort_idx on add_ons (group_key, sort_order);
