-- =============================================================
-- SecondWear Seed Data
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================

-- =====================
-- STEP 1: Create 20 Users in auth.users
-- The existing trigger "on_auth_user_created" will automatically
-- insert corresponding rows into public.users
-- =====================

-- Generate UUIDs for our users so we can reference them in products
DO $$
DECLARE
  user_ids UUID[] := ARRAY[
    'a1111111-1111-1111-1111-111111111111'::UUID,
    'a2222222-2222-2222-2222-222222222222'::UUID,
    'a3333333-3333-3333-3333-333333333333'::UUID,
    'a4444444-4444-4444-4444-444444444444'::UUID,
    'a5555555-5555-5555-5555-555555555555'::UUID,
    'a6666666-6666-6666-6666-666666666666'::UUID,
    'a7777777-7777-7777-7777-777777777777'::UUID,
    'a8888888-8888-8888-8888-888888888888'::UUID,
    'a9999999-9999-9999-9999-999999999999'::UUID,
    'aa000000-0000-0000-0000-aaaaaaaaaaaa'::UUID,
    'ab111111-1111-1111-1111-bbbbbbbbbbbb'::UUID,
    'ac222222-2222-2222-2222-cccccccccccc'::UUID,
    'ad333333-3333-3333-3333-dddddddddddd'::UUID,
    'ae444444-4444-4444-4444-eeeeeeeeeeee'::UUID,
    'af555555-5555-5555-5555-ffffffffffff'::UUID,
    'b1666666-6666-6666-6666-111111111111'::UUID,
    'b2777777-7777-7777-7777-222222222222'::UUID,
    'b3888888-8888-8888-8888-333333333333'::UUID,
    'b4999999-9999-9999-9999-444444444444'::UUID,
    'b5000000-0000-0000-0000-555555555555'::UUID
  ];
  user_names TEXT[] := ARRAY[
    'מיכל כהן', 'דניאל לוי', 'שירה אברהם', 'יונתן מזרחי', 'נועה גולן',
    'אורי דוד', 'רותם שמש', 'ליאור פרץ', 'תמר אשכנזי', 'עומר ביטון',
    'יעל חדד', 'איתי רוזנברג', 'מאיה סלע', 'אדם יוסף', 'שקד ברוך',
    'הילה נחום', 'גיא אוחנה', 'דנה מלכה', 'ניר שלום', 'ליה קפלן'
  ];
  user_emails TEXT[] := ARRAY[
    'michal.cohen@gmail.com', 'daniel.levi@gmail.com', 'shira.avraham@gmail.com',
    'yonatan.mizrachi@gmail.com', 'noa.golan@gmail.com', 'ori.david@gmail.com',
    'rotem.shemesh@gmail.com', 'lior.peretz@gmail.com', 'tamar.ashkenazi@gmail.com',
    'omer.biton@gmail.com', 'yael.hadad@gmail.com', 'itay.rosenberg@gmail.com',
    'maya.sela@gmail.com', 'adam.yosef@gmail.com', 'shaked.baruch@gmail.com',
    'hila.nachum@gmail.com', 'guy.ohana@gmail.com', 'dana.malka@gmail.com',
    'nir.shalom@gmail.com', 'lia.kaplan@gmail.com'
  ];
  user_phones TEXT[] := ARRAY[
    '052-4445566', '054-7778899', '050-3332211', '053-9998877', '052-1112233',
    '054-3344556', '050-6677889', '053-2233445', '052-8899001', '054-5566778',
    '050-1122334', '053-4455667', '052-7788990', '054-0011223', '050-3344556',
    '053-6677889', '052-9900112', '054-2233445', '050-5566778', '053-8899001'
  ];
  avatar_urls TEXT[] := ARRAY[
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150&auto=format&fit=crop&q=80'
  ];
  i INT;
  hashed_pw TEXT;
BEGIN
  -- Use a shared password for all seed users: "Secondwear2024!"
  hashed_pw := crypt('Secondwear2024!', gen_salt('bf'));

  FOR i IN 1..20 LOOP
    -- Skip if user already exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_ids[i]) THEN
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        user_ids[i],
        'authenticated',
        'authenticated',
        user_emails[i],
        hashed_pw,
        NOW() - (interval '1 day' * (20 - i + 1)),  -- Staggered join dates
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object(
          'full_name', user_names[i],
          'phone', user_phones[i],
          'avatar_url', avatar_urls[i]
        ),
        NOW() - (interval '1 day' * (20 - i + 1)),
        NOW() - (interval '1 day' * (20 - i + 1)),
        '',
        '',
        '',
        ''
      );
    END IF;
  END LOOP;
END;
$$;

-- Also insert into auth.identities for each user (required by Supabase)
DO $$
DECLARE
  user_ids UUID[] := ARRAY[
    'a1111111-1111-1111-1111-111111111111'::UUID,
    'a2222222-2222-2222-2222-222222222222'::UUID,
    'a3333333-3333-3333-3333-333333333333'::UUID,
    'a4444444-4444-4444-4444-444444444444'::UUID,
    'a5555555-5555-5555-5555-555555555555'::UUID,
    'a6666666-6666-6666-6666-666666666666'::UUID,
    'a7777777-7777-7777-7777-777777777777'::UUID,
    'a8888888-8888-8888-8888-888888888888'::UUID,
    'a9999999-9999-9999-9999-999999999999'::UUID,
    'aa000000-0000-0000-0000-aaaaaaaaaaaa'::UUID,
    'ab111111-1111-1111-1111-bbbbbbbbbbbb'::UUID,
    'ac222222-2222-2222-2222-cccccccccccc'::UUID,
    'ad333333-3333-3333-3333-dddddddddddd'::UUID,
    'ae444444-4444-4444-4444-eeeeeeeeeeee'::UUID,
    'af555555-5555-5555-5555-ffffffffffff'::UUID,
    'b1666666-6666-6666-6666-111111111111'::UUID,
    'b2777777-7777-7777-7777-222222222222'::UUID,
    'b3888888-8888-8888-8888-333333333333'::UUID,
    'b4999999-9999-9999-9999-444444444444'::UUID,
    'b5000000-0000-0000-0000-555555555555'::UUID
  ];
  user_emails TEXT[] := ARRAY[
    'michal.cohen@gmail.com', 'daniel.levi@gmail.com', 'shira.avraham@gmail.com',
    'yonatan.mizrachi@gmail.com', 'noa.golan@gmail.com', 'ori.david@gmail.com',
    'rotem.shemesh@gmail.com', 'lior.peretz@gmail.com', 'tamar.ashkenazi@gmail.com',
    'omer.biton@gmail.com', 'yael.hadad@gmail.com', 'itay.rosenberg@gmail.com',
    'maya.sela@gmail.com', 'adam.yosef@gmail.com', 'shaked.baruch@gmail.com',
    'hila.nachum@gmail.com', 'guy.ohana@gmail.com', 'dana.malka@gmail.com',
    'nir.shalom@gmail.com', 'lia.kaplan@gmail.com'
  ];
  i INT;
BEGIN
  FOR i IN 1..20 LOOP
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = user_ids[i] AND provider = 'email') THEN
      INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        provider,
        identity_data,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        user_ids[i],
        user_emails[i],
        'email',
        jsonb_build_object('sub', user_ids[i]::text, 'email', user_emails[i]),
        NOW() - (interval '1 day' * (20 - i + 1)),
        NOW() - (interval '1 day' * (20 - i + 1)),
        NOW() - (interval '1 day' * (20 - i + 1))
      );
    END IF;
  END LOOP;
END;
$$;


-- =====================
-- STEP 2: Ensure Categories exist
-- =====================
INSERT INTO public.categories (id, name, icon_url)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'נעליים', 'Footprints'),
  ('c1000000-0000-0000-0000-000000000002', 'ג''ינס', 'Layers'),
  ('c1000000-0000-0000-0000-000000000003', 'מכנסיים', 'Wind'),
  ('c1000000-0000-0000-0000-000000000004', 'חולצה', 'Shirt'),
  ('c1000000-0000-0000-0000-000000000005', 'גופיות', 'Sparkles'),
  ('c1000000-0000-0000-0000-000000000006', 'שמלות וחצאיות', 'Sparkles'),
  ('c1000000-0000-0000-0000-000000000007', 'ז''קטים ומעילים', 'Shirt'),
  ('c1000000-0000-0000-0000-000000000008', 'אקססוריז ותיקים', 'ShoppingBag')
ON CONFLICT (name) DO UPDATE SET icon_url = EXCLUDED.icon_url;


-- =====================
-- STEP 3: Get category IDs dynamically
-- and insert ~80 products spread across 20 users
-- =====================
DO $$
DECLARE
  cat_shoes UUID;
  cat_jeans UUID;
  cat_pants UUID;
  cat_shirts UUID;
  cat_tops UUID;

  user_ids UUID[] := ARRAY[
    'a1111111-1111-1111-1111-111111111111'::UUID,
    'a2222222-2222-2222-2222-222222222222'::UUID,
    'a3333333-3333-3333-3333-333333333333'::UUID,
    'a4444444-4444-4444-4444-444444444444'::UUID,
    'a5555555-5555-5555-5555-555555555555'::UUID,
    'a6666666-6666-6666-6666-666666666666'::UUID,
    'a7777777-7777-7777-7777-777777777777'::UUID,
    'a8888888-8888-8888-8888-888888888888'::UUID,
    'a9999999-9999-9999-9999-999999999999'::UUID,
    'aa000000-0000-0000-0000-aaaaaaaaaaaa'::UUID,
    'ab111111-1111-1111-1111-bbbbbbbbbbbb'::UUID,
    'ac222222-2222-2222-2222-cccccccccccc'::UUID,
    'ad333333-3333-3333-3333-dddddddddddd'::UUID,
    'ae444444-4444-4444-4444-eeeeeeeeeeee'::UUID,
    'af555555-5555-5555-5555-ffffffffffff'::UUID,
    'b1666666-6666-6666-6666-111111111111'::UUID,
    'b2777777-7777-7777-7777-222222222222'::UUID,
    'b3888888-8888-8888-8888-333333333333'::UUID,
    'b4999999-9999-9999-9999-444444444444'::UUID,
    'b5000000-0000-0000-0000-555555555555'::UUID
  ];
BEGIN
  -- Get category IDs
  SELECT id INTO cat_shoes FROM public.categories WHERE name = 'נעליים' LIMIT 1;
  SELECT id INTO cat_jeans FROM public.categories WHERE name = 'ג''ינס' LIMIT 1;
  SELECT id INTO cat_pants FROM public.categories WHERE name = 'מכנסיים' LIMIT 1;
  SELECT id INTO cat_shirts FROM public.categories WHERE name = 'חולצה' LIMIT 1;
  SELECT id INTO cat_tops FROM public.categories WHERE name = 'גופיות' LIMIT 1;

  -- =========================
  -- SHOES (16 products)
  -- =========================
  INSERT INTO public.products (title, description, price, image_url, category_id, user_id, status, created_at) VALUES
  ('סניקרס Nike Air Force 1 לבן', 'נעלי נייק אייר פורס 1 לבנות קלאסיות. מידה 42. נלבשו מעט מאוד, במצב כמו חדש.', 350, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[1], 'active', NOW() - interval '2 hours'),
  ('מגפי Dr. Martens שחורים', 'מגפי ד"ר מרטינס 1460 קלאסיים בצבע שחור. מידה 40. עור אמיתי, מצב מעולה.', 480, 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[2], 'active', NOW() - interval '5 hours'),
  ('סנדלי Birkenstock Arizona', 'סנדלי בירקנשטוק אריזונה בצבע חום טבעי. מידה 41. סוליית שעם מקורית, מצב מצוין.', 280, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[3], 'active', NOW() - interval '8 hours'),
  ('נעלי ריצה Adidas Ultraboost', 'נעלי ריצה אדידס אולטראבוסט בצבע שחור/לבן. מידה 43. טכנולוגיית Boost, מצב טוב מאוד.', 320, 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[4], 'active', NOW() - interval '12 hours'),
  ('נעלי עקב אלגנטיות זהב', 'נעלי עקב מהממות בצבע זהב מטאלי. מידה 38. גובה עקב 8 ס"מ, נלבשו פעם אחת לאירוע.', 190, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[5], 'active', NOW() - interval '1 day'),
  ('סניקרס New Balance 574', 'ניו באלנס 574 קלאסי בצבע אפור/כחול. מידה 44. נוחות מדהימה, מצב מצוין.', 260, 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[6], 'active', NOW() - interval '1 day 3 hours'),
  ('כפכפי Havaianas צבעוניים', 'כפכפי הוויאנס מקוריים בהדפס טרופי צבעוני. מידה 39-40. חדשים לגמרי.', 70, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[7], 'active', NOW() - interval '1 day 6 hours'),
  ('נעלי Converse All Star שחור', 'קונברס אול סטאר גבוהות בצבע שחור קלאסי. מידה 41. אייקון שלא יוצא מהאופנה.', 180, 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[8], 'active', NOW() - interval '2 days'),
  ('נעלי אוקספורד חומות', 'נעלי אוקספורד עור חום קלאסיות. מידה 43. מושלמות למשרד או אירועים, מצב מעולה.', 340, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[9], 'active', NOW() - interval '2 days 5 hours'),
  ('נעלי Vans Old Skool', 'ואנס אולד סקול שחור/לבן. מידה 40. הנעל הקלאסית ביותר, מצב טוב.', 200, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[10], 'active', NOW() - interval '3 days'),
  ('סניקרס Puma RS-X', 'פומה RS-X בצבעים ורוד/תכלת. מידה 39. סוליה עבה ונוחה, כמו חדש.', 290, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[11], 'active', NOW() - interval '3 days 8 hours'),
  ('מגפוני צ''לסי שחורים', 'מגפוני צ''לסי מעור שחור איכותי. מידה 42. גזרה קלאסית בריטית, מצב מצוין.', 310, 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[12], 'active', NOW() - interval '4 days'),
  ('נעלי בלט ורודות', 'נעלי בלרינה ורודות עדינות. מידה 37. מושלמות ליומיום, קלות ונוחות.', 120, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[13], 'active', NOW() - interval '4 days 4 hours'),
  ('נעלי Reebok Classic', 'ריבוק קלאסיק לבן/כחול. מידה 44. עיצוב רטרו אייקוני, מצב טוב מאוד.', 230, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[14], 'active', NOW() - interval '5 days'),
  ('נעלי טיולים Timberland', 'נעלי טימברלנד קלאסיות בצבע חיטה. מידה 43. עמידות למים, מצב מעולה.', 420, 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[15], 'active', NOW() - interval '5 days 6 hours'),
  ('סניקרס FILA Disruptor', 'פילה דיסרפטור לבן. מידה 38. סוליה מוגבהת טרנדית, נלבשו מעט.', 240, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80', cat_shoes, user_ids[16], 'active', NOW() - interval '6 days')
  ON CONFLICT DO NOTHING;

  -- =========================
  -- JEANS (16 products)
  -- =========================
  INSERT INTO public.products (title, description, price, image_url, category_id, user_id, status, created_at) VALUES
  ('ג''ינס Levi''s 501 קלאסי', 'ג''ינס ליוויס 501 בגזרה ישרה קלאסית. צבע כחול כהה, מידה 32. מצב מצוין.', 190, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[1], 'active', NOW() - interval '3 hours'),
  ('ג''ינס סקיני שחור Zara', 'ג''ינס סקיני שחור של זארה. מידה 28. גזרה צמודה ומחמיאה, מצב מעולה.', 140, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[3], 'active', NOW() - interval '7 hours'),
  ('ג''ינס Mom Fit גבוה', 'ג''ינס מאם פיט בצבע תכלת בהיר. מידה 27. גזרה גבוהה טרנדית, מצב מצוין.', 160, 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[5], 'active', NOW() - interval '15 hours'),
  ('ג''ינס Wrangler רחב', 'ג''ינס רנגלר בגזרה רחבה בצבע כחול בינוני. מידה 34. סטייל וינטג'' אותנטי.', 170, 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[7], 'active', NOW() - interval '1 day 2 hours'),
  ('ג''ינס בויפרנד קרעים', 'ג''ינס בויפרנד עם קרעים אומנותיים. מידה 29. לוק קז''ואלי שיקי, מצב מעולה.', 155, 'https://images.unsplash.com/photo-1475178626620-a4d074967571?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[9], 'active', NOW() - interval '1 day 8 hours'),
  ('ג''ינס Diesel בגזרה ישרה', 'ג''ינס דיזל פרימיום בגזרה ישרה. מידה 33. עיצוב איטלקי, שטיפה מיוחדת.', 250, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[11], 'active', NOW() - interval '2 days 3 hours'),
  ('ג''ינס קצר Denim Shorts', 'מכנסי ג''ינס קצרים בצבע כחול בהיר. מידה 30. מושלמים לקיץ, מצב טוב מאוד.', 90, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[13], 'active', NOW() - interval '2 days 10 hours'),
  ('ג''ינס Lee Cooper כחול', 'ג''ינס לי קופר קלאסי בגזרה רגילה. מידה 36. איכות מעולה, ננעל מעט.', 130, 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[15], 'active', NOW() - interval '3 days 2 hours'),
  ('ג''ינס Levi''s 710 סופר סקיני', 'ליוויס 710 סופר סקיני בצבע כחול כהה. מידה 26. גמישות מעולה, כמו חדש.', 200, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[17], 'active', NOW() - interval '3 days 9 hours'),
  ('ג''ינס H&M בגזרה ישרה', 'ג''ינס H&M בצבע כחול בינוני. מידה 31. גזרה ישרה נוחה, מצב מצוין.', 100, 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[19], 'active', NOW() - interval '4 days 5 hours'),
  ('ג''ינס Pull&Bear משופשף', 'ג''ינס פול אנד בר עם שטיפה משופשפת. מידה 30. לוק קז''ואלי, מצב טוב.', 110, 'https://images.unsplash.com/photo-1475178626620-a4d074967571?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[2], 'active', NOW() - interval '4 days 11 hours'),
  ('ג''ינס אוברסייז כחול כהה', 'ג''ינס אוברסייז בצבע כחול כהה עמוק. מידה 28. טרנד חם, נלבש פעמיים.', 175, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[4], 'active', NOW() - interval '5 days 3 hours'),
  ('ג''ינס Mango מותן גבוה', 'ג''ינס מנגו בגזרת מותן גבוה. מידה 27. צבע כחול קלאסי, מצב מעולה.', 145, 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[6], 'active', NOW() - interval '5 days 8 hours'),
  ('ג''ינס G-Star RAW שחור', 'ג''ינס G-Star RAW בצבע שחור. מידה 32. עיצוב הולנדי ייחודי, איכות פרימיום.', 220, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[8], 'active', NOW() - interval '6 days 2 hours'),
  ('ג''ינס Pepe Jeans לונדון', 'ג''ינס פפה ג''ינס בגזרה רגילה. מידה 34. מותג בריטי קלאסי, מצב טוב מאוד.', 185, 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[10], 'active', NOW() - interval '6 days 7 hours'),
  ('ג''ינס Tommy Hilfiger כחול', 'ג''ינס טומי הילפיגר בצבע כחול בינוני. מידה 33. עיצוב אמריקאי קלאסי.', 210, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80', cat_jeans, user_ids[12], 'active', NOW() - interval '7 days')
  ON CONFLICT DO NOTHING;

  -- =========================
  -- PANTS (16 products)
  -- =========================
  INSERT INTO public.products (title, description, price, image_url, category_id, user_id, status, created_at) VALUES
  ('מכנסי מחויט אלגנטי שחור', 'מכנסיים מחויטים שחורים של Zara. מידה M. גזרה ישרה ומחמיאה, מושלמים למשרד.', 160, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[2], 'active', NOW() - interval '4 hours'),
  ('מכנסי קרגו ירוק זית', 'מכנסי קרגו ירוק זית עם כיסים. מידה L. סטייל צבאי אופנתי, מצב מצוין.', 140, 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[4], 'active', NOW() - interval '9 hours'),
  ('מכנסי פשתן בז'' קיציים', 'מכנסי פשתן בצבע בז'' חולי. מידה S. קלילים ונוחים לקיץ, כמו חדשים.', 130, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[6], 'active', NOW() - interval '18 hours'),
  ('מכנסי טרנינג Nike Tech', 'מכנסי טרנינג נייק טק פליס שחורים. מידה M. נוחות פרימיום, מצב מעולה.', 220, 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[8], 'active', NOW() - interval '1 day 4 hours'),
  ('מכנסי צ''ינו חום חמרה', 'מכנסי צ''ינו חום חמרה של H&M. מידה 32. גזרה סלים, מתאימים ליומיום ולמשרד.', 110, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[10], 'active', NOW() - interval '1 day 10 hours'),
  ('מכנסי ריצה Adidas שחור', 'מכנסי ריצה אדידס עם 3 פסים. מידה L. בד מנדף זיעה, מצב מצוין.', 150, 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[12], 'active', NOW() - interval '2 days 6 hours'),
  ('מכנסי פלאצו רחבים שחור', 'מכנסי פלאצו רחבים בצבע שחור. מידה S. אלגנטיים ונוחים, מצב מעולה.', 170, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[14], 'active', NOW() - interval '2 days 12 hours'),
  ('מכנסי קצרים בצבע חאקי', 'מכנסיים קצרים חאקי של Pull&Bear. מידה M. מושלמים לימי הקיץ.', 80, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[16], 'active', NOW() - interval '3 days 4 hours'),
  ('מכנסי סקיני שחור Mango', 'מכנסיים סקיני שחורים של מנגו. מידה 27. בד נמתח, מצב טוב מאוד.', 125, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[18], 'active', NOW() - interval '3 days 10 hours'),
  ('מכנסי ג''וגר אפורים', 'מכנסי ג''וגר אפורים עם גומי. מידה XL. נוחים מאוד, מצב מצוין.', 100, 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[20], 'active', NOW() - interval '4 days 2 hours'),
  ('מכנסי חליפה כחול נייבי', 'מכנסי חליפה בצבע כחול נייבי. מידה 33. תפירה איכותית, מצב מעולה.', 200, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[1], 'active', NOW() - interval '4 days 8 hours'),
  ('מכנסי קורדרוי חרדל', 'מכנסי קורדרוי בצבע חרדל. מידה 30. בד רך ואיכותי, מושלם לסתיו.', 145, 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[3], 'active', NOW() - interval '5 days 1 hour'),
  ('מכנסי יוגה שחורים Nike', 'מכנסי יוגה/לייקרה שחורים של נייק. מידה S. בד נמתח ונושם, כמו חדשים.', 135, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[5], 'active', NOW() - interval '5 days 6 hours'),
  ('מכנסי ברמודה לבן', 'מכנסי ברמודה לבנים. מידה L. קלילים, מתאימים לחוף ולקיץ.', 85, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[7], 'active', NOW() - interval '5 days 11 hours'),
  ('מכנסיים רחבים פרחוניים', 'מכנסיים רחבים עם הדפס פרחוני. מידה M. צבעוניים ושמחים, מצב מצוין.', 115, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[9], 'active', NOW() - interval '6 days 4 hours'),
  ('מכנסי טרנינג Champion אפור', 'מכנסי טרנינג צ''מפיון באפור מלאנג''. מידה L. לוגו רקום, מצב טוב מאוד.', 160, 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop&q=80', cat_pants, user_ids[11], 'active', NOW() - interval '6 days 9 hours')
  ON CONFLICT DO NOTHING;

  -- =========================
  -- SHIRTS (16 products)
  -- =========================
  INSERT INTO public.products (title, description, price, image_url, category_id, user_id, status, created_at) VALUES
  ('חולצה מכופתרת פסים כחול-לבן', 'חולצה מכופתרת מכותנה עם פסי תכלת ולבן עדינים. מידה L. מצב מצוין.', 115, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[1], 'active', NOW() - interval '6 hours'),
  ('חולצת טי שחורה בייסיק', 'חולצת טי שחורה של COS. מידה M. כותנה אורגנית, גזרה אוברסייז קלה.', 70, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[3], 'active', NOW() - interval '10 hours'),
  ('חולצת פולו Ralph Lauren ירוקה', 'חולצת פולו ראלף לורן ירוקה קלאסית. מידה M. לוגו רקום, מצב מעולה.', 180, 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[5], 'active', NOW() - interval '16 hours'),
  ('חולצה מכופתרת לבנה קלאסית', 'חולצה לבנה מכופתרת של Massimo Dutti. מידה S. מושלמת למשרד, כמו חדשה.', 150, 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[7], 'active', NOW() - interval '1 day 5 hours'),
  ('חולצת הוודי Nike שחור', 'הוודי נייק שחור עם רוכסן. מידה L. פליס פנימי חמים, מצב מצוין.', 200, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[9], 'active', NOW() - interval '1 day 11 hours'),
  ('חולצת פלנל משבצות אדום', 'חולצת פלנל במשבצות אדום/שחור. מידה XL. סטייל לאמברג''ק, חמימה ונוחה.', 120, 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[11], 'active', NOW() - interval '2 days 4 hours'),
  ('סווטשירט Adidas אפור', 'סווטשירט אדידס אפור עם לוגו לבן. מידה M. בד רך ומפנק, מצב מעולה.', 170, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[13], 'active', NOW() - interval '2 days 9 hours'),
  ('חולצת טי הדפס גרפי', 'חולצת טי עם הדפס גרפי אמנותי. מידה L. עיצוב ייחודי, מצב חדש.', 85, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[15], 'active', NOW() - interval '3 days 1 hour'),
  ('חולצת קרופ לבנה', 'חולצת קרופ לבנה בגזרה קצרה. מידה S. מכותנה רכה, מצב מצוין.', 65, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[17], 'active', NOW() - interval '3 days 7 hours'),
  ('חולצת ג''ינס כחולה', 'חולצת ג''ינס כחולה עם כפתורי פנינה. מידה M. לוק קז''ואלי שיקי.', 135, 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[19], 'active', NOW() - interval '4 days 3 hours'),
  ('חולצת פסים ימי צבעונית', 'חולצת פסים צבעוניים בסגנון ימי. מידה M. כותנה 100%, מצב טוב מאוד.', 90, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[2], 'active', NOW() - interval '4 days 9 hours'),
  ('חולצת סריג צמר שמנת', 'סוודר סריג בצבע שמנת. מידה L. צמר מרינו רך, מושלם לחורף.', 190, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[4], 'active', NOW() - interval '5 days 2 hours'),
  ('חולצה הוואי הדפס טרופי', 'חולצה הוואיאנית עם הדפס טרופי. מידה L. צבעונית ושמחה, מצב חדש.', 95, 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[6], 'active', NOW() - interval '5 days 7 hours'),
  ('חולצת בייסיק לבנה V צוואר', 'חולצת V צוואר לבנה בייסיק. מידה M. כותנה רכה, מצב מצוין.', 55, 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[8], 'active', NOW() - interval '5 days 12 hours'),
  ('ז''קט בומבר שחור', 'ז''קט בומבר שחור קלאסי. מידה M. רוכסן מתכת, רירית סאטן, מצב מעולה.', 250, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[10], 'active', NOW() - interval '6 days 5 hours'),
  ('חולצת תחרה שחורה', 'חולצת תחרה שחורה אלגנטית. מידה S. מושלמת לערב, נלבשה פעם אחת.', 140, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80', cat_shirts, user_ids[12], 'active', NOW() - interval '6 days 10 hours')
  ON CONFLICT DO NOTHING;

  -- =========================
  -- TOPS / TANK TOPS (16 products)
  -- =========================
  INSERT INTO public.products (title, description, price, image_url, category_id, user_id, status, created_at) VALUES
  ('גופיית קרופ ורודה', 'גופיית קרופ ורודה בגזרה צמודה. מידה S. בד ריב נוח ומחמיא.', 55, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[2], 'active', NOW() - interval '5 hours'),
  ('גופייה ספורטיבית Nike שחור', 'גופייה ספורטיבית נייק Dri-FIT שחורה. מידה M. בד מנדף זיעה, מצב מעולה.', 80, 'https://images.unsplash.com/photo-1503341504253-dff4f94032fc?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[4], 'active', NOW() - interval '11 hours'),
  ('גופייה לבנה בייסיק כותנה', 'גופייה לבנה בייסיק מכותנה 100%. מידה L. קלאסית ונוחה, מצב טוב.', 40, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[6], 'active', NOW() - interval '19 hours'),
  ('גופיית תחרה שמנת', 'גופיית תחרה בצבע שמנת עדין. מידה XS. רומנטית ויפה, מצב חדש.', 75, 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[8], 'active', NOW() - interval '1 day 6 hours'),
  ('גופייה רצועות דקות שחור', 'גופייה עם רצועות דקות שחורה. מידה S. בד סאטן עדין, אלגנטית.', 60, 'https://images.unsplash.com/photo-1503341504253-dff4f94032fc?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[10], 'active', NOW() - interval '1 day 12 hours'),
  ('גופייה ספורטיבית Under Armour', 'גופייה ספורטיבית אנדר ארמור אפורה. מידה L. HeatGear, מצב מצוין.', 90, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[12], 'active', NOW() - interval '2 days 5 hours'),
  ('גופיית ריב צמודה ירוקה', 'גופייה ירוקה בד ריב צמוד. מידה M. צבע ירוק יער יפהפה, מצב מעולה.', 50, 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[14], 'active', NOW() - interval '2 days 11 hours'),
  ('גופיית אוברסייז אפורה', 'גופייה אוברסייז אפורה בגזרה חופשית. מידה L. לוק שיקי ונינוח.', 65, 'https://images.unsplash.com/photo-1503341504253-dff4f94032fc?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[16], 'active', NOW() - interval '3 days 3 hours'),
  ('גופייה פרחונית קיצית', 'גופייה עם הדפס פרחוני קיצי. מידה S. צבעונית ושמחה, מצב חדש.', 55, 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[18], 'active', NOW() - interval '3 days 9 hours'),
  ('גופייה ים בצבע טורקיז', 'גופייה בצבע טורקיז בהיר. מידה M. מושלמת לים ולקיץ, מצב מצוין.', 45, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[20], 'active', NOW() - interval '4 days 1 hour'),
  ('גופייה גב חשוף שחורה', 'גופייה שחורה עם גב חשוף. מידה S. מעוצבת ומיוחדת, נלבשה פעם.', 85, 'https://images.unsplash.com/photo-1503341504253-dff4f94032fc?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[1], 'active', NOW() - interval '4 days 7 hours'),
  ('גופיית קרופ סרוגה לבנה', 'גופיית קרופ סרוגה לבנה בוהו. מידה S. עבודה יפה, מצב מעולה.', 70, 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[3], 'active', NOW() - interval '4 days 12 hours'),
  ('גופיית ספורט Puma אדום', 'גופייה ספורטיבית פומה אדומה. מידה M. DryCell technology, מצב מצוין.', 75, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[5], 'active', NOW() - interval '5 days 4 hours'),
  ('גופייה מקרמה בז''', 'גופייה מקרמה בצבע בז''. מידה M. עבודת יד, סגנון בוהו שיק.', 95, 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[7], 'active', NOW() - interval '5 days 9 hours'),
  ('גופייה רצועות רחבות כחולה', 'גופייה עם רצועות רחבות בצבע כחול. מידה L. נוחה ליומיום, מצב טוב.', 50, 'https://images.unsplash.com/photo-1503341504253-dff4f94032fc?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[9], 'active', NOW() - interval '6 days 3 hours'),
  ('גופיית קרופ צבע לבנדר', 'גופיית קרופ בצבע לבנדר פסטלי. מידה XS. צבע מקסים, כמו חדשה.', 60, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80', cat_tops, user_ids[11], 'active', NOW() - interval '6 days 8 hours')
  ON CONFLICT DO NOTHING;

END;
$$;


-- =====================
-- VERIFICATION: Check the results
-- =====================
SELECT 'Users in auth.users:' AS info, COUNT(*) AS count FROM auth.users
UNION ALL
SELECT 'Users in public.users:', COUNT(*) FROM public.users
UNION ALL
SELECT 'Categories:', COUNT(*) FROM public.categories
UNION ALL
SELECT 'Active Products:', COUNT(*) FROM public.products WHERE status = 'active';
