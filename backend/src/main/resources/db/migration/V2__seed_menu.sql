-- Initial menu: the 8 drinks and 9 add-ons from the original design.
-- Generated from frontend/src/lib/menu-data.ts.

insert into products (id, name, description, image, image_alt, tag, badge_label, badge_tone, active, sort_order) values
    ('americano', 'អាមេរិកាណូ', 'អេសប្រេសូទ្វេចាក់លើទឹកក្តៅចម្រោះ បង្កើតបានស្រទាប់ក្រែម៉ាសម្បូរ និងរសជាតិខ្លាំងមានតុល្យភាព។', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRggt_WlMhLpMIk8CUPtO0uQkRTMrjmu2CmCYHSFa6ejydR9JyffWlPbIquGiJRvBsZe1-mCaExrh7dSAGOo-aRDHW8GQO0bFS1oyGa0j4A8-zCv7lB9yYe8vkv4E9injeowzkkkI03PxeQr1Q1wQmRtQdkVoloPvxQP9yKWhQIe1Bw7wlIeqJ7GQPDrIbo9TvR-VdBzSEn2675jJcr8V3DbywYTMgQLq0JabDyd3TBMSWBx24Z_40xw', 'កាហ្វេអាមេរិកាណូក្តៅក្នុងពែងសេរ៉ាមិចលើតុឈើ', 'លីងខ្លាំង', 'ពេញនិយមក្នុងហាង', 'roast', true, 1),
    ('latte', 'កាហ្វេឡាតេ', 'អេសប្រេសូរលាយចូលក្នុងទឹកដោះគោចំហុយពពុះម៉ដ្ឋ ជាមួយគំនូរឡាតេដោយដៃយ៉ាងល្អិតល្អន់។', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJqXOVhNP-xpbFp7shlA8R8Jw1Lkv4FbL9_cGQCkYpw_rvJP7p2_Fg07tCQslA2Ifz_PRyVyW9zTe5uFOrreko4XDJxPUp_qNJwHtY4MIqnom6tdz2pXP-s-O-cBRg2X37LZmbQtrvSC0TtP7YaPJzlV8Ti9fs2uBOASsqZsOEBBAurU7C-2duOhw2pOUSkLCu_JtnalEmS0mZEObrcxcjQiIuK9NI8y98KdDitkqw4rsnZF7pE8dkKw', 'កាហ្វេឡាតេមានគំនូរស្លឹកឈើលើពពុះក្នុងពែងដីដុត', 'លីងមធ្យម', 'ពេញនិយម', 'cocoa', true, 2),
    ('cappuccino', 'កាពូឈីណូ', 'អេសប្រេសូ ទឹកដោះគោចំហុយ និងពពុះក្រាស់ក្នុងបរិមាណស្មើគ្នា រោយម្សៅកាកាវស្រាលៗ។', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-pbQ2XdWSCDy675VkBmrgBkQVFOmRmMJrAD6NV1obQLOY9Lcz6v8P50xGlbPaduv7FO0EKNh_zzoEozVm2LImBSS7CE9TGNQij6RA73-RTOcxFh6a4viTv3OxRXLBk29GsdU3fyGRZjDoYEfJOqWySqWPN2vKuDRhtR-xqzcdYkfEI8e-SCRTspRoyfIbffU5qG7Af0DpxDQdfytyfScxBPWqGbgG6bUZJULo6nYUYqtXV3o81onrfg', 'កាពូឈីណូពពុះក្រាស់ រោយម្សៅកាកាវ', 'ពពុះពិសេស', null, null, true, 3),
    ('mocha', 'កាហ្វេម៉ូកា', 'សូកូឡាខ្មៅហូឡង់ ច្របល់ជាមួយអេសប្រេសូ និងទឹកដោះគោចំហុយទន់រលោង។', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqHi0a9OLelckEbBviQ8wkvZAtp5C1k3S_K6H0bWzXYWUROy8L5xjpEnlCkhSf0aYTY7zqF2WKHc10cD-eYaPNCEzKL4JeNOaK8M0izdlVszKv83nl_XSu6XTfBu5_nR4zI1HQjezcLx628KXKmq6JNf7HeAasIuoWhFKK9wnskJe4EUcLZ8LHUv7Ie2JL6ClBuU6pPcjtLJgZKgyRSxqDn43lGEujpRpdx5ijihd2vpGzVzOl9nbv8Q', 'កាហ្វេម៉ូកាបាញ់ក្រែម និងស្រោចសូកូឡា', 'សូកូឡាហូឡង់', 'ពេញនិយម', 'cocoa', true, 4),
    ('cold-brew', 'ខូលប្រ៊ូទឹកកក', 'ត្រាំក្នុងទឹកត្រជាក់ចម្រោះរយៈពេល 18 ម៉ោង បម្រើជាមួយទឹកកកថ្លា និងក្លិនក្រូចស្រាលៗ។', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJNQp2aLNTf4mTV7ysNMpvTkhutpm2g5eS0KTvpnh48NZ_Uw9sHbwy5hNubV3EGfiL9ZwKMQOAJbJCcwjyjxcf5Tq-otRVgHSJP2hdI7CEEnQRdsHX4hTpSVgS6igTmx3vIDirk6bh81zd6bSbitchTEkCi5zdgAvO2EPpRQw2BWVTCO8NtmpMRGRMWQCz1yuM7gCoKvbTyJI1SCQWQ-KfstiQ_yh-TI_gqH1mCh5DLwq9Ncqup65ghQ', 'កាហ្វេខូលប្រ៊ូជាមួយទឹកកក', 'ត្រាំ 18 ម៉ោង', 'ត្រាំត្រជាក់', 'espresso', true, 5),
    ('caramel-macchiato', 'ការ៉ាមែល ម៉ាគីយ៉ាតូ', 'ទឹកដោះគោចំហុយក្លិនវ៉ានីឡា ចាក់អេសប្រេសូខ្លាំង និងស្រោចការ៉ាមែលប៊ឺ។', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDGyEAItvfo7ZWoVOLEIR91Ra70wjdOLxx6hVEosmHJjSp3KVTMGuevz_ZTmB2HejtjaW0Xpz4w_cuvPoZv_uyhG_iy_Bn2sk7ck3nCuIjTP77EPVGNU4x-bM77ifUf92ARJ5SxD5Jv0ShkPxBZ9v4lwnRSZU8OwotG2lPKLyVyfOSehK7AosjBHVoCppxIBPr4rshA-kK8chPxYQuf0jV4wZQmFjjkRA4lPm55A7OX6qkYRXoHhVMXQ', 'ការ៉ាមែលម៉ាគីយ៉ាតូជាស្រទាប់ៗក្នុងកែវខ្ពស់', 'ការ៉ាមែលផលិតផ្ទាល់', 'ថ្មី', 'honey', true, 6),
    ('matcha', 'តែបៃតងម៉ាឆា', 'តែបៃតងម៉ាឆាថ្នាក់ពិធីពីអ៊ូជិ ប្រទេសជប៉ុន វាយជាមួយទឹកដោះ oat ចំហុយ និងទឹកឃ្មុំផ្កាព្រៃ។', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP0tIK5ildPxbUneW4OWEvG00rvELiS4KaDdgiB9Iy_NiXrkARHB-TmVtT_T8NyoyDJQ8VrKYnUxpjJT1S7UJdxX2oO6qPsppzcmDSXWLm_-LM0Dg5kzxlaArMSvVB1I26q-_CRzqpQ-R6FfnEaDHHJjyjJHbx34iW97jUeWY3YmavExlIYhtJoT9BtMWRgbsxB3R7ObcK_hhkOkMpvearG9PSiWx-l6KYUVnq61JtVuJBV1cQgARgjA', 'ម៉ាឆាឡាតេក្នុងចានសេរ៉ាមិចធ្វើដោយដៃ', 'ម៉ាឆាអ៊ូជិ', 'បុគ្គលិកណែនាំ', 'blush', true, 7),
    ('hot-chocolate', 'សូកូឡាក្តៅបែលហ្ស៊ិក', 'សូកូឡាខ្មៅបែលហ្ស៊ិក 70% រលាយជាមួយទឹកដោះគោស្រស់ ហើយបាញ់ក្រែមវ៉ានីឡាពីលើ។', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ1jfs4SJ9ntQqWmUYtifMknZ0EzLXbo5BJFiDPSSIYSqj3LW4U_uhYbCfqmMmq6438rc4aBgomfpAArMxkIxXTgm_mvwg0ec6pJO2NyNZmOX-lLKxd2O1wfAuvV7_tudEDoHpPQtX8JcVZ_32CXEmRGvvH_HN3t_Y2ot85w9KFFAmyUqvKn7LUgJkX1aPO2SndMFLxzVu5ZaC_Ub3j5yiRMidrxHViyw0ywndw4hUFrbnI8G-_9Z5dQ', 'សូកូឡាក្តៅបែលហ្ស៊ិកបាញ់ក្រែម និងសូកូឡាចិត', 'បែលហ្ស៊ិក 70%', null, null, true, 8);

insert into product_categories (product_id, position, category) values
    ('americano', 0, 'COFFEE'),
    ('americano', 1, 'ESPRESSO'),
    ('latte', 0, 'LATTE'),
    ('latte', 1, 'COFFEE'),
    ('cappuccino', 0, 'COFFEE'),
    ('cappuccino', 1, 'ESPRESSO'),
    ('mocha', 0, 'LATTE'),
    ('mocha', 1, 'COFFEE'),
    ('cold-brew', 0, 'COLD_DRINKS'),
    ('cold-brew', 1, 'COFFEE'),
    ('caramel-macchiato', 0, 'LATTE'),
    ('caramel-macchiato', 1, 'COFFEE'),
    ('matcha', 0, 'NON_COFFEE'),
    ('matcha', 1, 'LATTE'),
    ('hot-chocolate', 0, 'NON_COFFEE');

insert into product_sizes (product_id, position, label, price, volume) values
    ('americano', 0, 'តូច', 2.00, '8 oz'),
    ('americano', 1, 'មធ្យម', 2.50, '12 oz'),
    ('americano', 2, 'ធំ', 3.00, '16 oz'),
    ('latte', 0, 'តូច', 2.50, '8 oz'),
    ('latte', 1, 'មធ្យម', 3.50, '12 oz'),
    ('latte', 2, 'ធំ', 4.00, '16 oz'),
    ('cappuccino', 0, 'តូច', 2.50, '6 oz'),
    ('cappuccino', 1, 'មធ្យម', 3.50, '10 oz'),
    ('cappuccino', 2, 'ធំ', 4.00, '14 oz'),
    ('mocha', 0, 'តូច', 3.00, '8 oz'),
    ('mocha', 1, 'មធ្យម', 3.75, '12 oz'),
    ('mocha', 2, 'ធំ', 4.50, '16 oz'),
    ('cold-brew', 0, 'តូច', 2.00, '12 oz'),
    ('cold-brew', 1, 'មធ្យម', 2.75, '16 oz'),
    ('cold-brew', 2, 'ធំ', 3.50, '20 oz'),
    ('caramel-macchiato', 0, 'តូច', 3.00, '8 oz'),
    ('caramel-macchiato', 1, 'មធ្យម', 4.00, '12 oz'),
    ('caramel-macchiato', 2, 'ធំ', 4.75, '16 oz'),
    ('matcha', 0, 'តូច', 2.75, '8 oz'),
    ('matcha', 1, 'មធ្យម', 3.75, '12 oz'),
    ('matcha', 2, 'ធំ', 4.50, '16 oz'),
    ('hot-chocolate', 0, 'តូច', 2.50, '8 oz'),
    ('hot-chocolate', 1, 'មធ្យម', 3.25, '12 oz'),
    ('hot-chocolate', 2, 'ធំ', 4.00, '16 oz');

insert into add_ons (id, group_key, name, price, active, sort_order) values
    ('a-seed-1', 'milk', 'ទឹកដោះ Oat (Minor Figures)', 0.50, true, 1),
    ('a-seed-2', 'milk', 'ទឹកដោះអាល់ម៉ុន', 0.50, true, 2),
    ('a-seed-3', 'milk', 'ទឹកដោះដូង', 0.50, true, 3),
    ('a-seed-4', 'espresso', 'បន្ថែម Ristretto ទ្វេ', 0.75, true, 4),
    ('a-seed-5', 'espresso', 'ប្ដូរជាកាហ្វេគ្មានកាហ្វេអ៊ីន', 0.50, true, 5),
    ('a-seed-6', 'espresso', 'គ្រាប់កាហ្វេពិសេសតាមរដូវ', 1.00, true, 6),
    ('a-seed-7', 'syrup', 'វ៉ានីឡាម៉ាដាហ្គាស្ការ', 0.65, true, 7),
    ('a-seed-8', 'syrup', 'ផ្កាឡាវេនឌ័របារាំង', 0.65, true, 8),
    ('a-seed-9', 'syrup', 'គ្រាប់ហាហ្សែលណាត់លីង', 0.65, true, 9);
