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
('גופיות', 'Sparkles');
