-- Danışan detayları tablosuna antrenör notları ve hedef eklentisi
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS trainer_notes TEXT;
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS goal TEXT;

-- İlerleme Fotoğrafları Tablosu
CREATE TABLE IF NOT EXISTS progress_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    upload_date DATE DEFAULT CURRENT_DATE,
    photo_type TEXT CHECK (photo_type IN ('front', 'back', 'side')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Davetler Tablosu (Antrenörlerin danışan eklemesi için)
CREATE TABLE IF NOT EXISTS client_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    goal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
