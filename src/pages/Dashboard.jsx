import React, { useState, useEffect } from 'react';
import { Users, Activity, Calendar, CreditCard, Clock, Bell, LogOut, ChevronRight, X, Edit2, Plus, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  
  const [clients, setClients] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteGoal, setInviteGoal] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editGoal, setEditGoal] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    setUser(session.user);

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    setProfile(prof);

    if (prof) {
      // Danışanları getir
      const { data: clientData } = await supabase
        .from('client_details')
        .select(`
          id,
          trainer_id,
          goal,
          active_package_status,
          trainer_notes,
          profiles (first_name, last_name)
        `)
        .eq('trainer_id', session.user.id);
      
      if (clientData) setClients(clientData);

      // Bekleyen davetleri getir
      const { data: inviteData } = await supabase
        .from('client_invites')
        .select('*')
        .eq('trainer_id', session.user.id);

      if (inviteData) setInvites(inviteData);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    const { error } = await supabase.from('client_invites').insert({
      trainer_id: user.id,
      email: inviteEmail,
      goal: inviteGoal
    });
    setInviteLoading(false);
    
    if (error) {
      alert('Davet gönderilirken hata oluştu: ' + error.message);
    } else {
      setShowAddModal(false);
      setInviteEmail('');
      setInviteGoal('');
      fetchData(); // Listeyi yenile
    }
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setEditGoal(client.goal || '');
    setEditNotes(client.trainer_notes || '');
    setEditStatus(client.active_package_status || 'active');
    setShowEditModal(true);
  };

  const handleEditClient = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    const { error } = await supabase.from('client_details').update({
      goal: editGoal,
      trainer_notes: editNotes,
      active_package_status: editStatus
    }).eq('id', selectedClient.id);
    
    setEditLoading(false);
    
    if (error) {
      alert('Güncelleme başarısız: ' + error.message);
    } else {
      setShowEditModal(false);
      fetchData(); // Listeyi yenile
    }
  };

  const statCards = [
    { title: 'Toplam Danışan', value: (clients.length + invites.length).toString(), icon: Users, color: '#3182CE' },
    { title: 'Aktif Danışan', value: clients.filter(c => c.active_package_status === 'active').length.toString(), icon: Activity, color: '#10B981' },
    { title: 'Bekleyen Davet', value: invites.length.toString(), icon: Mail, color: '#8B5CF6' }
  ];

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
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>Genel Bakış</div>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#fff', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', marginBottom: '4px' }}>
              <Activity size={20} className="text-accent" /> Panel
            </a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: 'var(--radius-sm)', transition: 'var(--transition-smooth)' }}>
              <Users size={20} /> Danışanlar
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
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <header style={{ height: '80px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Antrenör Paneli</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), #10B981)' }}></div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{profile ? `${profile.first_name} ${profile.last_name}` : 'Yükleniyor...'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Antrenör</div>
              </div>
            </div>
          </div>
        </header>

        <div style={{ padding: '40px', overflowY: 'auto', flex: 1 }} className="animate-fade-up">
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Tekrar Hoş Geldin! 👋</h2>
            <p style={{ color: 'var(--text-secondary)' }}>İşte bugün danışanlarınla ilgili olan bitenler.</p>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Veriler yükleniyor...</div>
          ) : (
            <>
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                {statCards.map((stat, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{stat.title}</div>
                      <div style={{ background: `${stat.color}20`, color: stat.color, padding: '8px', borderRadius: '8px' }}>
                        <stat.icon size={20} />
                      </div>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Lists */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '32px' }}>
                  <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>Danışan Listesi</h3>
                    <button onClick={() => setShowAddModal(true)} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Plus size={16} /> Yeni Ekle
                    </button>
                  </div>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '16px 0', fontWeight: '500' }}>Ad Soyad / E-posta</th>
                        <th style={{ padding: '16px 0', fontWeight: '500' }}>Hedef</th>
                        <th style={{ padding: '16px 0', fontWeight: '500' }}>Durum</th>
                        <th style={{ padding: '16px 0', fontWeight: '500' }}>İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Aktif Danışanlar */}
                      {clients.map((client, idx) => (
                        <tr key={client.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                          <td style={{ padding: '16px 0', fontWeight: '500' }}>
                            {client.profiles?.first_name} {client.profiles?.last_name}
                          </td>
                          <td style={{ padding: '16px 0', color: 'var(--text-secondary)' }}>{client.goal || '-'}</td>
                          <td style={{ padding: '16px 0' }}>
                            <span style={{ 
                              padding: '4px 12px', 
                              borderRadius: 'var(--radius-pill)', 
                              fontSize: '0.8rem', 
                              background: client.active_package_status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: client.active_package_status === 'active' ? 'var(--success)' : 'var(--danger)'
                            }}>
                              {client.active_package_status === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 0' }}>
                            <button onClick={() => openEditModal(client)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Edit2 size={16} /> Düzenle
                            </button>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Bekleyen Davetler */}
                      {invites.map((invite, idx) => (
                        <tr key={invite.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                          <td style={{ padding: '16px 0', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail size={16} /> {invite.email}
                          </td>
                          <td style={{ padding: '16px 0', color: 'var(--text-secondary)' }}>{invite.goal || '-'}</td>
                          <td style={{ padding: '16px 0' }}>
                            <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                              Kayıt Bekliyor
                            </span>
                          </td>
                          <td style={{ padding: '16px 0' }}>-</td>
                        </tr>
                      ))}
                      
                      {clients.length === 0 && invites.length === 0 && (
                         <tr><td colSpan="4" style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Listeniz şu an boş.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="glass-panel" style={{ padding: '32px' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Hızlı İşlemler</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button onClick={() => setShowAddModal(true)} style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Users size={20} className="text-accent" /> Danışan Ekle (Davet)</div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal: Add Client */}
        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
            <div className="glass-panel" style={{ width: '400px', padding: '32px', position: 'relative' }}>
              <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Danışan Davet Et</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                Danışanınızın e-posta adresini girin. Kayıt olduklarında otomatik olarak listenize eklenecektir.
              </p>
              <form onSubmit={handleAddClient}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="input-label">E-posta Adresi</label>
                  <input type="email" className="input-field" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label className="input-label">Hedef (Opsiyonel)</label>
                  <input type="text" className="input-field" placeholder="Örn: Kilo Verme, Hacim" value={inviteGoal} onChange={e => setInviteGoal(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={inviteLoading}>
                  {inviteLoading ? 'Gönderiliyor...' : 'Davet Gönder'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Client */}
        {showEditModal && selectedClient && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
            <div className="glass-panel" style={{ width: '500px', padding: '32px', position: 'relative' }}>
              <button onClick={() => setShowEditModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>
                Danışan Düzenle: {selectedClient.profiles?.first_name} {selectedClient.profiles?.last_name}
              </h3>
              <form onSubmit={handleEditClient}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="input-label">Durum</label>
                  <select className="input-field" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                    <option value="active">Aktif</option>
                    <option value="passive">Pasif</option>
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label className="input-label">Hedef</label>
                  <input type="text" className="input-field" value={editGoal} onChange={e => setEditGoal(e.target.value)} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label className="input-label">Antrenör Notları</label>
                  <textarea className="input-field" style={{ minHeight: '100px', resize: 'vertical' }} value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Danışanla ilgili özel notlarınızı buraya girebilirsiniz..."></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={editLoading}>
                  {editLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
