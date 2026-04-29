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
    <div className="page-container admin-page">
      <div className="admin-header">
        <div>
          <Link href="/admin" className="back-link">← Back to Dashboard</Link>
          <h1>Registered Users</h1>
        </div>
      </div>

      <div className="admin-table-container glass-panel">
        {loadingUsers ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined On</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
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
    </div>
  );
}
