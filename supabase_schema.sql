-- Kişisel Antrenör Yönetim Platformu Veritabanı Şeması

-- 1. Tabloların Oluşturulması

-- PROFILES: Kimlik doğrulama sonrasında kullanıcı rollerini ve temel bilgilerini tutar.
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'trainer', 'client')),
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- CLIENT_DETAILS: Danışanların ekstra bilgilerini tutar. 
-- (Boy, telefon, vb. Bu tablo 'profiles' tablosundaki 'client' rolündeki kullanıcılara bağlanır)
CREATE TABLE client_details (
    id UUID REFERENCES profiles(id) PRIMARY KEY,
    trainer_id UUID REFERENCES profiles(id), -- Hangi eğitmene ait olduğu
    phone TEXT,
    height NUMERIC,
    active_package_status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- MEASUREMENTS: Danışanların ölçüm takibi
CREATE TABLE measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES profiles(id),
    weight NUMERIC,
    body_fat_percentage NUMERIC,
    waist_circumference NUMERIC,
    measurement_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- WORKOUT_PROGRAMS: Antrenman Programları Başlıkları
CREATE TABLE workout_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES profiles(id),
    trainer_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- WORKOUT_EXERCISES: Antrenman içerisindeki hareketler
CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    sets INTEGER,
    reps INTEGER,
    weight NUMERIC,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- PAYMENTS: Ödeme kayıtları
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES profiles(id),
    trainer_id UUID REFERENCES profiles(id),
    amount NUMERIC NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Güvenlik ve RLS (Row Level Security) Politikaları
-- İleride Supabase RLS aktif edildiğinde kullanılacak kurallar.
-- Şimdilik MVP aşamasında basit tutulmuştur.

-- 3. Trigger'lar: Yeni bir kullanıcı auth.users tablosuna eklendiğinde otomatik 'profiles' tablosuna ekler.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Yeni kullanıcının rolünü belirle. Eğer kullanıcı meta verisinde rol yoksa varsayılan olarak 'client' yap.
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Not: İlk 'admin' eğitmeni sisteme kaydolduğunda profiles tablosundaki rolünü 
-- manuel olarak Supabase arayüzünden 'admin' veya 'trainer' olarak güncellemeniz gerekmektedir.
