'use client';

import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminUsersPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push('/');
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/users')
        .then(res => res.json())
        .then(data => {
          setUsers(data.users || []);
          setLoadingUsers(false);
        })
        .catch(console.error);
    }
  }, [isAdmin]);

  if (isLoading || !isAdmin) return null;

  return (
    <main className="main-wrapper">
      <div className="content-layer">
        <div className="page-container admin-page" style={{ paddingTop: '2rem' }}>
          <div className="admin-header">
            <div>
              <Link href="/admin" className="back-link">← Back to Dashboard</Link>
              <h1 style={{ fontSize: '1.5rem' }}>Registered Users</h1>
            </div>
          </div>

          <div className="admin-table-container glass-panel" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {loadingUsers ? (
              <p style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</p>
            ) : (
              <table className="admin-table" style={{ width: '100%' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                  <tr>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined On</th>
                  </tr>
                </thead>
                <tbody>
                  {[...users].sort((a, b) => (a.role === 'admin' ? -1 : (b.role === 'admin' ? 1 : 0))).map(u => (
                    <tr key={u.id} onClick={() => setSelectedUser(u)} style={{ cursor: 'pointer' }} className="user-row-hover">
                      <td>
                        {u.image ? (
                          <img src={u.image} alt={u.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} referrerPolicy="no-referrer" />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {u.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </td>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'user'}`} style={{ margin: 0 }}>
                          {u.role === 'admin' ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {selectedUser && (
            <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ margin: 0 }}>User Information</h2>
                  <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '2rem' }}>
                  {selectedUser.image ? (
                    <img src={selectedUser.image} alt={selectedUser.name} style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                      {selectedUser.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.5rem' }}>{selectedUser.name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{selectedUser.email}</p>
                    <span className={`role-badge ${selectedUser.role === 'admin' ? 'admin' : 'user'}`} style={{ marginTop: '10px', display: 'inline-block' }}>
                      {selectedUser.role === 'admin' ? '👑 Admin' : '🛍️ Customer'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="glass-panel" style={{ padding: '15px', border: '1px solid #eee' }}>
                    <p style={{ fontSize: '0.8rem', color: '#878787', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Phone Number</p>
                    <p style={{ margin: 0, fontWeight: '500' }}>{selectedUser.phone || 'Not Provided'}</p>
                  </div>
                  <div className="glass-panel" style={{ padding: '15px', border: '1px solid #eee' }}>
                    <p style={{ fontSize: '0.8rem', color: '#878787', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Gender</p>
                    <p style={{ margin: 0, fontWeight: '500' }}>{selectedUser.gender || 'Not Specified'}</p>
                  </div>
                  <div className="glass-panel" style={{ padding: '15px', border: '1px solid #eee' }}>
                    <p style={{ fontSize: '0.8rem', color: '#878787', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Joined On</p>
                    <p style={{ margin: 0, fontWeight: '500' }}>{new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="glass-panel" style={{ padding: '15px', border: '1px solid #eee' }}>
                    <p style={{ fontSize: '0.8rem', color: '#878787', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Addresses Saved</p>
                    <p style={{ margin: 0, fontWeight: '500' }}>{selectedUser.addresses?.length || 0}</p>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '15px', border: '1px solid #eee' }}>
                  <p style={{ fontSize: '0.8rem', color: '#878787', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Saved Addresses</p>
                  {selectedUser.addresses?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                      {selectedUser.addresses.map((addr, idx) => (
                        <div key={idx} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', background: '#e0e0e0', padding: '2px 6px', borderRadius: '2px', fontWeight: 'bold', color: '#555' }}>{addr.type}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '13px' }}><strong>{addr.name}</strong> ({addr.phone})</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>{addr.address}, {addr.locality}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontWeight: '500' }}>{selectedUser.address || 'No addresses saved'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
