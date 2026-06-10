-- Database Schema for SecondWear (PostgreSQL / Supabase)

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL, -- Required for checkout (peer-to-peer payment)
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Categories Table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon_url TEXT, -- Icon name or URL (e.g. from Lucide icons)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Seller
    buyer_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Buyer (filled when purchased)
    status TEXT NOT NULL DEFAULT 'pending_fee_approval' 
        CONSTRAINT status_check CHECK (status IN ('pending_fee_approval', 'active', 'pending_payment_approval', 'sold')),
    fee_proof_url TEXT, -- Screenshot of publication fee (10 ILS)
    payment_proof_url TEXT, -- Screenshot of p2p payment
    payment_method TEXT, -- 'bit' or 'paybox'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create basic RLS Policies

-- Users policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.users 
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.users 
    FOR UPDATE USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories 
    FOR SELECT USING (true);

-- Products policies
CREATE POLICY "Active products are viewable by everyone" ON public.products 
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view all their listings" ON public.products 
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = buyer_id);

CREATE POLICY "Authenticated users can create products" ON public.products 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Sellers can update their own products" ON public.products 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Buyers can update product to buy (checkout)" ON public.products 
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Seed Categories
INSERT INTO public.categories (name, icon_url) VALUES
('נעליים', 'Footprints'),
('ג\'ינס', 'Layers'),
('מכנסיים', 'Wind'),
('חולצה', 'Shirt'),
('גופיות', 'Sparkles')
ON CONFLICT (name) DO NOTHING;

-- Seed a system mock user (as the seller for mock products)
INSERT INTO public.users (id, email, full_name, phone, avatar_url) VALUES
('00000000-0000-0000-0000-000000000000', 'seller@secondwear.co.il', 'מוכר מערכת', '050-0000000', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- Seed 20 Mock Products matching categories (with correct title, categories, and varied images)
INSERT INTO public.products (id, title, description, price, image_url, category_id, user_id, status) VALUES
-- Row 1
('00000000-0000-0000-0000-000000000001', 'סניקרס אדידס סטן סמית''', 'נעלי Adidas Stan Smith לבנות קלאסיות. מידה 42. ננעלו פעמים בודדות בלבד ובמצב מעולה.', 220.00, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'נעליים'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000002', 'ג''ינס Levi''s 501 קלאסי', 'ג''ינס ליוויס מקורי בגזרה ישרה קלאסית. צבע כחול בינוני, במצב מעולה. מידה 32.', 190.00, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'ג''ינס'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000003', 'חולצה מכופתרת פסים כחול-לבן', 'חולצה מכופתרת מכותנה דקה עם פסי תכלת ולבן עדינים, גזרה קלאסית. מידה L.', 115.00, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'חולצה'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000004', 'מכנסי מחוייט אלגנטי זארה', 'מכנסיים מחויטים בצבע בז'' חול של Zara. מתאימים לעבודה או לאירוע ערב. מידה S.', 120.00, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'מכנסיים'), '00000000-0000-0000-0000-000000000000', 'active'),

-- Row 2
('00000000-0000-0000-0000-000000000005', 'גופיית ריב לבנה בייסיק', 'גופיית בייסיק מבד ריב נמתח בצבע לבן. מחמיאה ומתאימה לכל לוק קיצי. מידה S.', 45.00, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'גופיות'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000006', 'מגפי עור שחורים Zara', 'מגפי עור אלגנטיים של זארה בצבע שחור, נוחים ומתאימים לחורף. מידה 38.', 180.00, 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'נעליים'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000007', 'ג''ינס סקיני שחור משופשף', 'ג''ינס סקיני צמוד בצבע שחור פחם משופשף מבית Zara. נלבש פעמים בודדות. מידה 36.', 100.00, 'https://images.unsplash.com/photo-1582552938357-32b906df40cd?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'ג''ינס'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000008', 'טי-שירט לבנה מכותנה אורגנית', 'חולצת בייסיק טי-שירט חלקה בצבע לבן בוהק, בד נעים ואיכותי מאוד. מידה M.', 60.00, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'חולצה'), '00000000-0000-0000-0000-000000000000', 'active'),

-- Row 3
('00000000-0000-0000-0000-000000000009', 'מכנסי קרגו זית טרנדיים', 'מכנסי קרגו (דגמ"ח) אופנתיים עם כיסים בצדדים בצבע ירוק זית. מידה M.', 135.00, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'מכנסיים'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000010', 'גופיית סאטן שחורה אלגנטית', 'גופיית סאטן נשפכת עם כתפיות דקות בצבע שחור עמוק, מתאימה במיוחד ליציאות. מידה M.', 75.00, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'גופיות'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000011', 'סניקרס נייק אייר פורס 1', 'Nike Air Force 1 לבנות קלאסיות. במצב מעולה, עברו ניקוי יסודי. מידה 44.', 300.00, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'נעליים'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000012', 'ג''ינס וינטג'' רחב Wide Leg', 'ג''ינס רחב ואופנתי בסגנון רטרו שנות ה-90. צבע כחול בהיר, נוח במיוחד. מידה 38.', 140.00, 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'ג''ינס'), '00000000-0000-0000-0000-000000000000', 'active'),

-- Row 4
('00000000-0000-0000-0000-000000000013', 'חולצת פלנל משבצות אופנתית', 'חולצה מכופתרת מבד פלנל חם ונעים עם משבצות באדום ושחור. מידה L.', 95.00, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'חולצה'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000014', 'מכנסי פשתן קיציים לבנים', 'מכנסיים מ-100% פשתן איכותי וקליל בצבע לבן. מעולים לחוף הים או לקיץ. מידה L.', 110.00, 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'מכנסיים'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000015', 'גופיית ספורט Nike דריי-פיט', 'גופיית ספורט מנדפת זיעה של נייקי בצבע ורוד עתיק. נוחה לפעילות גופנית. מידה S.', 90.00, 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'גופיות'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000016', 'סנדלי עור חומות בעיצוב אישי', 'סנדלי עור שטוחות ונוחות במיוחד מעור איכותי, מתאימות לקיץ הישראלי. מידה 39.', 130.00, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'נעליים'), '00000000-0000-0000-0000-000000000000', 'active'),

-- Row 5
('00000000-0000-0000-0000-000000000017', 'ג''ינס קרוע אופנתי Pull&Bear', 'ג''ינס עם קרעים מעוצבים בגזרת Mom fit מבית Pull&Bear. נראה מעולה. מידה 34.', 95.00, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'ג''ינס'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000018', 'חולצה מכופתרת פשתן שחורה', 'חולצת פשתן קלילה ואוורירית בצבע שחור, מושלמת ללוק יומיומי משודרג. מידה M.', 130.00, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'חולצה'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000019', 'מכנסי טרנינג אפורים נוחים', 'מכנסי ספורט/פנאי מכותנה עבה ומחממת בצבע אפור מלאנז''. מידה XL.', 80.00, 'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'מכנסיים'), '00000000-0000-0000-0000-000000000000', 'active'),
('00000000-0000-0000-0000-000000000020', 'גופיית קרופ בצבע שמנת', 'גופיית קרופ קצרה וקלילה עם עיטור מיוחד בצבע שמנת חם. מידה XS.', 50.00, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80', (SELECT id FROM public.categories WHERE name = 'גופיות'), '00000000-0000-0000-0000-000000000000', 'active')
ON CONFLICT (id) DO NOTHING;

