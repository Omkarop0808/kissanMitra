-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    farm_name TEXT,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    daily_rate NUMERIC NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    rating NUMERIC DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    owner TEXT NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Waste Listings Table
CREATE TABLE IF NOT EXISTS waste_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waste_type TEXT NOT NULL,
    waste_type_label TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    location TEXT NOT NULL,
    pickup_date TEXT,
    status TEXT DEFAULT 'pending',
    price NUMERIC NOT NULL,
    seller TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    equipment_name TEXT NOT NULL,
    equipment_owner TEXT NOT NULL,
    renter_name TEXT NOT NULL,
    renter_phone TEXT,
    start_date TEXT,
    end_date TEXT,
    daily_rate NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_details TEXT,
    total_cost NUMERIC,
    days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    author TEXT NOT NULL,
    type TEXT DEFAULT 'post',
    lat NUMERIC,
    lng NUMERIC,
    district TEXT,
    answers JSONB DEFAULT '[]'::jsonb,
    "bestAnswerId" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
