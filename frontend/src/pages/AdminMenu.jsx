import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-toastify';
import '../../src/assets/styles/AdminMenu.css';
import Header from '../components/Header';
import { API_URL } from '../apiConfig';

export default function AdminMenu() {
  const [menu, setMenu] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
    isNew: false,
    isPromo: false,
    category: ''
  });
  const [editingItemId, setEditingItemId] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/menu`)
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch((err) => console.error('❌ Eroare la preluare meniu:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'checkbox') {
      setNewMenuItem({ ...newMenuItem, [name]: checked });
    } else if (name === 'image') {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        setNewMenuItem({ ...newMenuItem, image: file });
      } else {
        alert('❌ Fișierul selectat nu este o imagine validă.');
        setNewMenuItem({ ...newMenuItem, image: null });
      }
    } else {
      setNewMenuItem({ ...newMenuItem, [name]: value });
    }
  };

  const handleAddOrEdit = async (e) => {
  e.preventDefault();

  // ✅ Verificare dimensiune imagine (maxim 5MB)
  if (newMenuItem.image && newMenuItem.image.size > 5 * 1024 * 1024) {
    toast.error('❌ Imaginea este prea mare. Maxim 5MB.');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('❌ Token lipsă. Autentifică-te ca admin.');
    return;
  }

  const formData = new FormData();
  formData.append('name', newMenuItem.name);
  formData.append('description', newMenuItem.description);
  formData.append('price', Number(newMenuItem.price));
  formData.append('isNew', newMenuItem.isNew);
  formData.append('isPromo', newMenuItem.isPromo);
  formData.append('category', newMenuItem.category);

  if (newMenuItem.image instanceof File) {
    formData.append('image', newMenuItem.image);
  } else {
    const oldItem = menu.find((i) => i.id === editingItemId);
    if (oldItem?.image) {
      formData.append('image', oldItem.image);
    }
  }

  const url = editingItemId
    ? `${API_URL}/menu/${editingItemId}`
    : `${API_URL}/menu`;
  const method = editingItemId ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const result = await response.json();

    if (response.ok) {
      if (editingItemId) {
        setMenu(menu.map((item) => (item.id === editingItemId ? result : item)));
        toast.success('✏️ Produs actualizat cu succes!', { autoClose: 2000 });
      } else {
        setMenu([...menu, result]);
        toast.success('✅ Produs adăugat cu succes!', { autoClose: 2000 });
      }
      setNewMenuItem({
        name: '',
        description: '',
        price: '',
        image: null,
        isNew: false,
        isPromo: false,
        category: ''
      });
      setEditingItemId(null);
    } else {
      toast.error(`❌ Eroare: ${result.error}`);
    }
  } catch (err) {
    console.error('❌ Eroare rețea:', err);
    toast.error('❌ Serverul nu răspunde.');
  }
};

  const handleDelete = async (id) => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_URL}/menu/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMenu(menu.filter((item) => item.id !== id));
        toast.info('✅ Produs șters cu succes 🗑️', { autoClose: 2000 });
      } else {
        toast.error('❌ Nu s-a putut șterge item-ul.');
      }
    } catch (err) {
      console.error('❌ Eroare la ștergere:', err);
      toast.error('❌ Eroare de rețea la ștergere.');
    }
  };

  const handleEditClick = (item) => {
    setNewMenuItem({
      name: item.name,
      description: item.description,
      price: item.price,
      image: null,
      isNew: item.isNew || false,
      isPromo: item.isPromo || false,
      category: item.category || ''
    });
    setEditingItemId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setNewMenuItem({
      name: '',
      description: '',
      price: '',
      image: null,
      isNew: false,
      isPromo: false,
      category: ''
    });
    setEditingItemId(null);
  };

  return (
    <>
      <Header />
      <div className="container mt-5">
        <h2 className="text-primary mb-4">
          {editingItemId ? 'Editare Item' : 'Administrare Meniu'}
        </h2>

        <form onSubmit={handleAddOrEdit} className="mb-4" encType="multipart/form-data">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Nume item"
                value={newMenuItem.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                name="description"
                placeholder="Descriere"
                value={newMenuItem.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="price"
                placeholder="Preț"
                value={newMenuItem.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                name="category"
                value={newMenuItem.category}
                onChange={handleChange}
                required
              >
                <option value="">Selectează categoria</option>
                <option value="mancare">Mâncare</option>
                <option value="bautura">Băutură</option>
              </select>
            </div>
                        <div className="col-md-2">
              <input
                type="file"
                className="form-control"
                name="image"
                accept="image/*"
                onChange={handleChange}
                required={!editingItemId}
              />
              {editingItemId && (() => {
                const existingItem = menu.find((i) => i.id === editingItemId);
                return existingItem?.image ? (
                  <div className="mt-2">
                    <small>Imagine existentă:</small><br />
                    <img src={existingItem.image} alt="previzualizare" width="100" />
                  </div>
                ) : null;
              })()}
            </div>
            <div className="col-md-1 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                name="isNew"
                id="isNew"
                checked={newMenuItem.isNew}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="isNew">Nou</label>
            </div>
            <div className="col-md-1 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                name="isPromo"
                id="isPromo"
                checked={newMenuItem.isPromo}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="isPromo">Promo</label>
            </div>
            <div className="col-md-1">
              <button type="submit" className="btn btn-success w-100">
                {editingItemId ? 'Salvează' : 'Adaugă'}
              </button>
            </div>
            {editingItemId && (
              <div className="col-md-1">
                <button type="button" className="btn btn-secondary w-100" onClick={handleCancelEdit}>
                  Anulează
                </button>
              </div>
            )}
          </div>
        </form>

        {newMenuItem.name && newMenuItem.description && newMenuItem.price && (newMenuItem.image || editingItemId) && (
          <div className="mb-4">
            <p className="fw-bold">Previzualizare item:</p>
            <ProductCard
              product={{
                ...newMenuItem,
                id: 'preview',
                image:
                  newMenuItem.image instanceof File
                    ? URL.createObjectURL(newMenuItem.image)
                    : newMenuItem.image
              }}
            />
          </div>
        )}

        <div className="row">
          {menu.map((item) => (
            <div key={item.id} className="col-md-4 position-relative">
              <ProductCard product={item} />
              <div className="position-absolute top-0 start-50 translate-middle-x mt-2 d-flex gap-2">
                <button className="btn btn-sm btn-warning" onClick={() => handleEditClick(item)}>
                  ✎
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}
                  onClick={() => handleDelete(item.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}