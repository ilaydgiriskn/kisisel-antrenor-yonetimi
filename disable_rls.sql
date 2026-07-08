-- Tüm tablolardaki Row Level Security (RLS) kısıtlamalarını devre dışı bırakır.
-- Geliştirme aşamasında verilerin engellenmesini önler.

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE measurements DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_invites DISABLE ROW LEVEL SECURITY;
