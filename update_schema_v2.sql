-- Eğitmen Davetleri Tablosu
CREATE TABLE IF NOT EXISTS trainer_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invited_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE trainer_invites DISABLE ROW LEVEL SECURITY;
