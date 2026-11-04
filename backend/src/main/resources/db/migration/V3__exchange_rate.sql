-- USD → KHR exchange rate used to show riel prices next to dollar prices.
-- Exactly one row (id = 1); ADMINs change it via PUT /api/admin/exchange-rate.

create table exchange_rate (
    id          smallint     primary key default 1 check (id = 1),
    khr_per_usd integer      not null check (khr_per_usd between 1000 and 10000),
    updated_at  timestamptz  not null default now(),
    updated_by  varchar(254)
);

insert into exchange_rate (id, khr_per_usd) values (1, 4100);
