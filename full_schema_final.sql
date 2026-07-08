-- Kişisel Antrenör Yönetim Platformu Veritabanı Şeması (Tüm tablolar tek dosyada)

CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'trainer', 'client')),
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS client_details (
    id UUID REFERENCES profiles(id) PRIMARY KEY,
    trainer_id UUID REFERENCES profiles(id), 
    phone TEXT,
    height NUMERIC,
    active_package_status TEXT DEFAULT 'active',
    trainer_notes TEXT,
    goal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES profiles(id),
    weight NUMERIC,
    body_fat_percentage NUMERIC,
    waist_circumference NUMERIC,
    measurement_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS workout_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES profiles(id),
    trainer_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    sets INTEGER,
    reps INTEGER,
    weight NUMERIC,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES profiles(id),
    trainer_id UUID REFERENCES profiles(id),
    amount NUMERIC NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS progress_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    upload_date DATE DEFAULT CURRENT_DATE,
    photo_type TEXT CHECK (photo_type IN ('front', 'back', 'side')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS client_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    goal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'role', 'client'), 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger zaten varsa hata vermemesi için önce siliyoruz
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
