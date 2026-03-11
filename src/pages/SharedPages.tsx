// Shared stub pages for secondary views across all roles
// These provide functional UI placeholder content with real component usage

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button, Avatar, Rating } from '../components/ui';
import { mockProfessionals, mockBookings, mockReviews, mockTransactions, serviceCategories, adminStats } from '../data/mockData';
import { Clock, Star, Scissors, Edit, Trash2, Plus, Image, Search, Filter, CheckCircle, XCircle, DollarSign, Activity, Home, MapPin } from 'lucide-react';

const pageStyle: React.CSSProperties = { padding: 'var(--space-4)', maxWidth: '960px', margin: '0 auto' };
const headerStyle: React.CSSProperties = { fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-5)' };
const listStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' };
const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-3)' };
const flexStyle: React.CSSProperties = { flex: 1 };
const subStyle: React.CSSProperties = { fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' };

/* ============== PROFESSIONAL PAGES ============== */

export function ProBookingRequests() {
  const requests = mockBookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Booking Requests</h1>
      <div style={listStyle}>
        {requests.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card variant="default" padding="md">
              <div style={rowStyle}>
                <Avatar src={b.professionalAvatar} name={b.professionalName} size="md" />
                <div style={flexStyle}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Client Request</p>
                  <p style={subStyle}>{b.service} • {b.date} at {b.time}</p>
                  <p style={subStyle}>{b.locationType === 'home' ? <><Home size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Home Service</> : <><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> At Studio</>} • ${b.price}</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Badge variant={b.status === 'confirmed' ? 'success' : 'warning'}>{b.status}</Badge>
                </div>
              </div>
              {b.status === 'pending' && (
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', justifyContent: 'flex-end' }}>
                  <Button size="sm">Accept</Button>
                  <Button size="sm" variant="danger">Decline</Button>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ProCalendar() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const hours = Array.from({ length: 10 }, (_, i) => `${9 + i}:00`);

  // Pre-compute random booking slots once, so they don't flicker on re-render
  const bookedSlots = useMemo(() =>
    hours.map(() => Math.random() > 0.6), [hours.length]
  );

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Calendar</h1>
      <Card variant="default" padding="md">
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', overflowX: 'auto' }}>
          {days.map((d, i) => (
            <div key={d} style={{ flex: 1, textAlign: 'center', minWidth: 80 }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' }}>{d}</p>
              <p style={{ fontWeight: 700 }}>{12 + i}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
          {hours.map((h, idx) => (
            <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--neutral-100)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', width: 50 }}>{h}</span>
              <div style={{ flex: 1, height: 36, background: bookedSlots[idx] ? 'var(--primary-50)' : 'transparent', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', paddingLeft: 'var(--space-2)' }}>
                {bookedSlots[idx] && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-600)', fontWeight: 600 }}>Booking</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function ProEarnings() {
  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Earnings</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        {[{ label: 'Today', val: '$145' }, { label: 'This Week', val: '$580' }, { label: 'This Month', val: '$2,340' }, { label: 'Total', val: '$12,340' }].map(s => (
          <Card key={s.label} variant="default" padding="md">
            <p style={subStyle}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{s.val}</p>
          </Card>
        ))}
      </div>
      <h2 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>Recent Earnings</h2>
      <div style={listStyle}>
        {mockTransactions.filter(t => t.type === 'payment').map(t => (
          <Card key={t.id} variant="default" padding="sm">
            <div style={rowStyle}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--success-50)', color: 'var(--success-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <DollarSign size={16} />
              </div>
              <div style={flexStyle}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{t.description}</p>
                <p style={subStyle}>{t.date}</p>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--success-500)' }}>+${t.amount}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ProServices() {
  const proServices = [
    { name: 'Basic Haircut', price: 25, duration: '30 min', active: true },
    { name: 'Haircut & Styling', price: 35, duration: '45 min', active: true },
    { name: 'Premium Full Service', price: 50, duration: '60 min', active: true },
    { name: 'Beard Trim', price: 15, duration: '15 min', active: false },
  ];
  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>My Services</h1>
        <Button size="sm" icon={<Plus size={16} />}>Add Service</Button>
      </div>
      <div style={listStyle}>
        {proServices.map((s, i) => (
          <motion.div key={s.name} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card variant="default" padding="md">
              <div style={rowStyle}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--primary-50)', color: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scissors size={18} />
                </div>
                <div style={flexStyle}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{s.name}</p>
                  <p style={subStyle}><Clock size={12} style={{ display: 'inline' }} /> {s.duration}</p>
                </div>
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--primary-600)' }}>${s.price}</span>
                <Badge variant={s.active ? 'success' : 'default'} size="sm">{s.active ? 'Active' : 'Inactive'}</Badge>
                <Button size="sm" variant="ghost" icon={<Edit size={14} />} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ProPortfolio() {
  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>Portfolio</h1>
        <Button size="sm" icon={<Plus size={16} />}>Upload</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
        {Array.from({ length: 9 }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            style={{
              aspectRatio: '1',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--neutral-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--neutral-300)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <Image size={28} />
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
              <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ProProfileEditor() {
  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Edit Profile</h1>
      <Card variant="default" padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {['Full Name', 'Bio', 'Phone', 'Email', 'Address', 'Service Radius (km)'].map(f => (
            <div key={f}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', marginBottom: 4, display: 'block' }}>{f}</label>
              {f === 'Bio' ? (
                <textarea rows={3} style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none', fontFamily: 'var(--font-body)', resize: 'vertical' }} />
              ) : (
                <input type="text" style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} />
              )}
            </div>
          ))}
          <Button>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}

export function ProReviews() {
  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Reviews</h1>
      <Card variant="glass" padding="md">
        <div style={{ marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-6)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 800 }}>4.9</p>
            <Rating value={4.9} size="md" />
            <p style={subStyle}>Based on 234 reviews</p>
          </div>
        </div>
      </Card>
      <div style={{ ...listStyle, marginTop: 'var(--space-4)' }}>
        {mockReviews.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card variant="default" padding="md">
              <div style={{ ...rowStyle, marginBottom: 'var(--space-2)' }}>
                <Avatar src={r.userAvatar} name={r.userName} size="sm" />
                <div style={flexStyle}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{r.userName}</p>
                  <p style={subStyle}>{r.date}</p>
                </div>
                <Rating value={r.rating} size="sm" />
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', lineHeight: 'var(--leading-relaxed)' }}>{r.comment}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============== ADMIN PAGES ============== */

export function AdminUsers() {
  // Stable random values for bookings count
  const userBookings = useMemo(() => [5, 12, 3, 18, 7], []);

  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>Users Management</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: 'var(--neutral-100)', borderRadius: 'var(--radius-full)' }}>
            <Search size={16} />
            <input placeholder="Search users..." style={{ border: 'none', background: 'none', outline: 'none', fontSize: 'var(--text-sm)' }} />
          </div>
          <Button size="sm" variant="secondary" icon={<Filter size={14} />}>Filter</Button>
        </div>
      </div>
      <Card variant="default" padding="none">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                {['User', 'Email', 'Bookings', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['Maria Garcia', 'Juan Perez', 'Laura Rodriguez', 'Camila Sanchez', 'Pedro Morales'].map((name, i) => (
                <tr key={name} style={{ borderBottom: '1px solid var(--neutral-50)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div style={rowStyle}><Avatar name={name} size="xs" /><span style={{ fontWeight: 500 }}>{name}</span></div>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--neutral-500)' }}>{name.toLowerCase().replace(' ', '.')}@email.com</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{userBookings[i]}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <Badge variant={i === 3 ? 'error' : 'success'} size="sm">{i === 3 ? 'Disabled' : 'Active'}</Badge>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <Button size="sm" variant="ghost">{i === 3 ? 'Enable' : 'Disable'}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function AdminProfessionals() {
  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Professionals Management</h1>
      <Card variant="default" padding="none">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                {['Professional', 'Services', 'Rating', 'Completed', 'Balance', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockProfessionals.map(pro => (
                <tr key={pro.id} style={{ borderBottom: '1px solid var(--neutral-50)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div style={rowStyle}><Avatar src={pro.avatar} name={pro.name} size="xs" /><span style={{ fontWeight: 500 }}>{pro.name}</span></div>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--neutral-500)' }}>{pro.services[0]}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Rating value={pro.rating} size="sm" showValue /></td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{pro.completedServices}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 700 }}>${pro.walletBalance}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <Badge variant={pro.verified ? 'success' : 'warning'} size="sm">{pro.verified ? 'Verified' : 'Pending'}</Badge>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Button size="sm" variant="ghost">View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function AdminServices() {
  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>Service Categories</h1>
        <Button size="sm" icon={<Plus size={16} />}>Add Category</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
        {serviceCategories.map((svc, i) => (
          <motion.div key={svc.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card variant="default" padding="md">
              <div style={rowStyle}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--primary-50)', color: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scissors size={20} />
                </div>
                <div style={flexStyle}>
                  <p style={{ fontWeight: 600 }}>{svc.name}</p>
                  <p style={subStyle}>{svc.description}</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                  <Button size="sm" variant="ghost" icon={<Edit size={14} />} />
                  <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function AdminTransactions() {
  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Transactions</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <Card variant="default" padding="md">
          <p style={subStyle}>Total Revenue</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
            <DollarSign size={18} style={{ display: 'inline', verticalAlign: 'text-bottom' }} />{(adminStats.totalRevenue / 1000).toFixed(0)}K
          </p>
        </Card>
        <Card variant="default" padding="md">
          <p style={subStyle}>Commissions</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--success-500)' }}>
            +${(adminStats.commissionsCollected / 1000).toFixed(0)}K
          </p>
        </Card>
        <Card variant="default" padding="md">
          <p style={subStyle}>Avg Transaction</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>$47.50</p>
        </Card>
      </div>
      <Card variant="default" padding="none">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                {['ID', 'Description', 'Type', 'Amount', 'Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--neutral-50)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>{t.id}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{t.description}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <Badge variant={t.type === 'commission' ? 'accent' : t.type === 'recharge' ? 'primary' : 'default'} size="sm">{t.type}</Badge>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 700 }}>${t.amount}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--neutral-500)' }}>{t.date}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <Badge variant={t.status === 'completed' ? 'success' : 'warning'} size="sm">{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function AdminAnalytics() {
  const metrics = [
    { label: 'Avg. Rating', value: adminStats.avgRating.toFixed(2), icon: <Star size={18} />, color: '#fbbf24' },
    { label: 'Growth Rate', value: `${adminStats.monthlyGrowth}%`, icon: <Activity size={18} />, color: 'var(--success-500)' },
    { label: 'Booking Rate', value: '87%', icon: <CheckCircle size={18} />, color: 'var(--primary-500)' },
    { label: 'Cancel Rate', value: '3.2%', icon: <XCircle size={18} />, color: 'var(--error-500)' },
  ];

  // Pre-compute bar heights once so they don't change on re-render
  const barHeights = useMemo(() =>
    Array.from({ length: 30 }, () => 20 + Math.random() * 80), []
  );

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Platform Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card variant="default" padding="md">
              <div style={rowStyle}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: `${m.color}15`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m.icon}</div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800 }}>{m.value}</p>
                  <p style={subStyle}>{m.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      <Card variant="default" padding="lg">
        <h2 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>Bookings Over Time</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-1)', height: 180 }}>
          {barHeights.map((h, i) => (
            <motion.div
              key={i}
              style={{ flex: 1, borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', background: 'linear-gradient(to top, var(--primary-500), var(--primary-300))' }}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 0.2 + i * 0.02, duration: 0.4 }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' }}>
          <span>30 days ago</span><span>Today</span>
        </div>
      </Card>
    </div>
  );
}

export function AdminSettings() {
  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Settings</h1>
      <Card variant="default" padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[
            { label: 'Platform Name', defaultVal: 'JustMe' },
            { label: 'Commission Rate (%)', defaultVal: '9' },
            { label: 'Support Email', defaultVal: 'support@justme.com' },
            { label: 'Max Search Radius (km)', defaultVal: '5' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', marginBottom: 4, display: 'block' }}>{f.label}</label>
              <input
                type="text"
                defaultValue={f.defaultVal}
                style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }}
              />
            </div>
          ))}
          <Button>Save Settings</Button>
        </div>
      </Card>
    </div>
  );
}

// User favorites
export function UserFavorites() {
  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Favorites</h1>
      <div style={listStyle}>
        {mockProfessionals.slice(0, 4).map((pro, i) => (
          <motion.div key={pro.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card variant="default" padding="md" hover>
              <div style={rowStyle}>
                <Avatar src={pro.avatar} name={pro.name} size="md" />
                <div style={flexStyle}>
                  <p style={{ fontWeight: 600 }}>{pro.name}</p>
                  <p style={subStyle}>{pro.services.join(', ')}</p>
                  <Rating value={pro.rating} size="sm" showValue count={pro.reviewCount} />
                </div>
                <Button size="sm" variant="accent">Book</Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function UserPayments() {
  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Payment History</h1>
      <div style={listStyle}>
        {mockTransactions.filter(t => t.type === 'payment').map(t => (
          <Card key={t.id} variant="default" padding="sm">
            <div style={rowStyle}>
              <div style={flexStyle}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{t.description}</p>
                <p style={subStyle}>{t.date}</p>
              </div>
              <span style={{ fontWeight: 700 }}>-${t.amount}</span>
              <Badge variant={t.status === 'completed' ? 'success' : 'warning'} size="sm">{t.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
