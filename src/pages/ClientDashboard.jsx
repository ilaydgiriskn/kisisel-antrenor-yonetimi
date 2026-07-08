import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Activity, LogOut } from 'lucide-react';

export default function ClientDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '32px 24px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            FitTrack<span className="text-accent">.</span>
          </h2>
        </div>
        
        <nav style={{ flex: 1, padding: '0 16px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>Danışan Menüsü</div>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#fff', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', marginBottom: '4px' }}>
              <Activity size={20} className="text-accent" /> Panelim
            </a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: 'var(--radius-sm)', transition: 'var(--transition-smooth)' }}>
              <Calendar size={20} /> Antrenman Programım
            </a>
          </div>
        </nav>

        <div style={{ padding: '24px' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'color 0.3s' }}>
            <LogOut size={20} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: '80px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Danışan Paneli</h1>
        </header>

        <div style={{ padding: '40px', overflowY: 'auto', flex: 1 }} className="animate-fade-up">
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Hoş Geldin! 👋</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Eğitmeninin sana özel hazırladığı programları buradan takip edebilirsin.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Henüz sana atanmış bir antrenman programı bulunmuyor. Eğitmenin bir program oluşturduğunda burada görebileceksin.
          </div>
        </div>
      </main>
    </div>
  );
}
