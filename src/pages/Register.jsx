import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, ArrowRight, User, Lock, Mail } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Eğitmen daveti var mı kontrol et
    const { data: trainerInvite } = await supabase
      .from('trainer_invites')
      .select('*')
      .eq('email', email)
      .single();

    const assignedRole = trainerInvite ? 'trainer' : 'client';

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: assignedRole
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    if (authData?.user) {
      // Eğitmen eklendiyse daveti sil
      if (trainerInvite) {
        await supabase.from('trainer_invites').delete().eq('id', trainerInvite.id);
      }

      // Davet tablosunda bu email var mı kontrol et (Danışan için)
      const { data: invite } = await supabase
        .from('client_invites')
        .select('*')
        .eq('email', email)
        .single();

      // client_details tablosuna kayıt at (eğer invite varsa eğitmen ID ile birlikte)
      await supabase.from('client_details').insert({
        id: authData.user.id,
        trainer_id: invite ? invite.trainer_id : null,
        goal: invite ? invite.goal : null,
      });

      if (invite) {
        // Daveti sil
        await supabase.from('client_invites').delete().eq('id', invite.id);
      }
    }

    setLoading(false);
    navigate('/login');
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
            Antrenmanlara <br />
            <span className="text-gradient">Hemen Başlayın</span>
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
            Kişisel antrenörünüzün hazırlayacağı programları takip etmek ve gelişiminizi izlemek için hesabınızı oluşturun.
          </p>
        </div>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'var(--accent-primary)', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'var(--success)', filter: 'blur(200px)', opacity: 0.05, borderRadius: '50%' }}></div>
      </div>

      {/* Right Register Panel */}
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
            <h3 style={{ fontSize: '2rem', marginBottom: '8px' }}>Danışan Hesabı Oluştur</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Profesyonel platformumuza katılın</p>
          </div>

          <form onSubmit={handleRegister}>
            {errorMsg && <div style={{ background: 'var(--danger)', color: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{errorMsg}</div>}
            
            <div className="input-group">
              <label className="input-label">Ad Soyad</label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="input-field" placeholder="Adınız Soyadınız" style={{ paddingLeft: '48px' }} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">E-posta Adresi</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" className="input-field" placeholder="ornek@email.com" style={{ paddingLeft: '48px' }} value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label">Şifre</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="password" className="input-field" placeholder="••••••••" style={{ paddingLeft: '48px' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Ücretsiz Kayıt Ol'} <ArrowRight size={20} />
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Zaten hesabınız var mı? <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: '600', textDecoration: 'none' }}>Giriş Yap</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
