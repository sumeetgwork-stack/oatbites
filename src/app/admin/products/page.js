'use client';

import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock: 100 });

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push('/');
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(console.error);
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: '', description: '', price: '', category: '', stock: 100 });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, stock: p.stock });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    
    if (editProduct) {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editProduct.id, ...payload }),
      });
    } else {
      await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setShowModal(false);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchProducts();
  };

  if (isLoading || !isAdmin) return null;

  return (
    <div className="page-container admin-page">
      <div className="admin-header">
        <div>
          <Link href="/admin" className="back-link">← Back to Dashboard</Link>
          <h1>Manage Products</h1>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="admin-table-container glass-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                <td>{p.category}</td>
                <td>{p.stock}</td>
                <td>₹{p.price.toLocaleString('en-IN')}</td>
                <td>
                  <button className="action-btn edit" onClick={() => openEdit(p)}>Edit</button>
                  <button className="action-btn delete" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass-panel" onClick={e => e.stopPropagation()}>
            <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>
                Product Name
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </label>
              <label>
                Description
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={3} />
              </label>
              <div className="form-row">
                <label>
                  Price (₹)
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                </label>
                <label>
                  Category
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                    <option value="">Select</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </label>
              </div>
              <label>
                Stock
                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required min="0" />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editProduct ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
