import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, ArrowRight, User, Lock } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setErrorMsg('Giriş başarısız: ' + authError.message);
      setLoading(false);
      return;
    }

    if (authData?.user) {
      // Rolü profiles tablosundan çek
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        // Eğer profil henüz oluşmadıysa veya bulunamadıysa (ilk kurulumlarda vs)
        console.error("Profile fetch error:", profileError);
        alert("Profil bilgisi alınamadı! Hata: " + (profileError?.message || "Profil bulunamadı"));
        navigate('/client-dashboard'); 
      } else {
        if (profile.role === 'admin' || profile.role === 'trainer') {
          navigate('/dashboard');
        } else {
          navigate('/client-dashboard');
        }
      }
    }
    
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Branding Panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 2, maxWidth: '500px' }} className="animate-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{ background: 'var(--accent-primary)', padding: '12px', borderRadius: '12px', color: '#000' }}>
              <Dumbbell size={32} />
            </div>
            <h1 style={{ fontSize: '2.5rem', color: '#fff' }}>FitTrack<span className="text-accent">.</span></h1>
          </div>
          <h2 style={{ fontSize: '3.5rem', marginBottom: '24px', lineHeight: '1.1' }}>
            Antrenörlük İşinizi <br />
            <span className="text-gradient">Zirveye Taşıyın</span>
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
            Kişisel antrenörler ve danışanlarının birlikte ilerlemeyi takip etmesi, antrenmanları yönetmesi ve hedeflere ulaşması için mükemmel platform.
          </p>
        </div>
        {/* Abstract shapes for premium feel */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'var(--accent-primary)', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', background: 'var(--success)', filter: 'blur(200px)', opacity: 0.05, borderRadius: '50%' }}></div>
      </div>

      {/* Right Login Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: 'var(--bg-primary)'
      }}>
        <div className="glass-panel animate-fade-up" style={{ width: '100%', maxWidth: '440px', padding: '48px', animationDelay: '0.2s' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '8px' }}>Hoş Geldiniz</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Hesabınıza erişmek için giriş yapın</p>
          </div>



          <form onSubmit={handleLogin}>
            {errorMsg && <div style={{ background: 'var(--danger)', color: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{errorMsg}</div>}
            
            <div className="input-group">
              <label className="input-label">E-posta Adresi</label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="ornek@email.com" 
                  style={{ paddingLeft: '48px' }} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label">Şifre</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="••••••••" 
                  style={{ paddingLeft: '48px' }} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
              <a href="#" style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', textDecoration: 'none' }}>Şifremi unuttum</a>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'} <ArrowRight size={20} />
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Hesabınız yok mu? <Link to="/register" style={{ color: 'var(--text-primary)', fontWeight: '600', textDecoration: 'none' }}>Kayıt Ol</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
