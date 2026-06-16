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
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
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

CREATE POLICY "Users can insert their own profile" ON public.users 
    FOR INSERT WITH CHECK (auth.uid() = id);

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

CREATE POLICY "Admins can view all products" ON public.products 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.is_admin = true
        )
    );

CREATE POLICY "Authenticated users can create products" ON public.products 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Sellers can update their own products" ON public.products 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Buyers can update product to buy (checkout)" ON public.products 
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update all products" ON public.products 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.is_admin = true
        )
    );

CREATE POLICY "Sellers can delete their own products" ON public.products 
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete all products" ON public.products 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.is_admin = true
        )
    );




-- 4. Automatically Sync Auth Users to Public Users Table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, avatar_url, is_admin)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'משתמש/ת חדש/ה'),
    COALESCE(new.raw_user_meta_data->>'phone', 'לא זמין'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    (new.email = 'admin@secondwear.co.il')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
      phone = COALESCE(EXCLUDED.phone, public.users.phone),
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
      is_admin = COALESCE(EXCLUDED.is_admin, public.users.is_admin);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
